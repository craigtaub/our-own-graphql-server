const user = {
  id: "one",
  username: "my username",
  email: "some@email.com",
};
const resolvers = {
  Query: {
    me: () => user,
    users: (_, { id }) => {
      return user;
    },
  },
  User: {
    address: () => "address",
    email: () => "some2@email.com",
  },
  Address: {
    road: () => "some road",
  },
};

exports.resolvers = resolvers;
