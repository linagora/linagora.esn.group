'use strict';

const Q = require('q');

module.exports = function(dependencies, lib) {

  const coreUser = dependencies('user');
  const coreTuple = dependencies('tuple');
  const { denormalize } = require('./denormalize')(dependencies);
  const { send500Error } = require('../utils')(dependencies);

  return {
    create,
    list,
    get
  };

  function create(req, res) {
    const group = {
      name: req.body.name,
      creator: req.user._id,
      type: req.body.type,
      email: req.body.email,
      domain_ids: [req.domain._id]
    };
    const memberEmails = req.body.members || [];
    const memberPromises = memberEmails.map(buildMemberFromEmail);

    Q.all(memberPromises)
      .then(members => {
        group.members = members;

        return lib.group.create(group);
      })
      .then(denormalize)
      .then(denormalized => res.status(201).json(denormalized))
      .catch(err => send500Error('Unable to create group', err, res));

    function buildMemberFromEmail(email) {
      return Q.ninvoke(coreUser, 'findByEmail', email)
        .then(user => {
          if (user) {
            return coreTuple.user(user._id);
          }

          return coreTuple.email(email);
        })
        .then(member => ({ member }));
    }
  }

  function list(req, res) {
    const options = {
      limit: +req.query.limit,
      offset: +req.query.offset
    };

    lib.group.list(options)
      .then(groups => groups.map(denormalize))
      .then(denormalized => {
        res.header('X-ESN-Items-Count', denormalized.length);
        res.status(200).json(denormalized);
      })
      .catch(err => send500Error('Unable to list groups', err, res));
  }

  function get(req, res) {
    res.status(200).json(denormalize(req.group));
  }
};
