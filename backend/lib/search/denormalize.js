module.exports = {
  denormalize,
  getId
};

function denormalize(event) {
  const group = extractGroupFromEvent(event);
  const result = {
    name: group.name,
    email: group.email
  };

  if (group.domain_ids && group.domain_ids.length) {
    result.domain_id = String(group.domain_ids[0]);
  }

  return result;
}

function getId(event) {
  return extractGroupIdFromEvent(event);
}

function extractGroupFromEvent(event) {
  return event.payload;
}

function extractGroupIdFromEvent(event) {
  return String(event.id);
}
