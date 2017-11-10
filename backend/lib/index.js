'use strict';

module.exports = function(dependencies) {
  const constants = require('./constants');
  const models = require('./db')(dependencies);
  const group = require('./group')(dependencies);
  const search = require('./search')(dependencies);

  return {
    constants,
    group,
    models,
    search
  };
};
