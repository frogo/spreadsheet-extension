const webpack = require('webpack');
const path = require('path');

// input dir
const APP_DIR = path.resolve(__dirname, './');

// output dir
const BUILD_DIR = path.resolve(__dirname, 'dist/');

const config = {
  entry: {
    'main': APP_DIR + '/main.js',
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].entry.js',
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
    ],
    alias: {
     // webworkify: 'webworkify-webpack',
    },
  },
 module: {
    noParse: [/jszip.js$/],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: APP_DIR + '/node_modules',
        loader: 'babel',
        query: {
          presets: [
            'es2015',
            'react',
          ],
        compact: false
        },
      },
        /* for require('*.css') */
        {
            test: /\.css$/,
            include: APP_DIR,
            loader: 'style-loader!css-loader',
        },
        /* for css linking images */
        {
            test: /\.png$/,
            loader: 'url-loader?limit=100000',
        },
    ],
    postLoaders: [{
      include: /node_modules\/mapbox-gl/,
      loader: 'transform',
      query: 'brfs',
    }],
  },
    node: {
        fs: 'empty'
    },
  externals: {
   // cheerio: 'window',
   // 'react/lib/ExecutionEnvironment': true,
   // 'react/lib/ReactContext': true,
     './cptable': 'var cptable',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}
module.exports = config;
