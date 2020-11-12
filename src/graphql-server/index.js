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
    returnType: schema._typeMap.Query._fields[selection.name.value].type,
  };
  if (selection.arguments[0]) {
    operation.argName = selection.arguments[0].name.value; // kind:Argument
    operation.argValue = selection.arguments[0].value.value;
    operation.argType = selection.arguments[0].value.kind; // FOR validation
  }

  function executeSelectionSetV2(
    selectionSet,
    schemaType,
    userResp,
    allResp,
    fieldType
  ) {
    logger("\nexecuteSelectionSetV2");
    selectionSet.selections.map((selection) => {
      const field = selection.name.value;
      logger("schemaType", schemaType);
      logger("field", field);
      logger("fieldType", fieldType);

      // scenario 1. Root query
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
        allResp[field] = resolverData || {};
        userResp[field] = resolverData || {};
      }

      // scenario 2 and 3. Schema type
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
        allResp[field] = resolverData || {};
        userResp[field] = resolverData || {};
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

// const ourGraphql = (queryAst, schema, query) => {
const ourGraphql = ({ document, schema }) => {
  // Lib
  // return graphql(schema, query);

  // Mine
  // validate and execute...resolve operation manually
  const data = validateAndExecuteOpV2(document.definitions[0], schema);

  return { data };
};

exports.ourGraphql = ourGraphql;
