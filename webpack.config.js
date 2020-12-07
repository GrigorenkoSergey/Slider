const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const entries = {
  index: './index',
  slider: './assets/blocks/slider/slider',
};

const outputPaths = {
  index: './index',
  slider: './slider/slider',
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

  optimization: {
    minimizer: [new UglifyJsPlugin()],
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
      test: /\.tsx?/, // ?
      exclude: /node_modules/,
      use: [
        // '@jsdevtools/coverage-istanbul-loader',
        // OOOPS! and now debugger is not working correctly )) with string above
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

    ...Object.keys(entries).map((key) => new HtmlWebpackPlugin({
      template: `${entries[key]}.pug`,
      filename: `${outputPaths[key]}.html`,
      chunks: [`${key}`],
    })),

    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `${outputPaths[name]}.[contenthash].css`,
    }),
  ],
};
