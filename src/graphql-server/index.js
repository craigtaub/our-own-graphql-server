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

// V1 ----
// V1 ----
function executeField(queryName, node, schema) {
  const selection = node.selectionSet.selections[0];
  const nodeName = node.name.value; // kind:Field
  const selectionName = selection.name.value; // kind:Field

  if (schema._typeMap[caseField(nodeName)]) {
    // has sub-field. resolve first
    data[queryName] = {
      [nodeName]: {
        [selectionName]: schema._typeMap[caseField(nodeName)].fields[
          selectionName
        ].resolve(),
      },
    };
  } else {
    // no sub-field on schema, resolve on higher type (User)
    data[queryName] = {
      [selectionName]: schema._typeMap.Query.fields[queryName].type.fields[
        selectionName
      ].resolve(null, {}),
    };
  }
  return;
}

function executeSelectionSet(queryName, node, schema) {
  return node.selections.map((selection) => {
    return executeField(queryName, selection, schema);
  });
}

const validateAndExecuteOp = (node, schema) => {
  // node.kind === "OperationDefinition"

  // Process request query
  const selection = node.selectionSet.selections[0];
  const queryName = selection.name.value; // kind:Field
  const argName = selection.arguments[0].name.value; //kind:Argument
  const argValue = selection.arguments[0].value.value;
  const argType = selection.arguments[0].value.kind;

  // TODO fix below. traverse rather than manual
  // first field
  const fieldsRequested = selection.selectionSet.selections[0].name.value; // kind:Field
  let subField;
  let subFieldNode;
  // first sub-field
  if (selection.selectionSet.selections[0].selectionSet) {
    subField =
      selection.selectionSet.selections[0].selectionSet.selections[0].name
        .value;
    subFieldNode = selection.selectionSet;
  }

  // Check Query vs Schema (queryName, argName, argValue type, fieldsRequested)
  const schemaQueries = schema._typeMap.Query.fields;
  const schemaQueryNames = Object.keys(schemaQueries);

  logger(
    "LOG: ",
    queryName,
    "(",
    argName,
    ": ",
    argValue,
    ")",
    fieldsRequested,
    ".",
    subField
  );

  if (schemaQueryNames.includes(queryName)) {
    // request query name exists in schema
    const schemaQueryDetails = schemaQueries[queryName];
    const { args } = schemaQueryDetails;
    const schemaArgs = Object.keys(args);
    if (schemaArgs.includes(argName)) {
      // request query has matching args in schema
      const schemaArgType = args[argName].name;
      if (scalarTypeMap[argType] === schemaArgType) {
        let resolverResults;
        // request query arg type matches schema
        if (schemaQueryDetails.resolve) {
          // call resolver
          resolverResults = schemaQueryDetails.resolve(null, {
            [argName]: argValue,
          });
        }
        if (!resolverResults) {
          // non existing data for type
          data[queryName] = null;
          return;
        }
        if (Object.keys(resolverResults).includes(fieldsRequested)) {
          // has data for fields requested, return
          data[queryName] = {
            [fieldsRequested]: resolverResults[fieldsRequested],
          };
          return;
        } else {
          // resolve field from type on schema
          if (schema._typeMap[caseField(fieldsRequested)].fields) {
            // has field
            if (
              schema._typeMap[caseField(fieldsRequested)].fields[subField]
                .resolve
            ) {
              // REMOVED FOR TRAVERSE
              // has sub-field. resolve first
              // data[queryName] = {
              //   [fieldsRequested]: {
              //     road: schema._typeMap[casedField].fields[
              //       subField
              //     ].resolve(),
              //   },
              // };
              // return;
              return executeSelectionSet(queryName, subFieldNode, schema);
            } else {
              // REMOVED FOR TRAVERSE
              // logger("fieldsRequested", fieldsRequested);
              // logger(
              //   "schemaQueryDetails",
              //   schemaQueryDetails.type.fields[fieldsRequested]
              // );
              // above equivalent to
              // logger(
              //   "schema._typeMap.Query",
              //   schema._typeMap.Query.fields[queryName].type.fields[
              //     fieldsRequested
              //   ].resolve(null, {})
              // );
              // no sub-field on schema, resolve on higher type (User)
              // data[queryName] = {
              //   [fieldsRequested]: schemaQueryDetails.type.fields[
              //     fieldsRequested
              //   ].resolve(null, {}),
              // };
              // return;
              return executeField(queryName, selection, schema);
            }
          }
        }
      } else {
        return errors.push(
          `Query "${queryName}" argument '${argName}" type does not match "${schemaArgType}"`
        );
      }
    } else {
      return errors.push(
        `Query "${queryName}" does not have argument "${argName}"`
      );
    }
  } else {
    const error = {
      message: `Cannot query field "${queryName}" on type "Query". Did you mean "users"?`,
      locations: [{ line: 1, column: 9 }],
    };
    return errors.push(error);
  }
};
// ----
// ----

// V2 ----
// V2 ----
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

  // 4
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

  // 3
  // const traverse = (obj, callback) => {
  //   if (Object.keys(obj).length > 0) {
  //     Object.keys(obj).map((item) => {
  //       callback(item);
  //       return traverse(item, callback);
  //     });
  //   }
  // };
  // logger(traverse(data, (item) => logger(item)));

  // 2
  // let response = {};
  // const add = (item, res) => {
  //   logger("res", res);
  //   logger("item", item.typeName);
  //   res[item.typeName] = {};
  // };
  // const visit = (array, res) => {
  //   logger("visit", res);
  //   const [head, ...tail] = array;
  //   logger("HEAD", head.typeName);
  //   // logger("tail", tail.length);
  //   const key = Object.keys(res)[0];
  //   logger("key", key);
  //   if (res[key]) {
  //     add(head, res[key]);
  //   } else {
  //     add(head, res);
  //   }
  //   if (tail.length === 0) {
  //     return;
  //   }
  //   visit(tail, res);
  // };
  // visit(data, response);
  // logger("response", response);

  // 1
  // const updated = data.reduce((acc, curr, index, allData) => {
  //   logger("index", index);
  //   if (index !== 0) {
  //     // if resolver data included typeName already.
  //     if (Object.keys(curr.resolverData).includes(curr.typeName)) {
  //       logger("2");
  //       acc[data[index - 1].typeName] = curr.resolverData;
  //     } else {
  //       logger("3", acc);
  //       logger("data[index - 1].typeName", data[index - 1].typeName);
  //       logger("curr.typeName", curr.typeName);
  //       if (typeof curr.resolverData !== "object") {
  //         acc[data[index - 1].typeName][curr.typeName] = curr.resolverData;
  //       } else {
  //         acc[data[index - 1].typeName][curr.typeName] = curr.resolverData;
  //       }
  //     }
  //   } else {
  //     logger("1");
  //     acc[curr.typeName] = {};
  //   }
  //   logger("return acc", acc);
  //   return acc;
  // }, {});

  // return updated;
  return response;

  // return {
  //   [operation.queryName]: data.pop().resolverData,
  // };
};
// ----
// ----

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
