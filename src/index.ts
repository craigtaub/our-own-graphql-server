import express, { Request, Response } from "express";
import { importSchema } from "graphql-import";
import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import ourGraphQlServer from "./graphql-server";
import { resolvers } from "./resolvers";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!" + ourGraphQlServer);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
