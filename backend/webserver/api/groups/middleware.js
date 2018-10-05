const q = require('q');
const { MEMBER_TYPES } = require('../../../lib/constants');
const emailAddresses = require('email-addresses');
const composableMW = require('composable-middleware');

module.exports = (dependencies, lib) => {
  const authorizationMW = dependencies('authorizationMW');
  const coreTuple = dependencies('tuple');
  const coreUser = dependencies('user');
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
    canGetMembers,
    canUpdate,
    canUpdateMembers,
    load,
    refineGetMembersQuery,
    validateGroupCreation,
    validateGroupUpdate,
    validateMembers
  };

  function load(req, res, next) {
    lib.group.getById(req.params.id)
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

  function validateGroupUpdate(req, res, next) {
    const { name, email } = req.body;

    if (!name && !email) {
      return send400Error('body must contain at least one of these fields: email, name', res);
    }

    if (!email) {
      return next();
    }

    if (emailAddresses.parseOneAddress(email) === null) {
      return send400Error('email is not a valid email address', res);
    }

    lib.group.isEmailAvailableToUse(email, [req.group]).then(available => {
      if (!available) { return send400Error('email is already in use', res); }

      next();
    })
      .catch(err => send500Error('Unable to validate email', err, res));
  }

  function validateGroupCreation(req, res, next) {
    const { name, email, members } = req.body;
    const domain = req.domain;

    if (!name) {
      return send400Error('name is required', res);
    }

    if (typeof name !== 'string' || !name.trim()) {
      return send400Error('name must be a non-empty string', res);
    }

    if (!email) {
      return send400Error('email is required', res);
    }

    const parsedEmail = emailAddresses.parseOneAddress(email);

    if (!parsedEmail) {
      return send400Error('email is not a valid email address', res);
    }

    if (parsedEmail.domain !== domain.name) {
      return send400Error(`email must belong to domain "${domain.name}"`, res);
    }

    if (members && !Array.isArray(members)) {
      return send400Error('members must be an array', res);
    }

    lib.group.isEmailAvailableToUse(email).then(function(available) {
      if (!available) {
        return send400Error('email is already in use', res);
      }

      req.body.members = [...new Set(members)].filter(member => emailAddresses.parseOneAddress(member) !== null);

      next();
    })
      .catch(err => send500Error('Unable to validate email', err, res));
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
    next();
  }

  function canGet(req, res, next) {
    return ensureGroupBoundedToDomain(req, res, next);
  }

  function canGetMembers(req, res, next) {
    return ensureGroupBoundedToDomain(req, res, next);
  }

  function canUpdate(req, res, next) {
    composableMW(
      ensureGroupBoundedToDomain,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  }

  function canUpdateMembers(req, res, next) {
    return canUpdate(req, res, next);
  }

  function ensureGroupBoundedToDomain(req, res, next) {
    if (isGroupBoundedToDomain(req.group, req.domain)) {
      next();
    } else {
      send403Error(`You do not have permission to perfom action on this group: ${req.group.id}`, res);
    }
  }

  function validateMembers(req, res, next) {
    const hasInvalidTuple = req.body.some(tuple => !tuple || !tuple.id || !tuple.objectType || Object.values(MEMBER_TYPES).indexOf(tuple.objectType) === -1);

    if (hasInvalidTuple) {
      return send400Error('body must be an array of valid member tuples {objectType, id}', res);
    }

    next();
  }

  function refineGetMembersQuery(req, res, next) {
    const email = req.query.email;

    if (!email) {
      return next();
    }

    if (emailAddresses.parseOneAddress(email) === null) {
      return res.status(200).json([]);
    }

    let tuple;

    q.denodeify(coreUser.findByEmail)(email)
      .then(user => {
        if (user) {
          tuple = coreTuple.user(user.id);
        } else {
          tuple = coreTuple.email(email);
        }

        req.query.objectTypeFilter = tuple.objectType;
        req.query.idFilter = tuple.id;

        next();
      })
      .catch(err => send500Error('Unable to validate email', err, res));
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
