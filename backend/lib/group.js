'use strict';

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

  function create(options, callback) {
    const group = new Group(options);

    group.save((err, saved) => {
      if (err) {
        callback(err);
      }

      callback(null, saved);
    });
  }

  function list(options = {}, callback) {
    const sort = 'timestamps.creation';

    let groupQuery = Group.find({});

    Group.find(groupQuery).count().exec((err, count) => {
      if (err) {
        return callback(err);
      }

      groupQuery = groupQuery.skip(options.offset);

      if (options.limit > 0) {
        groupQuery = groupQuery.limit(options.limit);
      }

        groupQuery.sort(sort).exec((err, groups) => {
          if (err) {
            return callback(err);
          }

          callback(null, {
            total_count: count,
            list: groups || []
          });
        });
    });
  }

  function deleteById(groupId, callback) {
    Group.remove({ _id: groupId }, callback);
  }

  function updateById(groupId, modifiedGroup, callback) {
    const options = { new: true };

    Group.findOneAndUpdate({ _id: groupId }, { $set: modifiedGroup }, options, callback);
  }

  function getById(id, callback) {
    Group.findById(id).exec(callback);
  }
};
