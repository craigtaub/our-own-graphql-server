const { graphql, parse } = require("graphql");

const errors = [];
const data = {};

// ast utils
function visit(ast, callback) {
  callback(ast);

  const keys = Object.keys(ast);
  for (let i = 0; i < keys.length; i++) {
    const keyName = keys[i];
    const child = ast[keyName];
    if (keyName === "loc") return;
    if (Array.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        visit(child[j], callback);
      }
    } else if (isNode(child)) {
      visit(child, callback);
    }
  }
}
function isNode(node) {
  return typeof node === "object" && node.kind; // normally AST uses .type
}
const scalarTypeMap = {
  StringValue: "ID",
};

function caseField(string) {
  return string[0].toUpperCase() + string.substr(1);
}

function processField(queryName, node, schema) {
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

function processSelectionSet(queryName, node, schema) {
  return node.selections.map((selection) => {
    return processField(queryName, selection, schema);
  });
}

const validateAndExecute = (node, schema) => {
  if (node.kind === "OperationDefinition") {
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

    console.log(
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
                return processSelectionSet(queryName, subFieldNode, schema);
              } else {
                // REMOVED FOR TRAVERSE
                // console.log("fieldsRequested", fieldsRequested);
                // console.log(
                //   "schemaQueryDetails",
                //   schemaQueryDetails.type.fields[fieldsRequested]
                // );
                // above equivalent to
                // console.log(
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
                return processField(queryName, selection, schema);
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
  }
};

const parser = (query, schema) => {
  // TODO: turn query into AST
  // console.log("parse", );
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
  // console.log('query', queryAst)

  // validate and execute

  // Q: any point in traversing if just looking for OperationDefinition?
  // visit(queryAst, (node) => validateAndExecute(node, schema));
  // Q: manually give op?
  validateAndExecute(queryAst.definitions[0], schema);

  // console.log("errors", errors);
  if (errors.length > 0) {
    return { errors };
  }

  return { data };
};

exports.ourGraphql = ourGraphql;
