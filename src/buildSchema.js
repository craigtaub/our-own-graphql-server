// Lib

const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");

const buildSchema = (resolvers) => {
  const schema = loadSchemaSync("schema.graphql", {
    loaders: [new GraphQLFileLoader()],
  });
  // console.log('User', schema._typeMap.User._fields.address)
  const schemaWithResolvers = addResolversToSchema({
    schema,
    resolvers,
  });
  // console.log('Query ', schemaWithResolvers._typeMap.Query._fields.users.resolve)

  return schemaWithResolvers;
};

// ------------------------------------------->

// Mine

// const { OurGraphQLSchema } = require("./graphql-server/definitions");
// const {
//   addResolversToSchema: ourAddResolversToSchema,
// } = require("./graphql-server/add-resolvers");

// const buildSchema = (resolvers) => {
//   // skipping step turning schema notation into object instances
//   const ourSchema = new OurGraphQLSchema();
//   // console.log('Our Query: ', ourSchema._typeMap.Query.fields.users.resolve)
//   const ourSchemaWithResolvers = ourAddResolversToSchema(ourSchema, resolvers);
//   // console.log('Our Query: ', ourSchemaWithResolvers._typeMap.Query.fields.users.resolve)

//   // return schemaWithResolvers;
//   return ourSchemaWithResolvers;
// };

exports.buildSchema = buildSchema;
