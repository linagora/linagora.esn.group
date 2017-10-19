'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;

const MODULE_NAME = 'linagora.esn.group';

describe('The get group members API: GET /groups/:id/members', () => {
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
            name: 'Group',
            email: 'example@lngr.com',
            domain_ids: [domain.id],
            members: [
              {
                member: {
                  id: 'outsider@external.org',
                  objectType: 'email'
                }
              }, {
                member: {
                  id: adminUser.id,
                  objectType: 'user'
                }
              }
            ]
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

  it('should respond 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'get', `/api/groups/${group.id}/members`, done);
  });

  it('should respond 404 if group is not found', function(done) {
    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }
      requestAsMember(request(app).get(`/api/groups/${new ObjectId()}/members`))
        .expect(404)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('Group not found');
          done();
        });
    });
  });

  it('should respond 403 if the logged in user does not have permission to get group members (not a domain admin)', function(done) {
    this.helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      requestAsMember(request(app).get(`/api/groups/${group.id}/members`))
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
    lib.group.create({
        name: 'Other Group',
        domain_ids: [new ObjectId()],
        email: 'example@abc.com'
      })
      .then(createdGroup => {
        this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
          expect(err).to.not.exist;
          requestAsMember(request(app).get(`/api/groups/${createdGroup.id}/members`))
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

  it('should respond 200 with member list', function(done) {
    this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      if (err) {
        return done(err);
      }

      requestAsMember(request(app).get(`/api/groups/${group.id}/members`))
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.have.length(group.members.length);

          const members = group.members.map(member => ({
            objectType: member.member.objectType,
            id: member.member.id,
            timestamps: {},
            member: member.member.objectType === 'email' ? member.member.id : {}
          }));

          expect(res.body).to.shallowDeepEqual(members);
          done();
        });
    });
  });
});
