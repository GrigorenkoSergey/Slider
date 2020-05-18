// Karma configuration
// Generated on Sun May 03 2020 15:30:52 GMT+0300 (Moscow Standard Time)
const path = require('path');
const webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'test/*Spec.ts',
    ],

    webpack: {
      module: {
        rules: [
          {
            test: /\.tsx?/, // ?
            exclude: /node_modules/,
            use: [
              // '@jsdevtools/coverage-istanbul-loader',
              // нужно отключать, если собираешься дебажить
              'ts-loader',
            ],
          },
          {
            test: /\.s[ac]ss$/i, // ?
            use: [
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true, config:
                    {path: 'src/postcss.config.js'},
                },
              },
              'sass-loader',
            ],
          },
        ],
      },
      resolve: webpackConfig.resolve,
      mode: 'development',
      devtool: 'inline-source-map',
    },


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.ts': ['webpack'],
      'src/**/*.scss': ['scss'],
      'test/**/*.scss': ['scss'],
    },

    scssPreprocessor: {
      options: {
        sourceMap: true,
        includePaths: ['bower_components'],
      },
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    //  config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests
    // whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // anything named karma-* is normally auto included
    // so you probably dont need this
    plugins: [
      'karma-jasmine',
      'karma-coverage-istanbul-reporter',
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-scss-preprocessor',
    ],

    reporters: ['coverage-istanbul'],

    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib
      'reports': ['html', 'lcovonly', 'text-summary'],

      // base output directory. If you include %browser% in the path
      // it will be replaced with the karma browser name
      'dir': path.join(__dirname, 'coverage'),

      // Combines coverage information from multiple browsers into one
      // report rather than outputting a report
      // for each browser.
      'combineBrowserReports': true,

      // if using webpack and pre-loaders, work around
      // webpack breaking the source path
      'fixWebpackSourcePaths': true,

      // Omit files with no statements, no functions
      // and no branches covered from the report
      'skipFilesWithNoCoverage': true,

      // Most reporters accept additional config options.
      // You can pass these through the `report-config` option
      'report-config': {
        // all options available at: https://github.com/istanbuljs/istanbuljs/blob/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib/html/index.js#L257-L261
        html: {
          // outputs the report in ./coverage/html
          // subdir: 'html'
        },
      },

      'verbose': true, // output config used by istanbul for debugging
    },
  });
};
