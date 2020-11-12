const logger = (...message) => {
  // console.log(...message);
};

const caseField = (string) => string[0].toUpperCase() + string.substr(1);

const execute = (opNode, schemaTypes) => {
  // node.kind === "OperationDefinition"

  const { Query, ...rootTypes } = schemaTypes;
  // Process request query
  const selection = opNode.selectionSet.selections[0];
  // op query: selection.name.value, // kind:Field
  const returnType = Query._fields[selection.name.value].type;
  const operation = {};

  if (selection.arguments[0]) {
    operation.argName = selection.arguments[0].name.value; // kind:Argument
    operation.argValue = selection.arguments[0].value.value;
    // would validate against "selection.arguments[0].value.kind"
  }

  function executeFields(selectionSet, userResp, fieldType) {
    selectionSet.selections.map((selection) => {
      const field = selection.name.value;

      // scenario 1. Root Query
      if (Query?._fields[field]?.resolve) {
        const resolverData = Query._fields[field].resolve(null, {
          [operation.argName]: operation.argValue,
        });
        userResp[field] = resolverData; // || {};
      }

      // scenario 2 and 3. Schema type
      if (rootTypes?.[returnType]?._fields?.[field]?.resolve) {
        const resolverData = rootTypes[returnType]._fields[field].resolve(
          userResp // parent resolver data
        );
        userResp[field] = resolverData;
      }

      // process sub-fields at end
      if (selection.selectionSet) {
        executeFields(
          selection.selectionSet,
          userResp[field],
          caseField(field)
        );
      }
    });
    return userResp;
  }

  return executeFields(opNode.selectionSet, {});
};

const ourGraphql = ({ document, schema }) => ({
  data: execute(document.definitions[0], schema._typeMap),
});

exports.ourGraphql = ourGraphql;
