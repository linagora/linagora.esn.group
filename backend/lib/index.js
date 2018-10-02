module.exports = dependencies => {
  const coreAvailability = dependencies('availability');
  const collaboration = dependencies('collaboration');
  const constants = require('./constants');
  const models = require('./db')(dependencies);
  const denormalizer = require('./denormalizer')(dependencies);
  const group = require('./group')(dependencies);
  const search = require('./search')(dependencies);

  return {
    constants,
    group,
    models,
    search,
    init
  };

  function init() {
    search.start();
    coreAvailability.email.addChecker({
      name: 'group',
      check(email) {
        return group.getByEmail(email).then(group => !group);
      }
    });
    collaboration.memberDenormalize.registerDenormalizer(constants.OBJECT_TYPE, denormalizer.denormalizeAsMember);
  }
};
