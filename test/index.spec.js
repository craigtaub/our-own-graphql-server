const { equal } = require("assert");
const { resolvers } = require("../src/resolvers");
const { buildSchema } = require("../src/buildSchema");
const { ourGraphql } = require("../src/graphql-server");

const stringify = (object) => JSON.stringify(object);

describe("graphql server example", () => {
  it.only("should return existing users email", async () => {
    const schema = buildSchema(resolvers);
    const query = 'query { users(id: "one") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: {
          email: "some@email.com",
        },
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it.only("should return existing users address", async () => {
    const schema = buildSchema(resolvers);
    const query = 'query { users(id: "one") { address { road } } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: {
          address: {
            road: "some road",
          },
        },
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it.only('should use resolver for "Address" over "User", if exists', async () => {
    const clonedResolvers = Object.assign(
      {
        Address: {
          road: () => "updated resolver road",
        },
      },
      resolvers
    );
    const schema = buildSchema(clonedResolvers);
    const query = 'query { users(id: "one") { address { road } } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: {
          address: {
            road: "updated resolver road",
          },
        },
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it("should return empty User for non-existing user", async () => {
    const schema = buildSchema(resolvers);
    const query = 'query { users(id: "two") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: null,
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it("should return empty User if no query resolver", async () => {
    const emptyResolvers = {
      Query: {},
    };
    const schema = buildSchema(emptyResolvers);
    const query = 'query { users(id: "one") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: null,
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it("should return error with empty data, for missing type resolver", async () => {
    const emptyResolvers = {
      Query: {
        users: (_, { id }) => {
          return users.find((user) => user.id === id);
        },
      },
    };
    const schema = buildSchema(emptyResolvers);
    const query = 'query { users(id: "one") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      errors: [
        {
          message: "users is not defined",
          locations: [{ line: 1, column: 9 }],
          path: ["users"],
        },
      ],
      data: {
        users: null,
      },
    };
    equal(stringify(expectedResult), stringify(result));
  });

  it("should return errors for invalid queries", async () => {
    const schema = buildSchema(resolvers);
    const query = 'query { badUsers(id: "one") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      errors: [
        {
          message:
            'Cannot query field "badUsers" on type "Query". Did you mean "users"?',
          locations: [{ line: 1, column: 9 }],
        },
      ],
    };
    equal(stringify(expectedResult), stringify(result));
  });
});
