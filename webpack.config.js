const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./dist"),
}

module.exports = {
  entry: "./src/index",//?

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: "inline-source-map",

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    publicPath: "",
  },

  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },


  devServer: {
    overlay: true,
    port: 3000,
  },

  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader"
    },
    {
      test: /\.tsx?/,  //?
      exclude: /node_modules/,
      use: [
        // "@jsdevtools/coverage-istanbul-loader",// OOOPS! and now debugger not working correctly ))
        "ts-loader"
      ]
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: 'src/postcss.config.js' } }
        },
      ]
    },
    {
      test: /\.s[ac]ss$/i,
      use: [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: 'src/postcss.config.js' } }
        },
        "sass-loader",
      ],
    },
    {
      test: /\.pug$/,
      use: [
        {
          loader: "pug-loader",
        },
      ],
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          }
        }
      ],
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name]/[name].[ext]",
          }
        }
      ],
    },
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: `${PATHS.src}/index.pug`,
      filename: './index.html',
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: "[id].css",
    }),

    new CopyPlugin([
      { from: `${PATHS.src}/assets/blocks/`, to: `${PATHS.dist}/assets/blocks/` },
      { from: `${PATHS.src}/assets/images/`, to: `${PATHS.dist}/assets/images/` },
    ]),
  ],
};