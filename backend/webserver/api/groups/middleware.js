'use strict';

module.exports = dependencies => {
  const authorizationMW = dependencies('authorizationMW');
  const { getById } = require('../../../lib/group')(dependencies);
  const { send500Error, send404Error } = require('../utils');

  return {
    canCreate,
    canList,
    canGet,
    load
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

  function canCreate(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canList(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }

  function canGet(req, res, next) {
    authorizationMW.requiresDomainManager(req, res, next);
  }
};
