module.exports = dependencies => {
  const { Model } = dependencies('people');

  return ({ source }) => {
    const email = new Model.EmailAddress({ value: source.email });
    const name = new Model.Name({ displayName: source.name });

    return Promise.resolve(
      new Model.Person({
        id: String(source._id),
        objectType: 'group',
        emailAddresses: [email],
        names: [name]
      })
    );
  };
};
