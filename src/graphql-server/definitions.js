// Scalar 

class OurGraphQLScalarType {
  constructor(config) {
    this.name = config.name;
    // this.parseValue = parseValue;
    // this.parseLiteral =
    // this.astNode = config.astNode;
  }
}

// Utilities

function coerceString(inputValue) {
  // if (typeof inputValue !== 'string') {
  //   throw new Error(
  //     `String cannot represent a non string value: ${inputValue)}`,
  //   );
  // }
  return inputValue;
}

const GraphQLString = new OurGraphQLScalarType({
  name: 'String',
  parseValue: coerceString,
  parseLiteral(valueNode) {
    // if (valueNode.kind !== Kind.STRING) {
    //   throw new Error("String cannot represent a non string value: ${valueNode}");
    // }
    return valueNode.value;
  },
});
const GraphQLID = new OurGraphQLScalarType({
  name: 'ID',
  parseValue: coerceString,
  parseLiteral(valueNode) {
    // if (valueNode.kind !== Kind.STRING && valueNode.kind !== Kind.INT) {
    //   throw new GraphQLError(
    //     'ID cannot represent a non-string and non-integer value: ' +
    //       print(valueNode),
    //     valueNode,
    //   );
    // }
    return valueNode.value;
  },
});


// Classes

class OurGraphQLObjectType { 
  name;
  fields;
  constructor(config) {
    this.name = config.name;
    this.fields = config.fields;
  }

}

const Address = new OurGraphQLObjectType({
  name: 'Address',
  fields: {
    road: { type: GraphQLString }
  },
})

const User = new OurGraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: Address},
  },
});

const Query = new OurGraphQLObjectType({
  name: 'Query',
  fields: {
    users: { 
      type: User,
      args: {
        id: GraphQLID
      }
    },
  },
});

class OurGraphQLSchema {
  description;
  extensions = {};
  astNode = {
    kind: 'SchemaDefinition',
    description: undefined,
    directives: [],
    operationTypes: [
      {
        kind: 'OperationTypeDefinition',
        operation: 'query',
        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Query', loc: null }, loc: null },
        loc: { start: 9, end: 21 }
      }
    ],
    loc: { start: 0, end: 23 }
  };
  extensionASTNodes = [];
  _queryType = Query;
  _mutationType;
  _subscriptionType;
  // _directives: [ @skip, @include, @deprecated, @specifiedBy ],
  _typeMap = {
    Query,
    ID: GraphQLID,
    User,
    String: GraphQLString,
    Address,
    // Boolean: Boolean,
    // __Schema: __Schema,
    // __Type: __Type,
    // __TypeKind: __TypeKind,
    // __Field: __Field,
    // __InputValue: __InputValue,
    // __EnumValue: __EnumValue,
    // __Directive: __Directive,
    // __DirectiveLocation: __DirectiveLocation
  };
  _subTypeMap = {};
  _implementationsMap = {};
}

exports.OurGraphQLSchema = OurGraphQLSchema;