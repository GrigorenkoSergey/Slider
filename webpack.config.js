const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const entries = {
  index: './index',
  slider: './assets/blocks/Slider/Slider',
};

const outputPaths = {
  index: './index',
  slider: './plugin/slider',
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: entries,

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'inline-source-map',

  output: {
    filename: (pathData) => `${outputPaths[pathData.chunk.name]}.[contenthash].js`,
    libraryTarget: 'var',
    library: 'Slider',
  },

  devServer: {
    overlay: true,
    port: 3001,
  },

  module: {
    rules: [{

      test: /\.js$/,
      loader: 'babel-loader',
    },
    {
      test: require.resolve('jquery'),
      use: [{
        loader: 'expose-loader',
        options: '$',
      }],
    },
    {
      test: /\.tsx?/,
      exclude: /node_modules/,
      use: [
        'ts-loader',
      ],
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: 'postcss.config.js' } },
        },
      ],
    },
    {
      test: /\.s[ac]ss$/i,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: 'postcss.config.js' } },
        },
        'sass-loader',
      ],
    },
    {
      test: /\.pug$/,
      use: [
        {
          loader: 'pug-loader',
        },
      ],
    },
    {
      test: /\.(png|svg|jpg|gif|webmanifest)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'images/[name].[contenthash].[ext]',
          },
        },
      ],
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name]/[name].[contenthash].[ext]',
          },
        },
      ],
    },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: './index.pug',
      filename: './index.html',
      chunks: ['index'],
    }),

    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `${outputPaths[name]}.[contenthash].css`,
    }),
  ],
};
