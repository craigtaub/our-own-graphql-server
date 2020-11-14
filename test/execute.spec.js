const { equal, deepEqual } = require("assert");

const {
  scenarioThree,
  scenarioTwo,
  scenarioOne,
} = require("../src/graphql-server/ast");

const {
  execute,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString, // scalar
  GraphQLInt, // scalar
} = require("graphql");
const { ourGraphql } = require("../src/graphql-server");

function executeQuery(document, schema) {
  // return execute({ schema, document });
  return ourGraphql({ schema, document });
}

/*
 - resolver -> usually added from ("@graphql-tools/schema").addResolversToSchema({ schema, resolvers })
*/
describe("graphql execute", () => {
  it("basic root-level with args", async () => {
    let rootQueryTestResolveArgs;

    // build schema
    // type Query {
    //   test(aInt: String!): String!
    // }
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
              rootQueryTestResolveArgs = args;
              // source = undefined
              return "Query.test.name";
            },
          },
        },
      }),
    });

    const result = executeQuery(scenarioOne, schema);

    deepEqual(rootQueryTestResolveArgs, { aInt: "-123" });
    equal(result.data.test, "Query.test.name");
  });

  it("root-level with inner object, root and resolver args", async () => {
    // spies
    let personNameResolveArgs;
    let rootQueryTestResolveArgs;

    // build schema
    // type Query {
    //   test(aInt: Int!): Person!
    // }
    // type Person {
    //   name: String!
    // }
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
            personNameResolveArgs = Object.assign({}, source);
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
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              rootQueryTestResolveArgs = args;
              // source = undefined
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
        },
      }),
    });

    const result = executeQuery(scenarioTwo, schema);

    deepEqual(rootQueryTestResolveArgs, { aInt: -123 });
    deepEqual(personNameResolveArgs, { name: "Query.test.name" });
    deepEqual(result.data.test, { name: "PersonType.name" });
  });

  it("Different root-level with inner", async () => {
    // spies
    let rootQueryTestResolveSpy = false;
    let rootPersonResolveSpy = false;
    let personResolveSource;
    const parentResponse = { name: "wrong name" };

    // build schema
    // type Query {
    //   test(aInt: Int!): Person!
    //   person: Person!
    // }
    // type Person {
    //   name: String!
    // }
    const PersonType = new GraphQLObjectType({
      name: "Person",
      fields: {
        name: {
          type: GraphQLString,
          resolve: (source, args) => {
            personResolveSource = Object.assign({}, source);
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
              aInt: { type: GraphQLInt },
            },
            resolve: (source, args) => {
              rootQueryTestResolveSpy = true;
              return {
                // uses this if no Person.name.resolve found
                name: "Query.test.name",
              };
            },
          },
          // only needed if want to query person at root
          person: {
            type: PersonType,
            resolve: () => {
              rootPersonResolveSpy = true;
              return Object.assign({}, parentResponse);
            },
          },
        },
      }),
    });

    // Root-level person
    const result = executeQuery(scenarioThree, schema);

    equal(rootQueryTestResolveSpy, false);
    equal(rootPersonResolveSpy, true);

    deepEqual(personResolveSource, parentResponse);
    deepEqual(result.data.person, { name: "PersonType.name" });
  });
});
