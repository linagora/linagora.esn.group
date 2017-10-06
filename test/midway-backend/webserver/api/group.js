'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const q = require('q');
const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;
const MODULE_NAME = 'linagora.esn.group';

describe('The groups API', () => {
  let app, deployOptions, user, domain, lib;
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
        fixtures: path.normalize(`${__dirname}/../../fixtures/deployments`)
      };

      this.helpers.api.applyDomainDeployment('groupModule', deployOptions, (err, models) => {
        if (err) {
          return done(err);
        }
        user = models.users[0];
        domain = models.domain;
        lib = this.helpers.modules.current.lib.lib;

        done();
      });
    });
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(done);
  });

  describe('POST /groups', () => {
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

  describe('GET /groups', () => {
    let createdGroup1, createdGroup2;

    beforeEach(function(done) {
      const group1 = {
        name: 'group1',
        domain_ids: [domain._id],
        email: 'group1@lngr.com',
        members: []
      };
      const group2 = {
        name: 'group2',
        domain_ids: [domain._id],
        email: 'group2@lngr.com',
        members: []
      };
      const groupNotInSameDomain = {
        name: 'group3',
        domain_ids: [new ObjectId()],
        email: 'group3@lngr.com',
        members: []
      };

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
    });
  });

  describe('GET /groups/:id', () => {
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
      const group = {
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

  describe('GET /groups/:id/members', function() {
    let createdGroup;

    beforeEach(function(done) {
      const group = {
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

  describe('POST /groups/:id', () => {
    const group = {
      name: 'example',
      email: 'example@lngr.org',
      members: []
    };

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

  describe('DELETE /groups/:id', () => {
    const group = {
      name: 'example',
      email: 'example@lngr.org',
      members: []
    };

    it('should return 401 if not logged in', function(done) {
      this.helpers.api.requireLogin(app, 'delete', '/api/groups/groupid', done);
    });

    it('should return 404 if group not found', function(done) {
      this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
        if (err) {
          return done(err);
        }
        const req = requestAsMember(request(app).delete('/api/groups/invalid'));

        req.expect(404);
        req.end(done);
      });
    });

    it('should return 204 after deleting group', function(done) {
      lib.group.create(group)
        .then(created => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          if (err) {
            return done(err);
          }
          const req = requestAsMember(request(app).delete(`/api/groups/${String(created._id)}`));

          req.expect(204);
          req.end(err => {
            expect(err).to.not.exist;

            done();
          });
        }))
        .catch(done);
    });
  });
});
