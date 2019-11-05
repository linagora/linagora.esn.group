module.exports = dependencies => {
  const peopleModule = dependencies('people');
  const searcher = require('./searcher')(dependencies);
  const resolver = require('./resolver')(dependencies);
  const denormalizer = require('./denormalizer')(dependencies);
  const RESOLVER_PRIORITY = 90;

  return {
    init
  };

  function init() {
    peopleModule.service.addSearcher(new peopleModule.PeopleSearcher('group', searcher, denormalizer));
    peopleModule.service.addResolver(new peopleModule.PeopleResolver('group', resolver, denormalizer, RESOLVER_PRIORITY));
  }
};
