const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    index: "./js/index.tsx",
  },
  output: {
    path: dist,
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".wasm"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: dist,
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, "static"), to: "./" }],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],
};
