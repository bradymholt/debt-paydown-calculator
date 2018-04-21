const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const srcDir = path.join(__dirname, "src");

const config = {
  mode: "development",
  entry: {
    main: [path.join(srcDir, "boot.ts")]
  },
  output: {
    path: path.join(__dirname, "docs"),
    filename: "[name].js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        include: [srcDir, resolve("node_modules/webpack-dev-server/client")]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {
            scss: ExtractTextPlugin.extract({
              fallback: "vue-style-loader",
              use: [
                {
                  loader: "css-loader",
                  options: {
                    sourceMap: true,
                    minimize: true
                  }
                },
                {
                  loader: "sass-loader"
                }
              ]
            })
          },
          transformToRequire: {
            video: ["src", "poster"],
            source: "src",
            img: "src",
            image: "xlink:href"
          }
        }
      },
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          use: ["css-loader", "sass-loader"],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[hash:7].[ext]"
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[hash:7].[ext]"
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[hash:7].[ext]"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".vue", ".styl", ".css"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      bulma: "bulma/css/bulma.css",
      "@fortawesome/fontawesome-free-solid":
        "@fortawesome/fontawesome-free-solid/shakable.es.js",
      "@": srcDir
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      disable: true
    }),
    new HtmlWebpackPlugin({
      inject: "head",
      template: path.join(srcDir, "index.template.html")
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer"
    })
  ],
  devServer: {
    clientLogLevel: "warning",
    historyApiFallback: {
      rewrites: [
        {
          from: /.*/,
          to: "/index.html"
        }
      ]
    },
    hot: true,
    compress: true,
    port: 8080,
    overlay: { warnings: false, errors: true }
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  }
};

module.exports = config;

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}
