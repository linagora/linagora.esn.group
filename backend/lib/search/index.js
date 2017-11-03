const CONSTANTS = require('../constants');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const elasticsearch = dependencies('elasticsearch');
  const listener = require('./listener')(dependencies);

  return {
    search,
    start
  };

  function search(query) {
    return _searchGroups({
      multi_match: {
        query: query.search,
        type: 'cross_fields',
        fields: ['name', 'email'],
        operator: 'and',
        tie_breaker: 0.5
      }
    }, query);
  }

  function _searchGroups(esQuery, query) {
    const offset = query.offset || CONSTANTS.DEFAULT_OFFSET;
    const limit = query.limit || CONSTANTS.DEFAULT_LIMIT;
    const sortKey = query.sortKey || CONSTANTS.SEARCH.DEFAULT_SORT_KEY;
    const sortOrder = query.sortOrder || CONSTANTS.SEARCH.DEFAULT_SORT_ORDER;
    const filters = [];
    const sort = {};

    sort[sortKey] = {
      order: sortOrder
    };

    const elasticsearchQuery = {
      query: {
        bool: {
          must: esQuery
        }
      },
      sort: sort
    };

    if (query.domainId) {
      filters.push({
        term: {
          domain_id: String(query.domainId)
        }
      });
    }

    if (filters.length) {
      elasticsearchQuery.query.bool.filter = {
        and: filters
      };
    }

    logger.debug('Searching groups with options', {
      domainId: query.domainId,
      esQuery,
      offset,
      limit,
      sort
    });

    return new Promise((resolve, reject) => {
      elasticsearch.searchDocuments({
        index: CONSTANTS.SEARCH.INDEX_NAME,
        type: CONSTANTS.SEARCH.TYPE_NAME,
        from: offset,
        size: limit,
        body: elasticsearchQuery
      }, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve({
          total_count: result.hits.total,
          list: result.hits.hits
        });
      });
    });
  }

  function start() {
    logger.info('Subscribing to group events for indexing');
    listener.register();
  }
};
