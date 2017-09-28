'use strict';

module.exports = function(dependencies) {

  const models = require('./db')(dependencies);
  const group = require('./group')(dependencies);

  return {
    group,
    models
  };
};
