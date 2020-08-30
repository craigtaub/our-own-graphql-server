const user = {
  id: "one",
  username: "my username",
  email: "some@email.com",
};
module.exports.resolvers = {
  Query: {
    me: () => user,
    users: (_, { id }) => {
      console.log("id", id);
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
