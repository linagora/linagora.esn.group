'use strict';

module.exports = () => {
  return {
    denormalize
  };

  function denormalize(group) {
    return {
      id: group._id,
      name: group.name,
      email: group.email,
      creator: group.creator,
      members: group.members
    };
  }
};
