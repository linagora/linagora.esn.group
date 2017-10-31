'use strict';

const { DEFAULT_OFFSET, DEFAULT_LIMIT, EVENTS } = require('./constants');

module.exports = dependencies => {
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
    return Group.create(group).then(created => {
      pubsub.topic(EVENTS.CREATED).publish(created);

      return created;
    });
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
    return Group.remove({ _id: groupId })
      .exec()
      .then(deleted => {
        if (deleted) {
          pubsub.topic(EVENTS.DELETED).publish(deleted);
        }

        return deleted;
    });
  }

  function updateById(groupId, modified) {
    return Group.findOneAndUpdate({ _id: groupId }, { $set: modified }, { new: true }).exec()
      .then(updated => {
        pubsub.topic(EVENTS.UPDATED).publish(updated);

        return updated;
      });
  }

  function getById(id) {
    return Group.findOne({ _id: id });
  }
};
