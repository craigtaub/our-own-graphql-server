// All below generated from 'require("graphql").parse'

// { test(aInt: -123) }
exports.scenarioOne = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "test",
            },
            arguments: [
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "aInt",
                },
                value: {
                  kind: "IntValue",
                  value: "-123",
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

// { test(aInt: -123) { name } }
exports.scenarioTwo = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "test",
            },
            arguments: [
              {
                kind: "Argument",
                name: {
                  kind: "Name",
                  value: "aInt",
                },
                value: {
                  kind: "IntValue",
                  value: "-123",
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
                    value: "name",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

// { person { name } }
exports.scenarioThree = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {
              kind: "Name",
              value: "person",
            },
            arguments: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: {
                    kind: "Name",
                    value: "name",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};
