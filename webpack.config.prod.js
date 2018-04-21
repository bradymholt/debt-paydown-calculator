const webpack = require("webpack");
const path = require("path");
const package = require("./package.json");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const PrerenderSpaPlugin = require("prerender-spa-plugin");
const config = require("./webpack.config.dev.js");

config.mode = "production";

// Exclude JS that will be loaded with CDN
config.externals = {
  vue: "Vue"
};

// Exclude CSS that will be loaded with CDN
config.module.rules.push({
  test: /bulma.css$/,
  use: "ignore-loader"
});

// Extract dependency versions from package.json so that CDN url uses same version
let vueVersion = package.devDependencies["vue"].replace(/\^/, "");
let bulmaVersion = package.devDependencies["bulma"].replace(/\^/, "");

// Note: We are *replacing* the plugin config here.
config.plugins = [
  // short-circuits all Vue.js warning code
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: `"${config.mode}"`
    }
  }),
  // generate all css to a file and add reference to it
  new ExtractTextPlugin({
    filename: "[name].[hash].css",
    allChunks: true
  }),
  // compress extracted CSS. We are using this plugin so that possible
  // duplicated CSS from different components can be deduped.
  new OptimizeCSSPlugin({
    cssProcessorOptions: { safe: true, map: { inline: false } }
  }),
  // generate index.html
  new HtmlWebpackPlugin({
    template: path.join(__dirname, "src", "index.template.html"),
    inject: "head",
    minify: {
      removeComments: true
    },
    useCdn: true,
    vueVersion,
    bulmaVersion
  }),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: "defer"
  })
];

module.exports = config;
