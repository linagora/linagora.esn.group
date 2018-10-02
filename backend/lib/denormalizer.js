const { MODEL_NAME } = require('./constants');

module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;

  return {
    denormalizeAsMember
  };

  function denormalizeAsMember(group) {
    const GroupModel = mongoose.model(MODEL_NAME);

    group = group instanceof GroupModel ? group : new GroupModel(group).toObject({ virtuals: true }); // So that we have mongoose virtuals
    group.id = group._id;

    return group;
  }
};
