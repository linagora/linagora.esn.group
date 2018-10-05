'use strict';

module.exports = {
  OBJECT_TYPE: 'group',
  MODEL_NAME: 'Group',
  MEMBER_TYPES: {
    USER: 'user',
    EMAIL: 'email',
    GROUP: 'group'
  },
  EVENTS: {
    CREATED: 'group:created',
    DELETED: 'group:deleted',
    UPDATED: 'group:updated',
    MEMBERS_ADDED: 'group:members:added',
    MEMBERS_REMOVED: 'group:members:removed'
  },
  SEARCH: {
    TYPE_NAME: 'groups',
    INDEX_NAME: 'groups.idx',
    DEFAULT_SORT_KEY: 'name',
    DEFAULT_SORT_ORDER: 'desc'
  },
  DEFAULT_OFFSET: 0,
  DEFAULT_LIMIT: 50
};
