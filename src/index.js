const express = require("express");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");
const { graphql } = require("graphql");
const ourGraphQlServer = require("./graphql-server/index");
const { resolvers } = require("./resolvers");

const schema = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

const query = 'query { users(id: "one") { email } }';
// const query = "query { me { email } }";
graphql(schema, query).then((result) => {
  console.log(result);
});

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!" + ourGraphQlServer);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
