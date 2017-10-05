'use strict';

const { DEFAULT_OFFSET, DEFAULT_LIMIT } = require('./constants');

module.exports = dependencies => {
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
    return Group.create(group);
  }

  function list(options = {}) {
    const query = {};

    if (options.email) {
      query.email = options.email;
    }

    return Group
      .find(query)
      .skip(+options.offset || DEFAULT_OFFSET)
      .limit(+options.limit || DEFAULT_LIMIT)
      .sort('-timestamps.creation')
      .exec();
  }

  function deleteById(groupId) {
    return Group.remove({ _id: groupId }).exec();
  }

  function updateById(groupId, modified) {
    return Group.findOneAndUpdate({ _id: groupId }, { $set: modified }, { new: true }).exec();
  }

  function getById(id) {
    return Group.findOne({ _id: id });
  }
};
