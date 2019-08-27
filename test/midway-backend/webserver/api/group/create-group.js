'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');

describe('The create group API: POST /groups', () => {
  let app, deployOptions, user, domain, lib;
  const password = 'secret';

  beforeEach(function(done) {
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

      done();
    });
  });

  function buildEmail(local) {
    return `${local}@${domain.name}`;
  }

  it('should return 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', '/group/api/groups', done);
  });

  it('should return 400 if no name is given', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({ email: buildEmail('mygroup') });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('name is required');

        done();
      });
    });
  });

  it('should return 400 if name is an object', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({ name: {}, email: 'group@lngr.com' });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('name must be a non-empty string');

        done();
      });
    });
  });

  it('should return 400 if name is an array', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({ name: ['group', 'name'], email: 'group@lngr.com' });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('name must be a non-empty string');

        done();
      });
    });
  });

  it('should return 400 if name is an empty string', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({ name: '  ', email: 'group@lngr.com' });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('name must be a non-empty string');

        done();
      });
    });
  });

  it('should return 400 if no email is given', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({ name: 'group' });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('email is required');

        done();
      });
    });
  });

  it('should return 400 if group email is not a valid email address', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({
        name: 'group',
        email: 'invalid'
      });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('email is not a valid email address');

        done();
      });
    });
  });

  it('should return 400 if group email does not belong to current domain', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({
        name: 'group',
        email: 'email@whatever'
      });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal(`email must belong to domain "${domain.name}"`);

        done();
      });
    });
  });

  it('shoud return 400 if members given is not a list ', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({
        name: 'group',
        email: buildEmail('mygroup'),
        members: 'invalid'
      });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('members must be an array');

        done();
      });
    });
  });

  it('should return 400 if group email is used by another group', function(done) {
    const group = {
      name: 'example',
      email: buildEmail('mygroup')
    };

    lib.group.create(group)
      .then(() => this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
          if (err) {
            return done(err);
          }
          const req = requestAsMember(request(app).post('/group/api/groups/'));

          req.send({
            name: 'another group',
            email: group.email
          });
          req.expect(400);
          req.end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('email is already in use');

            done();
          });
        }))
      .catch(done);
  });

  it('should return 400 if group email is used by user', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send({
        name: 'group',
        email: user.emails[0]
      });
      req.expect(400);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.error.details).to.equal('email is already in use');

        done();
      });
    });
  });

  it('should create group with a filtered list of members, without duplicated or invalid emails', function(done) {
    const group = {
      name: 'groupname',
      email: buildEmail('mygroup'),
      members: [
        'external@outside.org',
        'external@outside.org',
        'invalidemail'
      ]
    };

    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send(group);
      req.expect(201);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.shallowDeepEqual({
          members: [
            {
              member: {
                objectType: 'email',
                id: 'external@outside.org'
              }
            }
          ]
        });
        done();
      });
    });
  });

  it('should create a group with a list of members and convert email member to lower case', function(done) {
    const group = {
      name: 'groupname',
      email: buildEmail('mygroup'),
      members: [
        user.emails[0],
        'User@External.com'
      ]
    };

    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;
      const req = requestAsMember(request(app).post('/group/api/groups'));

      req.send(group);
      req.expect(201);
      req.end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body).to.shallowDeepEqual({
          name: group.name,
          email: group.email,
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
