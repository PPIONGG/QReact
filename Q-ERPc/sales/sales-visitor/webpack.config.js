// Dynamic env loading based on mode
const loadEnvironment = (mode) => {
  if (mode === 'production') {
    require('dotenv').config({ path: './.env.production' });
  } else {
    require('dotenv').config({ path: './.env.development' });
  }
  require('dotenv').config({ path: './.env.local' });
  require('dotenv').config({ path: './.env' });
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  loadEnvironment(mode);

  return {
    mode: mode,
    entry: './src/index.tsx',
    devServer: {
      port: 3001,
      historyApiFallback: true,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      fallback: {
        "process": require.resolve("process/browser"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-react', { 
                  runtime: 'automatic'
                }],
                '@babel/preset-typescript'
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]'
          }
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __API_BASE_URL__: JSON.stringify(process.env.REACT_APP_API_BASE_URL),
        __API_TOKEN__: JSON.stringify(process.env.REACT_APP_API_TOKEN),
        __API_PACKAGE__: JSON.stringify(process.env.REACT_APP_API_PACKAGE),
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new ModuleFederationPlugin({
        name: 'sales_visitor',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx',
        },
        shared: {
          react: { 
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': { 
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          antd: {
            singleton: true,
            requiredVersion: '^5.8.0',
          },
              // เพิ่ม i18next เข้าไปใน shared
    'i18next': {
      singleton: true,
      requiredVersion: '^23.0.0',
    },
    'react-i18next': {
      singleton: true,
      requiredVersion: '^13.0.0',
    },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};