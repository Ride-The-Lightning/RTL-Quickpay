const webpack = require('webpack');
const path = require('path');
const packageJson = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  mode: 'production',
  name: 'rtl-quickpay',
  entry: {
    background: path.join(__dirname, 'src/scripts/background.js'),
    content: path.join(__dirname, 'src/scripts/content.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './scripts/[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    alias: {
      assets: path.join(__dirname, 'src/assets'),
      pages: path.join(__dirname, 'src/pages'),
      scripts: path.join(__dirname, 'src/scripts'),
      shared: path.join(__dirname, 'src/shared'),
      styles: path.join(__dirname, 'src/styles'),
      browser: path.join(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.js')
    },
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   $: path.resolve(path.join(__dirname, 'node_modules/jquery/dist/jquery.min.js')),
    //   sha256: path.resolve(path.join(__dirname, 'node_modules/jssha/dist/sha256.js')),
    //   'browser-polyfill': path.resolve(path.join(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'))
    // }),
    new CopyWebpackPlugin({ patterns: [
      { from: './src/manifest.json' },
      { from: './src/index.html' },
      { from: path.join(__dirname, 'src/assets'), to: path.join(__dirname, 'dist/assets') },
      { from: path.join(__dirname, 'src/pages'), to: path.join(__dirname, 'dist/pages') },
      { from: path.join(__dirname, 'src/styles'), to: path.join(__dirname, 'dist/styles') },
      { from: path.join(__dirname, 'src/shared'), to: path.join(__dirname, 'dist/shared') },
      { from: 'node_modules/jquery/dist/jquery.js', to: path.join(__dirname, 'dist/shared') },
      { from: 'node_modules/jssha/dist/sha256.js', to: path.join(__dirname, 'dist/shared') },
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: path.join(__dirname, 'dist/shared') }
    ] }),
    new ZipPlugin({
      path: path.join(__dirname, '/package'),
      filename: `RTL-Quickpay-v${packageJson.version}.zip`
    }),
  ]
};
