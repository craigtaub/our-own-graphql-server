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
      return users.find((user) => user.id === id);
    },
  },
  User: {
    address: () => ({
      road: "some road",
    }),
  },
};

exports.resolvers = resolvers;
