const compressionPlugin = require("compression-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");
const uglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

const htmlPlugin = new htmlWebpackPlugin({
  filename: "index.html",
  hash: true,
  inject: "body",
  template: "./client/template.html",
});

const basePlugins = [
  htmlPlugin,
  new webpack.HotModuleReplacementPlugin(),
  new NodePolyfillPlugin(),
  new webpack.ProvidePlugin({
    Promise: "bluebird",
  }),
];

const prodPlugins = [
  new compressionPlugin({
    algorithm: "gzip",
    asset: "[path].gz[query]",
  }),
  /* new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    comments: false,
    sourceMap: true,
    minimize: false
  })*/
];

const envPlugins =
  process.env.NODE_ENV === "production"
    ? [...basePlugins, ...prodPlugins]
    : basePlugins;

module.exports = {
  devServer: {
    compress: true,
    contentBase: path.resolve("public"),
    hot: true,
    host: "0.0.0.0",
    port: 8081,
    publicPath: "/",
  },
  mode: "development",
  stats: { warnings: false },
  devtool: "source-map",
  entry: ["./client/index.js"],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: "worker-loader",
          options: {
            inline: true,
            name: "fetch.worker.js",
          },
        },
      },
      {
        exclude: /node_modules/,
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-object-rest-spread",
            ],
            presets: ["@babel/env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.s?css/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" },
        ],
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve("public"),
    publicPath: "/",
  },
  plugins: envPlugins,
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [path.resolve(__dirname, "client"), "node_modules"],
  },
};
