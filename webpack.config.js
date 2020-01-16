const path = require('path');
const packageJson = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: path.join(__dirname, 'src/scripts/background.js'),
    content: path.join(__dirname, 'src/scripts/content.js'),
    constants: path.join(__dirname, 'src/scripts/constants.js'),
    utils: path.join(__dirname, 'src/scripts/utils.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './scripts/[name].js',
    publicPath: '/'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/manifest.json' },
      { from: './src/index.html' },
      { from: './src/images/', to: './images/' },
      { from: './src/pages/', to: './pages/' },
      { from: './src/styles/', to: './styles/' },
      { from: 'node_modules/jquery/dist/jquery.min.js', to: './scripts/' },
      { from: 'node_modules/jssha/src/sha256.js', to: './scripts/' },
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: './scripts/' }
    ]),
    new ZipPlugin({
      path: __dirname,
      filename: `RTL-Quickpay-v${packageJson.version}.zip`,
    }),
  ]
};