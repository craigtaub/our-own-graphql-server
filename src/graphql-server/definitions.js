// Scalar

// class OurGraphQLScalarType {
//   constructor(config) {
//     this.name = config.name;
//   }
// }

// Utilities

// const GraphQLString = new OurGraphQLScalarType({
//   name: "String",
//   // ast parsing methods here
// });
// const GraphQLID = new OurGraphQLScalarType({
//   name: "ID",
//   // ast parsing methods here
// });

// Classes

class OurGraphQLObjectType {
  name;
  _fields;
  constructor(config) {
    this.name = config.name;
    this._fields = config._fields;
  }
}

const Address = new OurGraphQLObjectType({
  name: "Address",
  _fields: {
    road: { type: "GraphQLString" }, // should point to instance, but we never check
  },
});

const User = new OurGraphQLObjectType({
  name: "User",
  _fields: {
    id: "", // { type: GraphQLString }, // not checked
    email: "", // { type: GraphQLString },
    address: { type: "Address" },
  },
});

const Query = new OurGraphQLObjectType({
  name: "Query",
  _fields: {
    users: {
      type: "User",
      // not needed for our POC
      // args: {
      // id: GraphQLID,
      // },
    },
  },
});

class OurGraphQLSchema {
  description;
  extensions = {};
  extensionASTNodes = [];
  _queryType = Query;
  _typeMap = {
    Query,
    User,
    Address,
    // in the schema but we dont use
    // Id: GraphQLID,
    // String: GraphQLString,
  };
}

exports.OurGraphQLSchema = OurGraphQLSchema;
