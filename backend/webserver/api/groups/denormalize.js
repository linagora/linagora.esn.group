'use strict';

module.exports = dependencies => {
  const { memberDenormalize } = dependencies('collaboration');

  return {
    denormalize,
    denormalizeMember
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

  function denormalizeMember(member) {
    return {
      objectType: member.objectType,
      timestamps: member.timestamps,
      member: memberDenormalize.denormalize(member.objectType, member.member)
    };
  }
};
