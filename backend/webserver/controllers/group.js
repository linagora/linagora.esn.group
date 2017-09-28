'use strict';

const Q = require('q');

module.exports = function(dependencies, lib) {

  const userModule = dependencies('user');
  const utils = require('./utils')(dependencies);
  const DEFAULT_OFFSET = 0;
  const DEFAULT_LIMIT = 50;

  return {
    create,
    list,
    get
  };

  function create(req, res) {
    const memberEmails = req.body.members || [];

    const getUserPromises = memberEmails.map(email => Q.ninvoke(userModule, 'findByEmail', email));

    Q.all(getUserPromises)
      .then(results => {
        const group = {
          name: req.body.name,
          type: req.body.type,
          email: req.body.email,
          members: _getMembers(results, memberEmails)
        };

        if (req.body.domain) {
          group.domain_ids = [req.body.domain];
        }

        lib.group.create(group, (err, result) => {
          if (err) {
            return utils.sendStatus500Error('Error while creating group', err, res);
          }

          return res.status(200).json(result);
        });
      })
      .catch(err => utils.sendStatus500Error('Unable to retrieve user from email', err, res));
  }

  function list(req, res) {
    const options = {
      limit: +req.query.limit || DEFAULT_LIMIT,
      offset: +req.query.offset || DEFAULT_OFFSET
    };

    lib.group.list(options, (err, groups) => {
      if (err) {
        return utils.sendStatus500Error('Error while getting groups', err, res);
      }

      res.header('X-ESN-Items-Count', groups.total_count || 0);
      res.status(200).json(groups);
    });
  }

  function get(req, res) {
    lib.group.getById(req.params.id, (err, group) => {
      if (err) {
        return utils.sendStatus500Error('Error while getting group', err, res);
      }

      res.status(200).json(group);
    });
  }

  function _getMembers(data, memberEmails) {
    return data.map((user, index) => {
      if (!user) {
        return {
          member: {
            id: memberEmails[index],
            objectType: 'email'
          }
        };
      }

      return {
        member: {
          id: user._id,
          objectType: 'user'
        }
      };
    });
  }
};
