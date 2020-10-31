const { graphql, parse, execute } = require("graphql");

const errors = [];
const data = {};

const logger = (...message) => {
  // console.log(...message);
  // null;
};

const scalarTypeMap = {
  StringValue: "ID",
};

function caseField(string) {
  return string[0].toUpperCase() + string.substr(1);
}

const validateAndExecuteOpV2 = (opNode, schema) => {
  // node.kind === "OperationDefinition"

  // 'Query' must always
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

      // process sub-fields
      // pushes so last item in array is deepest
      if (selection.selectionSet) {
        resp[field] = {};
        logger("process sub-fields", resp);
        executeSelectionSetV2(
          selection.selectionSet,
          schemaType,
          resp[field],
          caseField(field)
        );
      }

      if (resolved) {
        return resp;
      }
      logger("--CONTINUE--");
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
        const resolverData = schema._typeMap[casedField]._fields[field].resolve(
          null
        );
        logger("resolverData", resolverData, resp);
        resp[field] = resolverData;
        resolved = true;
        return resp;
      }

      // scenario 2
      if (
        schema._typeMap[schemaType] &&
        schema._typeMap[schemaType]._fields &&
        schema._typeMap[schemaType]._fields[field] &&
        schema._typeMap[schemaType]._fields[field].resolve
      ) {
        const resolverData = schemaType._fields[field].resolve();
        resp[field] = resolverData;
        resolved = true;
        return resp;
      }

      // scenario 3. how knows to use arg?
      if (
        schema._typeMap.Query._fields[field] &&
        schema._typeMap.Query._fields[field].resolve
      ) {
        const resolverData = schema._typeMap.Query._fields[field].resolve(
          null,
          {
            [operation.argName]: operation.argValue,
          }
        );
        // HOW does this work??
        const requestedField = selection.selectionSet.selections[0].name.value;
        resp[field] = { [requestedField]: resolverData[requestedField] };
        resolved = true;
        return resp;
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

const parser = (query, schema) => {
  // TODO: turn query into AST
  // logger("parse", );
  // query { users(id: "one") { email } }
  return parse(query);
  const ast = {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: {
                kind: "Name",
                value: "users",
              },
              arguments: [
                {
                  kind: "Argument",
                  name: {
                    kind: "Name",
                    value: "id",
                  },
                  value: {
                    kind: "StringValue",
                    value: "one",
                    block: false,
                  },
                },
              ],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: {
                      kind: "Name",
                      value: "email",
                    },
                    arguments: [],
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
  return ast;
};

const ourGraphql = (schema, query) => {
  // Lib
  // return graphql(schema, query);

  // Mine
  // parse
  const queryAst = parser(query, schema);
  // logger('query', queryAst)

  // validate and execute...resolve operation manually
  const data = validateAndExecuteOpV2(queryAst.definitions[0], schema);

  // logger("errors", errors);
  if (errors.length > 0) {
    return { errors };
  }

  return { data };
};

exports.ourGraphql = ourGraphql;
