const Q = require('q');

module.exports = dependencies => {
  const searchLib = require('../search')(dependencies);
  const groupLib = require('../group')(dependencies);

  return ({ term, context, pagination }) => {
    const query = {
      search: term,
      limit: pagination.limit,
      userId: String(context.user._id),
      domainId: String(context.domain._id)
    };

    return searchLib.search(query)
      .then(searchResult => searchResult.list.map(group => groupLib.getById(group._id)))
      .then(promises => Q.allSettled(promises))
      .then(resolvedGroups => resolvedGroups.filter(_ => _.state === 'fulfilled').map(_ => _.value))
      .then(resolvedGroups => resolvedGroups.filter(Boolean))
      .then(groups => (groups || []));
  };
};
