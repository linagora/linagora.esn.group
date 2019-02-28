module.exports = {
  denormalize,
  denormalizeFromEvent,
  getId
};

function denormalizeFromEvent(event) {
  const group = extractGroupFromEvent(event);

  return denormalize(group);
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
