const { graphql, parse, execute } = require("graphql");

const errors = [];
const data = {};

const logger = (message) =>
  //console.log(message);
  null;

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

  function executeFieldV2(selectionName) {
    // const results = schema._typeMap.Query._fields[selectionName].resolve(null, {
    //   [operation.argName]: operation.argValue,
    // });
    // const results = schema._typeMap[selectionName].resolve(null, {
    //   [operation.argName]: operation.argValue,
    // });
    // data[selectionName] = results;
    // const name = selection.name.value;
    return;
  }
  let data = [];
  function executeSelectionSetV2(selectionSet, schemaType, casedField = null) {
    logger("\nexecuteSelectionSetV2");
    selectionSet.selections.map((selection) => {
      const field = selection.name.value;
      logger("schemaType", schemaType);
      logger("field", field);
      logger("casedField", casedField);

      // sub type exists, update data
      if (schemaType._fields[field]) {
        logger("sub-type exists");
        const found = data.find((item) => item.resolverData[field]);
        if (found) {
          // data[0].resolverData[field]) {
          // has data for type. update for just field
          logger("has data for type, update");
          logger("found", found);
          const updatedResolveData = { [field]: found.resolverData[field] }; // data[0].resolverData[field] };
          logger("updatedResolveData", updatedResolveData);
          data.push({
            resolverData: updatedResolveData,
            typeName: field,
            schemaType: schemaType,
          });
        } else {
          logger("no data for type, resolve it");
          const resolverData = schemaType._fields[field].resolve();
          logger("resolverData", resolverData);
          data.push({
            resolverData: resolverData,
            typeName: field,
            schemaType: schemaType,
          });
        }
      }

      // execute field...type resolver
      if (schemaType._fields[caseField(field)]) {
        logger("cased sub-type exists");
        const resolverData = schemaType._fields[caseField(field)].resolve(null);
        logger("resolverData", resolverData);
        data.push({
          resolverData,
          typeName: field,
          schemaType: caseField(field),
        });
      }

      // execute field...root query resolver
      if (schema._typeMap.Query._fields[field]) {
        logger("execute field");
        const resolverData = schema._typeMap.Query._fields[field].resolve(
          null,
          {
            [operation.argName]: operation.argValue,
          }
        );
        logger("resolverData", resolverData);
        data.push({
          resolverData,
          typeName: field,
          schemaType: schemaType,
        });
      }

      // check for casedField resolver
      if (
        casedField &&
        schema._typeMap[casedField] &&
        schema._typeMap[casedField]._fields[field] &&
        schema._typeMap[casedField]._fields[field].resolve
      ) {
        logger("casedField type has sub-field");
        const resolverData = schema._typeMap[casedField]._fields[field].resolve(
          null
        );
        data.push({
          resolverData,
          typeName: field,
          schemaType: casedField,
        });
      }

      // process sub-fields
      // pushes so last item in array is deepest
      if (selection.selectionSet) {
        logger("process sub-fields");
        executeSelectionSetV2(
          selection.selectionSet,
          schemaType,
          caseField(field)
        );
      }
    });
  }

  executeSelectionSetV2(opNode.selectionSet, operation.returnType);

  logger("DATA", data);

  // process all data into tree.

  logger("\n");

  let response = {};
  const add = (resp, item, length) => {
    logger("item.typeName", item.typeName);
    resp[item.typeName] =
      length === 0
        ? item.resolverData[item.typeName]
          ? item.resolverData[item.typeName]
          : item.resolverData
        : {}; // add data for last item
  };
  const process = (array, resp, prev) => {
    const [head, ...tail] = array;
    const updatedRes = prev ? resp[prev] : resp;
    add(updatedRes, head, tail.length);
    if (tail.length === 0) return;
    process(tail, updatedRes, head.typeName);
  };
  process(data, response);
  logger("response", response);

  return response;

  // return {
  //   [operation.queryName]: data.pop().resolverData,
  // };
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
  // validateAndExecuteOp(queryAst.definitions[0], schema);
  const data = validateAndExecuteOpV2(queryAst.definitions[0], schema);

  // logger("errors", errors);
  if (errors.length > 0) {
    return { errors };
  }

  return { data };
};

exports.ourGraphql = ourGraphql;
