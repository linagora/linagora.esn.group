'use strict';

module.exports = {
  OBJECT_TYPE: 'group',
  MODEL_NAME: 'Group',
  MEMBER_TYPES: {
    USER: 'user',
    EMAIL: 'email'
  },
  EVENTS: {
    CREATED: 'group:created',
    DELETED: 'group:deleted',
    UPDATED: 'group:updated'
  },
  DEFAULT_OFFSET: 0,
  DEFAULT_LIMIT: 50
};
