'use strict';

const emailAddresses = require('email-addresses');
const composableMW = require('composable-middleware');

module.exports = dependencies => {
  const authorizationMW = dependencies('authorizationMW');
  const { getById } = require('../../../lib/group')(dependencies);
  const {
    send400Error,
    send403Error,
    send404Error,
    send500Error
  } = require('../utils')(dependencies);

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
    composableMW(
      ensureGroupBoundedToDomain,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  }

  function canList(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canGet(req, res, next) {
    composableMW(
      ensureGroupBoundedToDomain,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  }

  function canUpdate(req, res, next) {
    composableMW(
      ensureGroupBoundedToDomain,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  }

  function ensureGroupBoundedToDomain(req, res, next) {
    if (isGroupBoundedToDomain(req.group, req.domain)) {
      next();
    } else {
      send403Error(`You do not have permission to perfom action on this group: ${req.group.id}`, res);
    }
  }
};

function isGroupBoundedToDomain(group, domain) {
  if (!group) {
    throw new Error('Group cannot be null');
  }

  if (!domain) {
    throw new Error('Domain cannot be null');
  }

  if (Array.isArray(group.domain_ids)) {
    return group.domain_ids.some(domainId => String(domainId) === domain.id);
  }

  return false;
}
