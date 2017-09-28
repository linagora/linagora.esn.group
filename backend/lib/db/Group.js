'use strict';

const CONSTANTS = require('../constants');

module.exports = dependencies => {
  const baseCollaboration = dependencies('db').mongo.models['base-collaboration'];
  const collaborationModule = dependencies('collaboration');

  const GroupDefinition = {
    name: {type: String},
    // collaboration type
    type: {type: String, trim: true, required: true, default: 'open'},
    email: {type: String, required: true, unique: true}
  };

  const GroupSchema = baseCollaboration(GroupDefinition, CONSTANTS.OBJECT_TYPE);

  return collaborationModule.registerCollaborationModel(CONSTANTS.OBJECT_TYPE, CONSTANTS.MODEL_NAME, GroupSchema);
};
