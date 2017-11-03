'use strict';

const { OBJECT_TYPE, DEFAULT_OFFSET, DEFAULT_LIMIT, EVENTS } = require('./constants');

module.exports = dependencies => {
  const { Event } = dependencies('core-models');
  const pubsub = dependencies('pubsub').local;
  const mongoose = dependencies('db').mongo.mongoose;
  const Group = mongoose.model('Group');

  return {
    create,
    deleteById,
    getById,
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
      .sort('-timestamps.creation')
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
};
