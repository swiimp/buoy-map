require('dotenv').config();
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/client_server/components/app.jsx'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/client_server/public'),
  },
  module: {
    rules: [
      {
        test: /\.jsx$|\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'MapboxAccessToken': JSON.stringify(process.env.MapboxAccessToken),
    }),
  ],
};
