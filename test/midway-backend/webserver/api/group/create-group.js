'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.group';

describe('POST /groups', () => {
  let app, deployOptions, user;
  const password = 'secret';

  beforeEach(function(done) {
    this.helpers.modules.initMidway(MODULE_NAME, err => {
      if (err) {
        return done(err);
      }
      const groupApp = require(this.testEnv.backendPath + '/webserver/application')(this.helpers.modules.current.deps);
      const api = require(this.testEnv.backendPath + '/webserver/api')(this.helpers.modules.current.deps, this.helpers.modules.current.lib.lib);

      groupApp.use(require('body-parser').json());
      groupApp.use('/api', api);

      app = this.helpers.modules.getWebServer(groupApp);
      deployOptions = {
        fixtures: path.normalize(`${__dirname}/../../../fixtures/deployments`)
      };

      this.helpers.api.applyDomainDeployment('groupModule', deployOptions, (err, models) => {
        if (err) {
          return done(err);
        }
        user = models.users[0];

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(done);
  });

  it('should return 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', '/api/groups', done);
  });

  it('should create a group', function(done) {
    const group = {
      name: 'groupname',
      email: 'group@linagora.com',
      members: []
    };

    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post('/api/groups'));

      req.send(group);
      req.expect(201);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.shallowDeepEqual(group);
        done();
      });
    });
  });

  it('should create a group with a list of members', function(done) {
    const group = {
      name: 'groupname',
      email: 'group@linagora.com',
      members: [
        user.emails[0],
        'user@external.com'
      ]
    };

    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post('/api/groups'));

      req.send(group);
      req.expect(201);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.shallowDeepEqual({
          name: 'groupname',
          email: 'group@linagora.com',
          members: [
            {
              member: {
                objectType: 'user',
                id: user.id
              }
            }, {
              member: {
                objectType: 'email',
                id: 'user@external.com'
              }
            }
          ]
        });
        done();
      });
    });
  });
});
