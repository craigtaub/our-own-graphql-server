# our-own-graphql-server

- NodeJS
- Mocha
- graphql

```
> yarn test
```

## Test scenarios

### Scenario 1

Query: `{ test(aInt: -123) }`
 
Schema 

```typescript
type Query {
  test(aInt: String!): String!
}
```

Using

```javascript
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      test: {
        type: GraphQLString,
        args: {
          aInt: { type: GraphQLInt },
        },
        resolve: (source, args) => {
          return "Query.test.name";
        },
      },
    },
  }),
});
```

### Scenario 2

Query: `{ test(aInt: -123) { name } }`

Schema 

```typescript
type Query {
  test(aInt: Int!): Person!
}
type Person {
  name: String!
}
```

Using

```javascript
const PersonType = new GraphQLObjectType({
  name: "Person",
  fields: {
    name: {
      type: GraphQLString,
        return "PersonType.name";
      },
    },
  },
});
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      test: {
        type: PersonType,
        args: {
          aInt: { type: GraphQLInt },
        },
        resolve: (source, args) => {
          return {
            name: "Query.test.name",
          };
        },
      },
    },
  }),
});
```

### Scenario 3

Query: `{ person { name } }`

Schema 

```typescript
type Query {
  test(aInt: Int!): Person!
  person: Person!
}
type Person {
  name: String!
}
```

Using

```javascript
const PersonType = new GraphQLObjectType({
  name: "Person",
  fields: {
    name: {
      type: GraphQLString,
      resolve: (source, args) => {
        return "PersonType.name";
      },
    },
  },
});
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      test: {
        type: PersonType,
        args: {
          aInt: { type: GraphQLInt },
        },
        resolve: (source, args) => {
          return {
            name: "Query.test.name",
          };
        },
      },
      person: {
        type: PersonType,
        resolve: () => {
          return Object.assign({}, parentResponse);
        },
      },
    },
  }),
});
```
