'use strict';

const emailAddresses = require('email-addresses');

module.exports = dependencies => {
  const authorizationMW = dependencies('authorizationMW');
  const { getById } = require('../../../lib/group')(dependencies);
  const { send500Error, send404Error, send400Error } = require('../utils')(dependencies);

  return {
    canCreate,
    canDelete,
    canList,
    canGet,
    canUpdate,
    load,
    validateNameAndEmail
  };

  function load(req, res, next) {
    getById(req.params.id)
      .then(group => {
        if (group) {
          req.group = group;
          next();
        } else {
          send404Error('Group not found', res);
        }
      })
      .catch(err => send500Error('Unable to load group', err, res));
  }

  function validateNameAndEmail(req, res, next) {
    if (!req.body.name && !req.body.email) {
      return send400Error('Invalid request body', res);
    }

    if (emailAddresses.parseOneAddress(req.body.email) === null) {
      return send400Error('Invalid email address', res);
    }

    next();
  }

  function canCreate(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canDelete(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canList(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canGet(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canUpdate(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }
};
