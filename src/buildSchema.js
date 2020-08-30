const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");

const buildSchema = (resolvers) => {
  const schema = loadSchemaSync("schema.graphql", {
    loaders: [new GraphQLFileLoader()],
  });

  const schemaWithResolvers = addResolversToSchema({
    schema,
    resolvers,
  });
  return schemaWithResolvers;
};

exports.buildSchema = buildSchema;
