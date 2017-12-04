'use strict';

module.exports = function(dependencies) {
  const coreAvailability = dependencies('availability');
  const constants = require('./constants');
  const models = require('./db')(dependencies);
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
  }
};
