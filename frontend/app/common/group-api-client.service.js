(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupApiClient', groupApiClient);

  function groupApiClient(groupRestangular) {
    return {
      create: create,
      get: get,
      list: list,
      getMembers: getMembers
    };

    /**
     * Create a new group
     * @param  {Object} group - The group object, require email
     * @return {Promise}      - Resolve response with created group
     */
    function create(group) {
      return groupRestangular.all('groups').post(group);
    }

    /**
     * Get a group by ID
     * @param  {String} id - The group ID
     * @return {Promise}   - Resolve response with found group
     */
    function get(id) {
      return groupRestangular.one('groups', id).get();
    }

    /**
     * List group
     * @param  {Object} options - Query option, possible attributes are limit and offset
     * @return {Promise}        - Resolve response with group list
     */
    function list(options) {
      return groupRestangular.all('groups').getList(options);
    }

    /**
     * Get group members
     * @param  {String} groupId - The group ID
     * @param  {Object} options - Query option, possible attributes are limit and offset
     * @return {Promise}        - Resolve response with member list
     */
    function getMembers(groupId, options) {
      return groupRestangular.one('groups', groupId).all('members').getList(options);
    }
  }
})(angular);
