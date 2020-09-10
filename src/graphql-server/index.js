const { graphql, parse } = require("graphql");


// ast utils
function visit(ast, callback) {
  callback(ast)

  const keys = Object.keys(ast)
  for (let i = 0; i < keys.length; i++) {
    const keyName = keys[i]
    const child = ast[keyName]
    if (keyName === "loc") return
    if (Array.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        visit(child[j], callback)
      }
    } else if (isNode(child)) {
      visit(child, callback)
    }
  }
}
function isNode(node) {
  return typeof node === "object" && node.kind // normally AST uses .type
}
const validate = (node, schema) => {

  if (node.kind === 'OperationDefinition') {
    // Process query
    const selection = node.selectionSet.selections[0];

    console.log('schema', schema)
    const queryName = selection.name.value; // kind:Field
    const argName = selection.arguments[0].name.value; //kind:Argument
    const argValue = selection.arguments[0].value.value;
    const fieldsRequested = selection.selectionSet.selections[0].name.value // kind:Field

    console.log(queryName, '(', argName, ': ', argValue, ')',  fieldsRequested);
    
  }
}

const parser = (query, schema) => {
  // TODO: turn query into AST
  // query { users(id: "one") { email } }
  const ast = {
    "kind": "Document",
    "definitions": [
        {
            "kind": "OperationDefinition",
            "operation": "query",
            "variableDefinitions": [],
            "directives": [],
            "selectionSet": {
                "kind": "SelectionSet",
                "selections": [
                    {
                        "kind": "Field",
                        "name": {
                            "kind": "Name",
                            "value": "users",
                        },
                        "arguments": [
                            {
                                "kind": "Argument",
                                "name": {
                                    "kind": "Name",
                                    "value": "id",
                                },
                                "value": {
                                    "kind": "StringValue",
                                    "value": "one",
                                    "block": false,
                                },
                            },
                        ],
                        "selectionSet": {
                            "kind": "SelectionSet",
                            "selections": [
                                {
                                    "kind": "Field",
                                    "name": {
                                        "kind": "Name",
                                        "value": "email",
    
                                    },
                                    "arguments": [],
                                }
                            ],
                        },
                    }
                ],
            },
        }
    ],
  }
  return ast;
}

const ourGraphql = (schema, query) => {

  // Lib
  // return graphql(schema, query);

  // Mine
  // parse
  const queryAst = parser(query, schema);
  // console.log('query', queryAst)

  // validate
  visit(queryAst, (node) => validate(node, schema))

  // execute
};

exports.ourGraphql = ourGraphql;