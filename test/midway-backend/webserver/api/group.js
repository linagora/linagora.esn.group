'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const MODULE_NAME = 'linagora.esn.group';

describe.skip('The groups API', function() {
  let user, app, domain;
  const password = 'secret';

  beforeEach(function(done) {
    const self = this;

    this.helpers.modules.initMidway(MODULE_NAME, function(err) {
      if (err) {
        return done(err);
      }
      const groupApp = require(self.testEnv.backendPath + '/webserver/application')(self.helpers.modules.current.deps);
      const api = require(self.testEnv.backendPath + '/webserver/api')(self.helpers.modules.current.deps, self.helpers.modules.current.lib.lib);

      groupApp.use(require('body-parser').json());
      groupApp.use('/api', api);

      app = self.helpers.modules.getWebServer(groupApp);

      self.helpers.api.applyDomainDeployment('linagora_IT', function(err, models) {
        if (err) {
          return done(err);
        }
        user = models.users[0];
        domain = models.domain;

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(done);
  });

  describe('POST /groups', function() {
    it('should return 401 if not logged in', function(done) {
      this.helpers.api.requireLogin(app, 'post', '/api/groups', done);
    });

    it('should create a group', function(done) {
      const self = this;
      const group = {
        name: 'groupname',
        email: 'group@linagora_IT',
        members: []
      };

      self.helpers.api.loginAsUser(app, user.emails[0], password, function(err, requestAsMember) {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).post('/api/groups'));

        req.set('Host', domain.name);
        req.send(group);
        req.expect(201);
        req.end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.shallowDeepEqual(group);
          done();
        });
      });
    });

    it('should create a group with a list of members', function(done) {
      const self = this;
      const group = {
        name: 'groupname',
        email: 'group@linagora_IT',
        members: [
          user.emails[0],
          'user@external.com'
        ]
      };

      self.helpers.api.loginAsUser(app, user.emails[0], password, function(err, requestAsMember) {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).post('/api/groups'));

        req.set('Host', domain.name);
        req.send(group);
        req.expect(201);
        req.end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.shallowDeepEqual({
            name: 'groupname',
            email: 'group@linagora_IT',
            members: [
              { member: {
                objectType: 'user',
                id: user.id
              }},
              { member: {
                objectType: 'email',
                id: 'user@external.com'
              }}
            ]
          });
          done();
        });
      });
    });
  });

  describe('GET /groups', function() {
    beforeEach(function() {

    });

    it('should return 401 if not logged in', function(done) {
      this.helpers.api.requireLogin(app, 'post', '/api/groups', done);
    });

    it('should return a list of groups', function(done) {
      done();
    });
  });
});
