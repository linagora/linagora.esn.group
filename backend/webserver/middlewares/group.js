'use strict';

module.exports = function(dependencies) {
  const domainModule = dependencies('domain');
  const authorizationMW = dependencies('authorizationMW');

  return {
    canCreateGroup,
    canListGroups,
    canGetGroup
  };

  // Currently we only allow domain admin to use group API
  // This is expected to change in later update with specific middleware

  function canCreateGroup(req, res, next) {
    _loadDomainAndCheckDomainAdmin(req, res, next);
  }

  function canListGroups(req, res, next) {
    _loadDomainAndCheckDomainAdmin(req, res, next);
  }

  function canGetGroup(req, res, next) {
    _loadDomainAndCheckDomainAdmin(req, res, next);
  }

  function _loadDomainAndCheckDomainAdmin(req, res, next) {
    domainModule.load(req.body.domain, (err, domain) => {
      if (err) {
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details: 'Error while loading domain'
          }
        });
      }

      if (!domain) {
        return res.status(400).json({
          error: {
            code: 400,
            message: 'Server Error',
            details: 'Unable to find domain'
          }
        });
      }

      req.domain = domain;

      authorizationMW.requiresDomainManager(req, res, next);
    });
  }
};
