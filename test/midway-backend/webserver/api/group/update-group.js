'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.group';

describe('POST /groups/:id', () => {
  let app, deployOptions, user, lib;
  const password = 'secret';
  const group = {
    name: 'example',
    email: 'example@lngr.org',
    members: []
  };

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
        lib = this.helpers.modules.current.lib.lib;

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(done);
  });

  it('should return 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', '/api/groups/invalid', done);
  });

  it('should return 404 if group not found', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post('/api/groups/invalid'));

      req.expect(404);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('Group not found');

        done();
      });
    });
  });

  it('should return 400 if no name and email given', function(done) {
    lib.group.create(group)
      .then(created => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).post(`/api/groups/${String(created._id)}`));

        req.expect(400);
        req.send({});
        req.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('Invalid request body');

          done();
        });
      }))
      .catch(done);
  });

  it('should return 400 if email is not valid', function(done) {
    lib.group.create(group)
      .then(created => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).post(`/api/groups/${String(created._id)}`));

        req.expect(400);
        req.send({ email: 'invalid' });
        req.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('Invalid email address');

          done();
        });
      }))
      .catch(done);
  });

  it('should return 200 with updated group', function(done) {
    const updatedGroup = {
      name: 'updated',
      email: 'success@here.now'
    };

    lib.group.create(group)
      .then(created => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).post(`/api/groups/${String(created._id)}`));

        req.expect(200);
        req.send(updatedGroup);
        req.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.shallowDeepEqual(updatedGroup);

          done();
        });
      }))
      .catch(done);
  });
});
