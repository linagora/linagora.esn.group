module.exports = dependencies => {
  const groupLib = require('../group')(dependencies);
  const { FIELD_TYPES } = dependencies('people').constants;

  return ({ fieldType, value, context }) => {
    if (fieldType === FIELD_TYPES.EMAIL_ADDRESS) {
      return groupLib.getByEmail(value, {
        domainIds: [context.domain._id]
      });
    }

    return Promise.resolve();
  };
};
