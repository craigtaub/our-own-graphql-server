const addResolversToSchema = (schema, resolvers) => {
  schema._typeMap.Query._fields.users.resolve = resolvers.Query.users;
  if (resolvers.User) {
    schema._typeMap.User._fields.address.resolve = resolvers.User.address;
  }
  if (resolvers.Address) {
    schema._typeMap.Address._fields.road.resolve = resolvers.Address.road;
  }

  return schema;
};
exports.addResolversToSchema = addResolversToSchema;
