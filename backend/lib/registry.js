const handlers = {};

module.exports = dependencies => {
  const logger = dependencies('logger');

  return {
    getHandlers,
    register
  };

  function register(name, handler) {
    if (handlers[name]) {
      logger.error(`Handler with ${name} is taken`);

      return;
    }

    handlers[name] = handler;
  }

  function getHandlers() {
    return Object.values(handlers);
  }
};
