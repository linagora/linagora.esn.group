'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const q = require('q');
const _ = require('lodash');

describe('GET /groups', () => {
  let app, deployOptions, createdGroup1, createdGroup2, user, domain, lib, group1,
    group2, groupNotInSameDomain, esIntervalIndex, ObjectId;
  const password = 'secret';

  beforeEach(function(done) {
    ObjectId = this.testEnv.core.db.mongo.mongoose.Types.ObjectId;
    esIntervalIndex = this.testEnv.serversConfig.elasticsearch.interval_index;
    app = this.helpers.modules.current.app;
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
    this.helpers.api.requireLogin(app, 'post', '/group/api/groups', done);
  });

  it('should respond 200 with a list of groups in the current user domain domain', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      requestAsMember(request(app).get('/group/api/groups'))
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
        requestAsMember(request(app).get(`/group/api/groups?email=${createdGroup1.email}`))
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
        requestAsMember(request(app).get(`/group/api/groups?email=${createdGroup1.email.toUpperCase()}`))
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

  describe('GET /groups?query=', () => {
    it('should search and return 200 with a list of groups that match search query', function(done) {
      setTimeout(() => {
        this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          requestAsMember(request(app).get('/group/api/groups?query=group1'))
            .expect(200)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body.length).to.equal(1);
              expect(res.body).to.shallowDeepEqual([{ id: createdGroup1.id }]);
              done();
            });
        });
      }, esIntervalIndex);
    });
  });
});
