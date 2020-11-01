const { graphql, parse, execute } = require("graphql");

const errors = [];

const logger = (...message) => {
  // console.log(...message);
  // null;
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
  let resolved = false;

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
    resp,
    casedField = null
  ) {
    logger("\nexecuteSelectionSetV2");
    selectionSet.selections.map((selection) => {
      const field = selection.name.value;
      logger("schemaType", schemaType);
      logger("field", field);
      logger("casedField", casedField);

      // check for casedField resolver. scenario 3
      if (
        casedField &&
        schema._typeMap[casedField] &&
        schema._typeMap[casedField]._fields[field] &&
        schema._typeMap[casedField]._fields[field].resolve
      ) {
        logger("casedField type has sub-field");
        logger(
          `USING - resolver schema._typeMap[${casedField}]._fields[${field}]`
        );
        const resolverData = schema._typeMap[casedField]._fields[
          field
        ].resolve();
        logger("resolverData", resolverData, resp);
        resp[field] = resolverData;
        resolved = true;
        return resp;
      }

      // scenario 2. lower priority
      if (
        schema._typeMap[schemaType] &&
        schema._typeMap[schemaType]._fields &&
        schema._typeMap[schemaType]._fields[field] &&
        schema._typeMap[schemaType]._fields[field].resolve
      ) {
        logger(
          `USING - resolver schema._typeMap[${schemaType}]._fields[${field}].resolve`
        );
        const resolverData = schema._typeMap[schemaType]._fields[
          field
        ].resolve();
        logger("resolverData", resolverData, resp);
        resp[field] = resolverData;
      }

      // scenario 3. high priority so last called.
      if (
        schema._typeMap.Query._fields[field] &&
        schema._typeMap.Query._fields[field].resolve
      ) {
        logger(`USING - resolver schema._typeMap.Query._fields[${field}]`);
        const resolverData = schema._typeMap.Query._fields[field].resolve(
          null,
          {
            [operation.argName]: operation.argValue,
          }
        );
        logger("resolverData", resolverData);
        // HOW does this work??
        const requestedField = selection.selectionSet.selections[0].name.value;
        resp[field] = { [requestedField]: resolverData[requestedField] };
      }

      // process sub-fields at end
      if (selection.selectionSet) {
        logger("process sub-fields", resp);
        executeSelectionSetV2(
          selection.selectionSet,
          schemaType,
          resp[field],
          caseField(field)
        );
      }
    });
    return resp;
  }

  const cleanRes = executeSelectionSetV2(
    opNode.selectionSet,
    operation.returnType,
    {}
  );
  logger("cleanRes", cleanRes);

  return cleanRes;
};

const ourGraphql = (queryAst, schema) => {
  // Lib
  // return graphql(schema, query);

  // Mine
  // validate and execute...resolve operation manually
  const data = validateAndExecuteOpV2(queryAst.definitions[0], schema);

  return { data };
};

exports.ourGraphql = ourGraphql;
