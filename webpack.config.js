const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

module.exports = {
  devServer: {
    contentBase: BUILD_DIR
  },
  entry: ['babel-polyfill', `${APP_DIR}/index.jsx`],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: APP_DIR,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        include: APP_DIR,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
       {
         test: /\.(png|svg|jpg|gif)$/,
         loader: 'url-loader',
         options: {
           limit: 10000
         }
       }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss']
  },
  output: {
    filename: 'bundle.js',
    path: BUILD_DIR
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css",
      disable: process.env.NODE_ENV === "development"
    }),
    new HtmlWebpackPlugin({
      title: "Minesweeper",
      inject: false,
      template: require('html-webpack-template'),
      appMountId: 'app'
    })
  ]
};
