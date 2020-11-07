const logger = (message) => {
  console.log(message);
};

const users = [
  {
    id: "one",
    email: "some@email.com",
  },
];
const resolvers = {
  Query: {
    users: (...args) => {
      const id = args[1].id;
      logger("RESOLVER - Query.users");
      logger(args);
      return users.find((user) => user.id === id);
    },
  },
  User: {
    address: (...args) => {
      logger("RESOLVER - User.address");
      logger(...args);
      return { road: "some road" };
    },
  },
};

exports.resolvers = resolvers;
