const addResolversToSchema = (schema, resolvers) => {
  // TODO: process each resolver and add to schema
  schema._typeMap.Query.fields.users.resolve = resolvers.Query.users;
  schema._typeMap.User.fields.address.resolve = resolvers.User.address;
  if (resolvers.Address) {
    // resolvers closer to field get priority
    schema._typeMap.Address.fields.road.resolve = resolvers.Address.road;
  }

  return schema;
};
exports.addResolversToSchema = addResolversToSchema;
