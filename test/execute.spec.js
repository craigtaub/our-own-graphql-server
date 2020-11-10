const { equal, deepEqual } = require("assert");

const {
  executeSync,
  GraphQLSchema,
  GraphQLObjectType,
  parse,
  GraphQLString, // scalar
  GraphQLInt, // scalar
} = require("graphql");

describe.only("graphql execute", () => {
  it("basic root-level", async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "Query",
        fields: {
          test: {
            type: GraphQLString,
            args: {
              aStr: { type: GraphQLString },
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              // source = undefined
              // args = { aStr: 'String!', aInt: -123 }
              return "Query.test.name";
            },
          },
        },
      }),
    });
    function executeQuery(query) {
      const document = parse(query);
      return executeSync({ schema, document });
    }

    const result = executeQuery('{ test(aInt: -123, aStr: "String!") }');
    // console.log("result:", result.data.test);
    equal(result.data.test, "Query.test.name");
  });

  it("root-level with inner object", async () => {
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
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
              // source = undefined
              // args = { aStr: 'String!', aInt: -123 }
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
        },
      }),
    });
    function executeQuery(query) {
      const document = parse(query);
      return executeSync({ schema, document });
    }

    const result = executeQuery(
      '{ test(aInt: -123, aStr: "String!") { name } }'
    );
    // console.log("result:", result.data.test);
    deepEqual(result.data.test, { name: "PersonType.name" });
  });

  it("Different root-level with inner", async () => {
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
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
              // source = undefined
              // args = { aStr: 'String!', aInt: -123 }
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
          // only needed if want to query person at rool
          person: {
            type: PersonType,
            resolve: () => "",
          },
        },
      }),
    });
    function executeQuery(query) {
      const document = parse(query);
      return executeSync({ schema, document });
    }

    // Root-level person
    const result = executeQuery("{ person { name } }");
    // console.log("result:", result.data.person);
    deepEqual(result.data.person, { name: "PersonType.name" });
  });
});
