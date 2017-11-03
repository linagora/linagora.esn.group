'use strict';

const q = require('q');
const { DEFAULT_OFFSET, DEFAULT_LIMIT, EVENTS, OBJECT_TYPE, MEMBER_TYPES } = require('./constants');

module.exports = dependencies => {
  const { Event } = dependencies('core-models');
  const pubsub = dependencies('pubsub').local;
  const coreCollaboration = dependencies('collaboration');
  const mongoose = dependencies('db').mongo.mongoose;
  const Group = mongoose.model('Group');

  return {
    create,
    deleteById,
    getById,
    getMemberEmail,
    getAllMembers,
    list,
    updateById
  };

  function create(group) {
    return Group.create(group).then(publish.bind(null, EVENTS.CREATED));
  }

  function list(options = {}) {
    const query = {};

    if (options.email) {
      query.email = options.email;
    }

    if (options.domainId) {
      query.domain_ids = options.domainId;
    }

    return Group
      .find(query)
      .skip(+options.offset || DEFAULT_OFFSET)
      .limit(+options.limit || DEFAULT_LIMIT)
      .sort({ _id: -1 })
      .exec();
  }

  function deleteById(groupId) {
    return Group.findByIdAndRemove(groupId)
      .exec()
      .then(publish.bind(null, EVENTS.DELETED));
  }

  function updateById(groupId, modified) {
    return Group.findOneAndUpdate({ _id: groupId }, { $set: modified }, { new: true })
      .exec()
      .then(publish.bind(null, EVENTS.UPDATED));
  }

  function getById(id) {
    return Group.findOne({ _id: id });
  }

  function publish(topicName, group) {
    if (group) {
      pubsub.topic(topicName).publish(new Event(null, topicName, OBJECT_TYPE, String(group._id), group));
    }

    return group;
  }

  function getMemberEmail(member) {
    if (member.objectType === MEMBER_TYPES.USER) {
      return member.member.preferredEmail;
    } else if (member.objectType === MEMBER_TYPES.EMAIL) {
      return member.member;
    }

    return null;
  }

  function getAllMembers(group) {
    const query = { limit: group.members.length };

    return q.denodeify(coreCollaboration.member.getMembers)(group, OBJECT_TYPE, query);
  }
};
