const logger = (message) =>
  //console.log(message);
  null;

const users = [
  {
    id: "one",
    username: "my username",
    email: "some@email.com",
  },
];
const resolvers = {
  Query: {
    users: (_, { id }) => {
      logger("Query.users");
      return users.find((user) => user.id === id);
      // return {};
    },
  },
  User: {
    address: () => {
      logger("User.address");
      return { road: "some road" };
    },
  },
};

exports.resolvers = resolvers;
