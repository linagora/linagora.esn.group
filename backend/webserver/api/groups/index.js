'use strict';

const { MODEL_NAME } = require('../../../lib/constants');

module.exports = function(dependencies, lib, router) {

  const authorizationMW = dependencies('authorizationMW');
  const domainMW = dependencies('domainMW');
  const helperMW = dependencies('helperMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies);

  router.post('/groups',
    authorizationMW.requiresAPILogin,
    domainMW.loadDomainByHostname,
    middleware.canCreate,
    controller.create
  );

  router.get('/groups',
    authorizationMW.requiresAPILogin,
    domainMW.loadDomainByHostname,
    middleware.canList,
    controller.list
  );

  router.get('/groups/:id',
    authorizationMW.requiresAPILogin,
    domainMW.loadDomainByHostname,
    helperMW.checkIdInParams('id', MODEL_NAME),
    middleware.canGet,
    middleware.load,
    controller.get
  );
};
