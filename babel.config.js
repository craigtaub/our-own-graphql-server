module.exports = {
  compact: false,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
  plugins: [
    ["inline-json-import", {}],
    [
      "module-resolver",
      {
        root: ["./"],
        extensions: [".js", ".ts"],
      },
    ],
    "@babel/plugin-transform-runtime",
  ],
  overrides: [
    {
      test: ["**/*.ts"],
      presets: ["@babel/preset-typescript"],
    },
  ],
};
