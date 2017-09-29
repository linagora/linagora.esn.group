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
    return Group
      .find({})
      .skip(+options.offset || DEFAULT_OFFSET)
      .limit(+options.limit || DEFAULT_LIMIT)
      .exec();
  }

  function deleteById(groupId, callback) {
    Group.remove({ _id: groupId }, callback);
  }

  function updateById(groupId, modifiedGroup, callback) {
    const options = { new: true };

    Group.findOneAndUpdate({ _id: groupId }, { $set: modifiedGroup }, options, callback);
  }

  function getById(id) {
    return Group.findOne({ _id: id });
  }
};
