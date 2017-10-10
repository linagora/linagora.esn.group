'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.group';

describe('GET /groups/:id/members', () => {
  let app, deployOptions, user, lib, group, createdGroup;
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
        lib = this.helpers.modules.current.lib.lib;
        group = {
          name: 'Group',
          email: 'example@lngr.com',
          members: [
            {
              member: {
                id: 'outsider@external.org',
                objectType: 'email'
              }
            }, {
              member: {
                id: String(user._id),
                objectType: 'user'
              }
            }
          ]
        };

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(done);
  });

  beforeEach(function(done) {
    lib.group.create(group)
      .then(group => {
        createdGroup = group;
        done();
      })
      .catch(done);
  });

  it('should respond 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'get', `/api/groups/${createdGroup.id}/members`, done);
  });

  it('should respond 404 if group is not found', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).get('/api/groups/invalid/members'));

      req.expect(404);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('Group not found');

        done();
      });
    });
  });

  it('should respond 200 with member list', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }

      requestAsMember(request(app).get(`/api/groups/${createdGroup.id}/members`))
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.have.length(createdGroup.members.length);
          done();
        });
    });
  });
});
