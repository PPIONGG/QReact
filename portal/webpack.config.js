// portal/webpack.config.js
const loadEnvironment = (mode) => {
  if (mode === "production") {
    require("dotenv").config({ path: "./.env.production" });
  } else {
    require("dotenv").config({ path: "./.env.development" });
  }
  require("dotenv").config({ path: "./.env.local" });
  require("dotenv").config({ path: "./.env" });
};

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const webpack = require("webpack");
const path = require("path");

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  loadEnvironment(mode);

  const isProduction = mode === "production";
  
  // Portal เป็น main site ที่ root
  const publicPath = isProduction 
    ? "/" 
    : "http://localhost:3000/";

  return {
    mode: mode,
    entry: "./src/index.tsx",
    output: {
      publicPath: publicPath,
      clean: true,
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: isProduction ? "[name].[contenthash].chunk.js" : "[name].chunk.js",
      path: path.resolve(__dirname, "dist"),
    },
    devServer: {
      port: 3000,
      historyApiFallback: {
        index: "/index.html",
      },
      hot: true,
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      fallback: {
        process: require.resolve("process/browser"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-react",
                  {
                    runtime: "automatic",
                  },
                ],
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/images/[name].[contenthash][ext]",
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __API_BASE_URL__: JSON.stringify(process.env.REACT_APP_API_BASE_URL),
        __API_TOKEN__: JSON.stringify(process.env.REACT_APP_API_TOKEN),
        __API_PACKAGE__: JSON.stringify(process.env.REACT_APP_API_PACKAGE),
        'process.env': JSON.stringify({
          NODE_ENV: mode,
          REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
          REACT_APP_API_TOKEN: process.env.REACT_APP_API_TOKEN,
          REACT_APP_API_PACKAGE: process.env.REACT_APP_API_PACKAGE,
        }),
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new ModuleFederationPlugin({
        name: "portal",
        remotes: {
          sales_visitor: isProduction
      ? "sales_visitor@http://192.168.0.131:1005/sales-visitor/remoteEntry.js" // ✅ Full URL
      : "sales_visitor@http://localhost:3001/remoteEntry.js", // Development

        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: "^18.2.0",
            eager: false,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: "^18.2.0",
            eager: false,
          },
          antd: {
            singleton: true,
            requiredVersion: "^5.8.0",
            eager: false,
          },
          i18next: {
            singleton: true,
            requiredVersion: "^25.3.1",
            eager: false,
          },
          "react-i18next": {
            singleton: true,
            requiredVersion: "^15.6.0",
            eager: false,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
    optimization: isProduction ? {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    } : {},
  };
};