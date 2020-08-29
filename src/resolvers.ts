const user = {
  id: "one",
  username: "my username",
  email: "some@email.com",
};
export const resolvers = {
  Query: {
    me: () => user,
    users: (_, { id }) => user,
  },
  User: {
    address: () => "address",
    email: () => "some2@email.com",
  },
  Address: {
    road: () => "some road",
  },
};
