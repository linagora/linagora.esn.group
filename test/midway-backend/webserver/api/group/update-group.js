'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;

const MODULE_NAME = 'linagora.esn.group';

describe('The update group API: POST /groups/:id', () => {
  let app, deployOptions, lib;
  let adminUser, regularUser, domain, group;
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
        adminUser = models.users[0];
        regularUser = models.users[1];
        domain = models.domain;
        lib = this.helpers.modules.current.lib.lib;

        lib.group.create({
            name: 'example',
            email: 'example@lngr.org',
            domain_ids: [domain.id]
          })
          .then(createdGroup => {
            group = createdGroup;
            done();
          })
          .catch(done);
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
    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
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
    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post(`/api/groups/${group.id}`));

      req.expect(400);
      req.send({});
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('Invalid request body');

        done();
      });
    });
  });

  it('should return 400 if email is not valid', function(done) {
    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post(`/api/groups/${group.id}`));

      req.expect(400);
      req.send({ email: 'invalid' });
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('Invalid email address');

        done();
      });
    });
  });

  it('should respond 403 if the logged in user does not have permission to update group (not a domain admin)', function(done) {
    const body = {
      name: 'updated',
      email: 'success@here.now'
    };

    this.helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      requestAsMember(request(app).post(`/api/groups/${group.id}`).send(body))
        .expect(403)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: { code: 403, message: 'Forbidden', details: 'User is not the domain manager' }
          });
          done();
        });
    });
  });

  it('should respond 403 if the logged in user does not have permission to get group members (group belongs to another domain)', function(done) {
    const body = {
      name: 'updated',
      email: 'success@here.now'
    };

    lib.group.create({
        name: 'Other Group',
        domain_ids: [new ObjectId()],
        email: 'example@abc.com'
      })
      .then(createdGroup => {
        this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          requestAsMember(request(app).post(`/api/groups/${createdGroup.id}`).send(body))
            .expect(403)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.deep.equal({
                error: {
                  code: 403,
                  message: 'Forbidden',
                  details: `You do not have permission to perfom action on this group: ${createdGroup.id}`
                }
              });
              done();
            });
        });
      })
      .catch(done);
  });

  it('should return 200 with updated group', function(done) {
    const updatedGroup = {
      name: 'updated',
      email: 'success@here.now'
    };

    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      const req = requestAsMember(request(app).post(`/api/groups/${group.id}`));

      req.expect(200);
      req.send(updatedGroup);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.shallowDeepEqual(updatedGroup);

        done();
      });
    });
  });
});
