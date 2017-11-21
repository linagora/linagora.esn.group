'use strict';

const emailAddresses = require('email-addresses');
const CONSTANTS = require('../constants');

module.exports = dependencies => {
  const baseCollaboration = dependencies('db').mongo.models['base-collaboration'];
  const collaborationModule = dependencies('collaboration');

  const GroupDefinition = {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validateEmail, 'Invalid email address']
    }
  };

  const GroupSchema = baseCollaboration(GroupDefinition, CONSTANTS.OBJECT_TYPE);

  return collaborationModule.registerCollaborationModel(CONSTANTS.OBJECT_TYPE, CONSTANTS.MODEL_NAME, GroupSchema);
};

function validateEmail(email) {
  return emailAddresses.parseOneAddress(email) !== null;
}
