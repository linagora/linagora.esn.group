'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const q = require('q');
const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;
const MODULE_NAME = 'linagora.esn.group';

describe('GET /groups', () => {
  let app, deployOptions, createdGroup1, createdGroup2, user, domain, lib, group1,
    group2, groupNotInSameDomain;
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
        domain = models.domain;
        lib = this.helpers.modules.current.lib.lib;
        group1 = {
          name: 'group1',
          domain_ids: [domain._id],
          email: 'group1@lngr.com',
          members: []
        };
        group2 = {
          name: 'group2',
          domain_ids: [domain._id],
          email: 'group2@lngr.com',
          members: []
        };
        groupNotInSameDomain = {
          name: 'group3',
          domain_ids: [new ObjectId()],
          email: 'group3@lngr.com',
          members: []
        };

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(err => {
      if (err) return done(err);
      this.testEnv.core.db.mongo.mongoose.connection.close(done);
    });
  });

  beforeEach(function(done) {
    q.all([group1, group2, groupNotInSameDomain].map(lib.group.create))
      .spread((g1, g2) => {
        createdGroup1 = g1;
        createdGroup2 = g2;
        done();
      })
      .catch(done);
  });

  it('should return 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', '/api/groups', done);
  });

  it('should respond 200 with a list of groups in the current user domain domain', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      requestAsMember(request(app).get('/api/groups'))
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.have.length(2);
          expect(_.find(res.body, { id: createdGroup1.id })).to.exist;
          expect(_.find(res.body, { id: createdGroup2.id })).to.exist;
          done();
        });
    });
  });

  describe('GET /groups?email=', () => {
    it('should return 200 with a group matching email query', function(done) {
      this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;
        requestAsMember(request(app).get(`/api/groups?email=${createdGroup1.email}`))
          .expect(200)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.shallowDeepEqual({ id: createdGroup1.id });
            done();
          });
      });
    });

    it('should return 200 with a group matching email query (case insentive)', function(done) {
      this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;
        requestAsMember(request(app).get(`/api/groups?email=${createdGroup1.email.toUpperCase()}`))
          .expect(200)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.shallowDeepEqual({ id: createdGroup1.id });
            done();
          });
      });
    });
  });
});
