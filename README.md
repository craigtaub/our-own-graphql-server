# our-own-graphql-server

- NodeJS
- Express
- graphql-tools

```
> yarn test
```

## Scenarios - TODO

1. Top level resolver is

- query { users(id: "one") { email } }
- Resolver: Query.users.
  - Args: undefined, {id:value}
- `schema._typeMap.Query._fields[users]`

2. Sub-level resolver is

- query { users(id: "one") { address { road } } }
- Calls above then:
- Resolver: User.address.
  - Args: Query.users resolver data
- `schema._typeMap.User._fields[address]`

## Issues

- does it work with other multiple selectionSets?
- only hands args for (1)
- doesnt return error if query does not exist
- doesnt work with no empty no user data, or no user resolver
