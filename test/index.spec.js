const { equal } = require("assert");
const { resolvers } = require("../src/resolvers");
const { buildSchema } = require("../src/buildSchema");
const { ourGraphql } = require("../src/graphql-server");

const stringify = (object) => JSON.stringify(object);

describe("graphql server example", () => {
  it("should return data for valid queries", async () => {
    const schema = buildSchema(resolvers);
    const query = 'query { users(id: "one") { email } }';

    const result = await ourGraphql(schema, query);

    const expectedResult = {
      data: {
        users: {
          email: "some2@email.com",
        },
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
