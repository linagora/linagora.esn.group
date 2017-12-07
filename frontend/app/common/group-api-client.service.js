(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupApiClient', groupApiClient);

  function groupApiClient(groupRestangular) {
    return {
      addMembers: addMembers,
      create: create,
      deleteGroup: deleteGroup,
      get: get,
      getFromEmail: getFromEmail,
      list: list,
      update: update,
      getAllMembers: getAllMembers,
      getMembers: getMembers,
      removeMembers: removeMembers,
      search: search
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
     * Get a group from its email
     * @param {String} email - The group email
     */
    function getFromEmail(email) {
      return list({email: email, limit: 1});
    }

    /**
     * List group
     * @param  {Object} options - Query option, possible attributes are limit, offset and email
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
     * Get all the members of a given group
     * @param {String} groupId - The group ID
     */
    function getAllMembers(groupId) {
      return getMembers(groupId, { limit: 0 });
    }

    /**
     * Get group members
     * @param  {String} groupId - The group ID
     * @param  {Object} options - Query option, possible attributes are limit, offset or email
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

    /**
     * Delete group
     * @param  {String} groupId  The group ID
     * @return {Promise}         Resolve on success
     */
    function deleteGroup(groupId) {
      return groupRestangular.one('groups', groupId).remove();
    }

    /**
     * Search group
     * @param {String} query                     The query
     * @param {String || Number} limit           The limit
     * @param {String || Number} offset          The offset
     */
    function search(query, limit, offset) {
      var options = {
        query: query,
        limit: limit,
        offset: offset
      };

      return list(options);
    }
  }
})(angular);
