'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.group';

describe('GET /groups/:id', () => {
  let app, deployOptions, user, lib, group;
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

  it('should return 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'get', '/api/groups/groupId', done);
  });

  it('should return 404 if group is not found', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).get('/api/groups/invalid'));

      req.expect(404);
      req.end(done);
    });
  });

  it('should return 200 with the requested group', function(done) {
    lib.group.create(group)
      .then(created => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          if (err) {
            return done(err);
          }
          const req = requestAsMember(request(app).get(`/api/groups/${String(created._id)}`));

          req.expect(200);
          req.end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.shallowDeepEqual(Object.assign({ id: String(created._id) }, group));
            done();
          });
        }))
      .catch(done);
  });
});
