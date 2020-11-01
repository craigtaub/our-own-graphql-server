# our-own-graphql-server

- NodeJS
- Express
- graphql-tools

```
> yarn test
```

## Scenarios

1. Top level resolver is

- query { users(id: "one") { email } }
- Resolver: Query.users.
  - Args: undefined, {id:value}, undefined, ast (fieldName: users)
- `schema._typeMap.Query._fields[users]`

2. Sub-level resolver is

- query { users(id: "one") { address { road } } }
- Calls above then:
- Resolver: User.address.
  - Args: Query.users resolver data
- `schema._typeMap.User._fields[address]`

3. 2nd Sub-level resolver is

- query { users(id: "one") { address { road } } }
- Calls both above then:
- Resolver: Address.road.
  - Args: User.address resolver data, {}, undefined, ast (fieldName: road)
- `schema._typeMap.Address._fields[road]`

## Issues

- does it work with other multiple selectionSets?
- only hands args for (1)
- doesnt call all resolvers for (3)
- doesnt return error if query does not exist
- doesnt work with no empty no user data, or no user resolver
