const { equal, deepEqual } = require("assert");

const {
  executeSync,
  GraphQLSchema,
  GraphQLObjectType,
  parse,
  GraphQLString, // scalar
  GraphQLInt, // scalar
} = require("graphql");
const { ourGraphql } = require("../src/graphql-server");

function executeQuery(query, schema) {
  const document = parse(query);
  // return executeSync({ schema, document });
  return ourGraphql({ schema, document });
}

describe("graphql execute", () => {
  it("basic root-level with args", async () => {
    let spyArgs;
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "Query",
        fields: {
          test: {
            type: GraphQLString,
            args: {
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              spyArgs = args;
              // source = undefined
              // args = { aStr: 'String!', aInt: -123 }
              return "Query.test.name";
            },
          },
        },
      }),
    });

    const result = executeQuery('{ test(aInt: -123) }', schema);

    deepEqual(spyArgs, { aInt: '-123' });
    equal(result.data.test, "Query.test.name");
  });

  it("root-level with inner object, root and resolver args", async () => {
    let resolverArgs;
    let rootArgs;
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
            resolverArgs = Object.assign({}, source)
            // source = "test resolver"
            // args = {}
            return "PersonType.name";
          },
        },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "Query",
        fields: {
          test: {
            type: PersonType,
            args: {
              aStr: { type: GraphQLString },
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              rootArgs = args;
              // source = undefined
              // args = { aInt: -123 }
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
        },
      }),
    });

    const result = executeQuery(
      '{ test(aInt: -123) { name } }',
      schema
    );

    deepEqual(rootArgs, { aInt: -123 })
    deepEqual(resolverArgs, { name: 'Query.test.name' })
    deepEqual(result.data.test, { name: "PersonType.name" });
  });

  it("Different root-level with inner", async () => {
    let fnSpy = false;
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
            // source = ""
            // args = {}
            return "PersonType.name";
          },
        },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "Query",
        fields: {
          test: {
            type: PersonType,
            args: {
              aStr: { type: GraphQLString },
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              fnSpy = true;
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
          // only needed if want to query person at root
          person: {
            type: PersonType,
            resolve: () => "",
          },
        },
      }),
    });

    // Root-level person
    const result = executeQuery("{ person { name } }", schema);

    equal(fnSpy, false);
    deepEqual(result.data.person, { name: "PersonType.name" });
  });
});
