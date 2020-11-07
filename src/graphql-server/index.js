const { graphql, parse, execute } = require("graphql");

const errors = [];

const logger = (...message) => {
  // console.log(...message);
};

function caseField(string) {
  return string[0].toUpperCase() + string.substr(1);
}

const validateAndExecuteOpV2 = (opNode, schema) => {
  // node.kind === "OperationDefinition"

  // Process request query
  const selection = opNode.selectionSet.selections[0];
  const operation = {
    queryName: selection.name.value, // kind:Field
    argName: selection.arguments[0].name.value, // kind:Argument
    argValue: selection.arguments[0].value.value,
    argType: selection.arguments[0].value.kind, // FOR validation
    returnType: schema._typeMap.Query._fields[selection.name.value].type,
  };

  logger(
    "LOG: ",
    operation.queryName,
    "(",
    operation.argName,
    ": ",
    operation.argValue,
    ")",
    ": ",
    operation.returnType
  );

  function executeSelectionSetV2(
    selectionSet,
    schemaType,
    userResp,
    allResp,
    casedField = null
  ) {
    logger("\nexecuteSelectionSetV2");
    selectionSet.selections.map((selection) => {
      const field = selection.name.value;
      logger("schemaType", schemaType);
      logger("field", field);
      logger("casedField", casedField);

      // scenario 1. high priority so last called.
      if (
        schema._typeMap.Query._fields[field] &&
        schema._typeMap.Query._fields[field].resolve
      ) {
        logger(`USING 1. - resolver schema._typeMap.Query._fields[${field}]`);
        const resolverData = schema._typeMap.Query._fields[field].resolve(
          null,
          {
            [operation.argName]: operation.argValue,
          }
        );
        logger("resolverData", resolverData);
        // HOW does this work??
        // i havnt requested email, but should still pass resolver data to other resolvers
        const requestedField = selection.selectionSet.selections[0].name.value;
        // resp[field] = { [requestedField]: resolverData[requestedField] };
        userResp[field] = { [requestedField]: resolverData[requestedField] };
        allResp[field] = resolverData;
      }

      // scenario 2. lower priority
      if (
        schema._typeMap[schemaType] &&
        schema._typeMap[schemaType]._fields &&
        schema._typeMap[schemaType]._fields[field] &&
        schema._typeMap[schemaType]._fields[field].resolve
      ) {
        logger(
          `USING - 2. resolver schema._typeMap[${schemaType}]._fields[${field}].resolve`
        );
        const resolverData = schema._typeMap[schemaType]._fields[field].resolve(
          allResp // parent resolver data
        );
        logger("resolverData", resolverData);
        allResp[field] = resolverData;
        userResp[field] = resolverData;
      }

      // check for casedField resolver. scenario 3
      if (
        casedField &&
        schema._typeMap[casedField] &&
        schema._typeMap[casedField]._fields[field] &&
        schema._typeMap[casedField]._fields[field].resolve
      ) {
        logger("casedField type has sub-field");
        logger(
          `USING - 3. resolver schema._typeMap[${casedField}]._fields[${field}]`
        );
        const resolverData = schema._typeMap[casedField]._fields[field].resolve(
          allResp[field]
        );
        logger("resolverData", resolverData);
        userResp[field] = resolverData;
        allResp[field] = resolverData;
        return userResp;
      }

      // process sub-fields at end
      if (selection.selectionSet) {
        logger("process sub-fields", allResp);
        executeSelectionSetV2(
          selection.selectionSet,
          schemaType,
          userResp[field],
          allResp[field],
          caseField(field)
        );
      }
    });
    return userResp;
  }

  const cleanRes = executeSelectionSetV2(
    opNode.selectionSet,
    operation.returnType,
    {},
    {}
  );
  logger("cleanRes", cleanRes);

  return cleanRes;
};

const ourGraphql = (queryAst, schema, query) => {
  // Lib
  // return graphql(schema, query);

  // Mine
  // validate and execute...resolve operation manually
  const data = validateAndExecuteOpV2(queryAst.definitions[0], schema);

  return { data };
};

exports.ourGraphql = ourGraphql;
