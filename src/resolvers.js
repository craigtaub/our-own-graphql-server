const logger = (message) => console.log(message);
// null;

const users = [
  {
    id: "one",
    email: "some@email.com",
  },
];
const resolvers = {
  Query: {
    users: (_, { id }) => {
      logger("RESOLVER - Query.users");
      return users.find((user) => user.id === id);
    },
  },
  User: {
    address: () => {
      logger("RESOLVER - User.address");
      return { road: "some road" };
    },
  },
};

exports.resolvers = resolvers;
