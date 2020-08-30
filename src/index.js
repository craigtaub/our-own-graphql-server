const express = require("express");
const { importSchema } = require("graphql-import");
const { graphql } = require("graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const ourGraphQlServer = require("./graphql-server/index");
const { resolvers } = require("./resolvers");

// cant hand introspected schema
const typeDefs = importSchema("schema.graphql");

const query = 'query { users(id: "one") { email } }';
// const query = "query { me { email } }";
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
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
