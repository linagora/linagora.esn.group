'use strict';

// arguments: dependencies
module.exports = function(dependencies) {

  const model = require('./Group')(dependencies);

  return {
    model
  };
};
