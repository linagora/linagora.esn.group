'use strict';

/* eslint-disable no-console, no-process-env */

const chai = require('chai');
const path = require('path');
const testConfig = require('../config/servers-conf');
const EsConfig = require('esn-elasticsearch-configuration');
const basePath = path.resolve(__dirname + '/../../node_modules/linagora-rse');
const backendPath = path.normalize(__dirname + '/../../backend');
const MODULE_NAME = 'linagora.esn.group';
let rse;

before(function(done) {
  chai.use(require('chai-shallow-deep-equal'));
  chai.use(require('sinon-chai'));
  chai.use(require('chai-as-promised'));

  this.testEnv = {
    serversConfig: testConfig,
    basePath: basePath,
    backendPath: backendPath,
    fixtures: path.resolve(basePath, 'test/midway-backend/fixtures'),
    mongoUrl: testConfig.mongodb.connectionString,
    initCore(callback) {
      rse.core.init(() => { callback && process.nextTick(callback); });
    }
  };

  process.env.NODE_CONFIG = 'test/config';
  process.env.NODE_ENV = 'test';
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = 6379;
  process.env.AMQP_HOST = 'rabbitmq';
  process.env.ES_HOST = 'elasticsearch';

  rse = require('linagora-rse');
  this.helpers = {};
  this.testEnv.core = rse.core;
  this.testEnv.moduleManager = rse.moduleManager;
  rse.test.helpers(this.helpers, this.testEnv);
  rse.test.moduleHelpers(this.helpers, this.testEnv);
  rse.test.apiHelpers(this.helpers, this.testEnv);

  const manager = this.testEnv.moduleManager.manager;
  const nodeModulesPath = path.normalize(
    path.join(__dirname, '../../node_modules/')
  );

  const loader = manager.loaders.code(require('../../index.js'), true);
  const nodeModulesLoader = manager.loaders.filesystem(nodeModulesPath, true);

  manager.appendLoader(loader);
  manager.appendLoader(nodeModulesLoader);

  loader.load(MODULE_NAME, done);
});

before(function(done) {
  this.helpers.modules.initMidway(MODULE_NAME, err => {
    if (err) {
      return done(err);
    }

    const expressApp = require(this.testEnv.backendPath + '/webserver/application')(this.helpers.modules.current.deps);
    const api = require(this.testEnv.backendPath + '/webserver/api')(this.helpers.modules.current.deps, this.helpers.modules.current.lib.lib);

    expressApp.use(require('body-parser').json());
    expressApp.use('/group/api', api);

    this.helpers.modules.current.app = this.helpers.modules.getWebServer(expressApp);

    this.helpers.modules.current.lib.lib.init();
    done();
  });
});

beforeEach(function(done) {
  const esnConf = new EsConfig({
    host: this.testEnv.serversConfig.elasticsearch.host,
    port: this.testEnv.serversConfig.elasticsearch.port
  });

  esnConf.setup('groups.idx', 'groups')
  .then(() => done())
  .catch(err => {
    console.error('Error while setup ES indices', err);
    done();
  });
});

afterEach(function(done) {
  const esnConf = new EsConfig({
    host: this.testEnv.serversConfig.elasticsearch.host,
    port: this.testEnv.serversConfig.elasticsearch.port
  });

  esnConf.deleteIndex('groups.idx', 'groups')
  .then(() => done())
  .catch(err => {
    console.error('Error while clear ES indices', err);
    done();
  });
});

afterEach(function(done) {
  this.helpers.mongo.dropDatabase(err => done(err));
});
