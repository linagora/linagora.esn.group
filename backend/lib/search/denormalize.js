module.exports = {
  denormalize,
  getId
};

function denormalize(group) {
  const result = {
    name: group.name,
    email: group.email
  };

  if (group.domain_ids && group.domain_ids.length) {
    result.domain_id = String(group.domain_ids[0]);
  }

  return result;
}

function getId(group) {
  return String(group._id);
}
