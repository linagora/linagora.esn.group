const { SEARCH } = require('../constants');
const { denormalize } = require('./denormalize');

module.exports = dependencies => {
  const { reindexRegistry } = dependencies('elasticsearch');
  const { listByCursor } = require('../group')(dependencies);
  const { getOptions } = require('./listener')(dependencies);

  return {
    register
  };

  function register() {
    reindexRegistry.register(SEARCH.TYPE_NAME, {
      name: SEARCH.INDEX_NAME,
      buildReindexOptionsFunction: _buildElasticsearchReindexOptions
    });
  }

  function _buildElasticsearchReindexOptions() {
    const options = {
      ...getOptions(),
      denormalize
    };
    const cursor = listByCursor();

    options.name = SEARCH.INDEX_NAME;
    options.next = () => cursor.next();

    return Promise.resolve(options);
  }
};
