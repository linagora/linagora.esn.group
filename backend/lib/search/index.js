module.exports = dependencies => {
  const listener = require('./listener')(dependencies);
  const logger = dependencies('logger');

  return {
    start
  };

  function start() {
    logger.info('Subscribing to group events for indexing');
    listener.register();
  }
};
