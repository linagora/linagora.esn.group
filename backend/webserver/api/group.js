'use strict';

module.exports = function(dependencies, lib, router) {

  const authorizationMW = dependencies('authorizationMW');
  const controller = require('../controllers/group')(dependencies, lib);
  const middleware = require('../middlewares/group')(dependencies);

  router.post('/groups', authorizationMW.requiresAPILogin, middleware.canCreateGroup, controller.create);
  router.get('/groups', authorizationMW.requiresAPILogin, middleware.canListGroups, controller.list);
  router.get('/groups/:id', authorizationMW.requiresAPILogin, middleware.canGetGroup, controller.get);
};
