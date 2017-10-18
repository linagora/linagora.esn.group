(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupApiClient', groupApiClient);

  function groupApiClient(groupRestangular) {
    return {
      addMembers: addMembers,
      create: create,
      get: get,
      list: list,
      update: update,
      getMembers: getMembers,
      removeMembers: removeMembers
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
     * Update a group
     * @param  {String} groupId    - The group ID
     * @param  {Object} updateData - The update object, possible attributes are email and name
     * @return {Promise}           - Resolve response with updated group
     */
    function update(groupId, updateData) {
      return groupRestangular.one('groups', groupId).customPOST(updateData);
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

    /**
     * Remove multiple group members
     * @param  {String} groupId                   - The group ID
     * @param  {Array<{objectType, id}>} members  - An array of group member tuples to be removed
     * @return {Promise}                          - Resolve on success
     */
    function removeMembers(groupId, members) {
      return groupRestangular.one('groups', groupId).post('members', members, { action: 'remove' });
    }

    /**
     * Add members to group
     * @param {String} groupId                   The group ID
     * @param {Array<{objectType, id}>} members  An array of member tuples which will be added to group
     * @return {Promise}                         Resolve response with updated group
     */
    function addMembers(groupId, members) {
      return groupRestangular.one('groups', groupId).post('members', members, { action: 'add' });
    }
  }
})(angular);
