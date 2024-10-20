/**
 * Prerequisites for Webpack:
 *
 * file name = "webpack.config.js" -> webpack will look for this file
 * turn off "rootDir" in the tsconfig.json
 * make sure sourceMaps are on in tsconfig.json
 * remove '.js' extensions from import statements in all files
 */

const path = require("path");

// config object that will be picked up by webpack in this node.js environment
module.exports = {
  entry: "./src/app.ts", // start file to trace all imports for compilation
  output: {
    filename: "bundle.js", // single file where all imports and compilations will be produced
    path: path.resolve(__dirname, "dist"), // should match with outDir in tsconfig.json, needs to be absolute path though
    publicPath: "/dist/",
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
  devtool: "inline-source-map",
  mode: "development",
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  },
};
