const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/background.js',
    content: './src/content/content.js',
    injected: './src/inject/injected.js',
    popup: './src/popup/popup.js',
    notification: './src/popup/notification.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/notification.html', to: 'notification.html' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
};
