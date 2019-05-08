'use strict';

const { MODEL_NAME } = require('../../../lib/constants');

module.exports = function(dependencies, lib, router) {

  const authorizationMW = dependencies('authorizationMW');
  const domainMW = dependencies('domainMW');
  const helperMW = dependencies('helperMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies, lib);

   /**
   * @swagger
   * /groups:
   *   post:
   *     tags:
   *       - Groups
   *     description: Create group
   *     parameters:
   *       - $ref: "#/parameters/group_name"
   *       - $ref: "#/parameters/group_email"
   *       - $ref: "#/parameters/group_member_emails"
   *     responses:
   *       201:
   *         $ref: "#/responses/group"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/groups',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    middleware.canCreate,
    middleware.validateGroupCreation,
    controller.create
  );

  /**
   * @swagger
   * /groups:
   *   get:
   *     tags:
   *       - Groups
   *     description:
   *       List groups in current domain
   *     parameters:
   *       - $ref: "#/parameters/cm_limit"
   *       - $ref: "#/parameters/cm_offset"
   *     responses:
   *       200:
   *         $ref: "#/responses/groups"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/groups',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    middleware.canList,
    controller.list
  );

  /**
   * @swagger
   * /groups/{group_id}:
   *   get:
   *     tags:
   *       - Groups
   *     description:
   *       Get group by id
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/group"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/groups/:id',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    helperMW.checkIdInParams('id', MODEL_NAME),
    middleware.load,
    middleware.canGet,
    controller.get
  );

  /**
   * @swagger
   * /groups/{group_id}:
   *   post:
   *     tags:
   *       - Groups
   *     description:
   *       Update group by id
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *       - $ref: "#/parameters/group_name"
   *       - $ref: "#/parameters/group_email"
   *     responses:
   *       200:
   *         $ref: "#/responses/group"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/groups/:id',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    helperMW.checkIdInParams('id', MODEL_NAME),
    middleware.load,
    middleware.canUpdate,
    middleware.validateGroupUpdate,
    controller.update
  );

  /**
   * @swagger
   * /groups/{group_id}:
   *   delete:
   *     tags:
   *       - Groups
   *     description:
   *       Delete group by id
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.delete('/groups/:id',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    helperMW.checkIdInParams('id', MODEL_NAME),
    middleware.load,
    middleware.canDelete,
    controller.deleteGroup
  );

  /**
   * @swagger
   * /groups/{group_id}/members:
   *   get:
   *     tags:
   *       - Members
   *     description:
   *       Get members of a group
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *       - $ref: "#/parameters/cm_limit"
   *       - $ref: "#/parameters/cm_offset"
   *     responses:
   *       200:
   *         $ref: "#/responses/group_members"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/groups/:id/members',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    helperMW.checkIdInParams('id', MODEL_NAME),
    middleware.load,
    middleware.canGetMembers,
    middleware.refineGetMembersQuery,
    controller.getMembers
  );

  /**
   * @swagger
   * /groups/{group_id}/members:
   *   post:
   *     tags:
   *       - Members
   *     description:
   *       Update member list of a group
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *       - $ref: "#/parameters/group_members"
   *       - $ref: "#/parameters/action"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/groups/:id/members',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    helperMW.checkIdInParams('id', MODEL_NAME),
    helperMW.requireInQuery('action'),
    helperMW.requireBodyAsArray,
    middleware.validateMembers,
    middleware.load,
    middleware.canUpdateMembers,
    controller.updateMembers
  );
};
