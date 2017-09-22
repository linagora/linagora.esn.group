'use strict';

module.exports = dependencies => {
  const baseCollaboration = dependencies('db').mongo.models['base-collaboration'];
  const collaborationModule = dependencies('collaboration');

  const GroupDefinition = {
    name: {type: String},
    // collaboration type
    type: {type: String, trim: true, required: true, default: 'open'},
    email: {type: String, required: true, unique: true}
  };

  const GroupSchema = baseCollaboration(GroupDefinition, 'group');

  return collaborationModule.registerCollaborationModel('group', 'group', GroupSchema);
};
