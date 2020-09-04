const addResolversToSchema = (schema, resolvers) => {
  
  // TODO: process each resolver and add to schema
  schema._typeMap.Query.fields.users.resolve = resolvers.Query.users;
  schema._typeMap.User.fields.address.resolve = resolvers.User.address;

  return schema;
}
exports.addResolversToSchema = addResolversToSchema;