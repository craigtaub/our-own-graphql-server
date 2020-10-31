# our-own-graphql-server

- NodeJS
- Express
- graphql-tools

```
> yarn test
```

## Scenarios

1. Top level resolver is
   // query { users(id: "one") { email } }
   // Resolver: Query.users
   `schema._typeMap.Query._fields[users]`

2. Sub-level resolver is
   // query { users(id: "one") { address { road } } }
   // Resolver: User.address
   `schema._typeMap.User._fields[address]`

3. 2nd Sub-level resolver is
   // query { users(id: "one") { address { road } } }
   // Resolver: Address.road
   `schema._typeMap.Address._fields[road]`

## Issues

- only works with 1 sub-type or argument
