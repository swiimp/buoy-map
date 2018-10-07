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
        test: /\.jsx?|\.js?/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};
