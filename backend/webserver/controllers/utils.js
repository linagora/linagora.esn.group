'use strict';

module.exports = dependencies => {
  const logger = dependencies('logger');

  return {
    sendStatus500Error
  };

  function sendStatus500Error(details, err, res) {
    logger.error(details, err);

    return res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details
      }
    });
  }
};
