'use strict';

module.exports = function(dependencies) {

  const models = require('./db')(dependencies);
  const group = require('./group')(dependencies);
  const search = require('./search')(dependencies);

  return {
    group,
    models,
    search
  };
};
