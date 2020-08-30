const { graphql } = require("graphql");

const ourGraphql = (schema, query) => {
  return graphql(schema, query);
};

exports.ourGraphql = ourGraphql;
