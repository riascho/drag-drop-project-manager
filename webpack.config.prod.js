/**
 * Separate webpack config for production (default is "webpack.config.js", which holds the development mode)
 *
 * in order to use production config -> add "--config webpack.config.prod.js" to build script in package.json
 */

const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

// config object that will be picked up by webpack in this node.js environment
module.exports = {
  entry: "./src/app.ts", // start file to trace all imports for compilation
  output: {
    filename: "bundle.js", // single file where all imports and compilations will be produced
    path: path.resolve(__dirname, "dist"), // should match with outDir in tsconfig.json, needs to be absolute path though
  },
  // how to deal with the above files
  module: {
    rules: [
      {
        test: /\.ts$/, // check for files that end with .ts
        use: "ts-loader", // specify what to use for it
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // when it follows the import path it looks for these extensions
  },
  mode: "production",
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  },
  plugins: [
    // will be applied to general workflow
    new CleanPlugin.CleanWebpackPlugin(), // cleans up dist folder before project is built
  ],
};
