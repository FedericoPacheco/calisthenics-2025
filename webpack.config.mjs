import path from "path";
import { fileURLToPath } from "url";
import GasPlugin from "gas-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/entryPoint.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "this", // Expose exports to the global scope
  },
  resolve: {
    extensions: [".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
  optimization: {
    minimize: false,
  },
  devtool: "source-map",
  plugins: [new GasPlugin()],
};
