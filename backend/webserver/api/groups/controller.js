'use strict';

const q = require('q');
const { OBJECT_TYPE } = require('../../../lib/constants');

module.exports = function(dependencies, lib) {
  const coreUser = dependencies('user');
  const coreTuple = dependencies('tuple');
  const coreCollaboration = dependencies('collaboration');
  const { denormalize, denormalizeMember } = require('./denormalize')(dependencies);
  const { send500Error, send400Error } = require('../utils')(dependencies);

  return {
    create,
    deleteGroup,
    list,
    get,
    getMembers,
    update,
    updateMembers
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

    q.all(memberPromises)
      .then(members => {
        group.members = members;

        return lib.group.create(group);
      })
      .then(denormalize)
      .then(denormalized => res.status(201).json(denormalized))
      .catch(err => send500Error('Unable to create group', err, res));

    function buildMemberFromEmail(email) {
      return q.ninvoke(coreUser, 'findByEmail', email)
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
      offset: +req.query.offset,
      email: req.query.email,
      domainId: req.domain.id
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

  function getMembers(req, res) {
    const query = {
      limit: +req.query.limit,
      offset: +req.query.offset
    };

    q.denodeify(coreCollaboration.member.getMembers)(req.group, OBJECT_TYPE, query)
      .then(members => members.map(denormalizeMember))
      .then(members => {
        res.header('X-ESN-Items-Count', members.length);
        res.status(200).json(members);
      })
      .catch(err => send500Error('Unable to list group members', err, res));
  }

  function update(req, res) {
    const options = {};

    if (req.body.name) {
      options.name = req.body.name;
    }

    if (req.body.email) {
      options.email = req.body.email;
    }

    lib.group.updateById(req.group._id, options)
      .then(denormalize)
      .then(denormalized => res.status(200).json(denormalized))
      .catch(err => send500Error('Unable to update group info', err, res));
  }

  function deleteGroup(req, res) {
    lib.group.deleteById(req.params.id)
      .then(() => res.status(204).end())
      .catch(err => send500Error('Unable to delete group', err, res));
  }

  function updateMembers(req, res) {
    const members = req.body;

    if (req.query.action === 'remove') {
      return q.denodeify(coreCollaboration.member.removeMembers)(req.group, members)
        .then(() => res.status(204).end())
        .catch(err => send500Error('Unable to remove members', err, res));
    }

    if (req.query.action === 'add') {
      return q.denodeify(coreCollaboration.member.addMembers)(req.group, members)
        .then(denormalize)
        .then(denormalized => res.status(200).json(denormalized))
        .catch(err => send500Error('Unable to add members', err, res));
    }

    send400Error(`${req.query.action} is not a valid action on members (add, remove)`, res);
  }
};
