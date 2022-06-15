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
  plugins: [
    new CopyWebpackPlugin({ patterns: [
      { from: './src/manifest.json' },
      { from: './src/manifest2.json' },
      { from: './src/index.html' },
      { from: path.join(__dirname, 'src/assets'), to: path.join(__dirname, 'dist/assets') },
      { from: path.join(__dirname, 'src/pages'), to: path.join(__dirname, 'dist/pages') },
      { from: path.join(__dirname, 'src/styles'), to: path.join(__dirname, 'dist/styles') },
      { from: path.join(__dirname, 'src/shared'), to: path.join(__dirname, 'dist/shared') },
      { from: 'node_modules/jquery/dist/jquery.js', to: path.join(__dirname, 'dist/shared') },
      { from: 'node_modules/jssha/dist/sha256.js', to: path.join(__dirname, 'dist/shared') }
    ] }),
    new ZipPlugin({
      path: path.join(__dirname, '/packages'),
      filename: `RTL-Quickpay-v${packageJson.version}.zip`
    })
  ],
};
