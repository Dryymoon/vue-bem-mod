const { merge } = require('webpack-merge');
const path = require("path");
const pkj = require('./package.json');

const commonConfig = {
  entry: "./vue-bem-mod.js",
  module: {
    rules: [
      {
        test: /\.m?(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "development",
  devtool: 'source-map',
}

module.exports = [

  // common legacy build
  merge(commonConfig, {
    output: {
      path: path.resolve(__dirname, path.dirname(pkj.main)),
      filename: path.basename(pkj.main),
      library: { name: "vueBemMod", type: "umd" },
      globalObject: 'this',
    }
  }),

  // common legacy minified build
  merge(commonConfig, {
    output: {
      path: path.resolve(__dirname, path.dirname(pkj.main)),
      filename: path.basename(pkj.main, path.extname(pkj.main)) + '.min' + path.extname(pkj.main),
      library: { name: "vueBemMod", type: "umd" },
      globalObject: 'this',
    },
    mode: "production",
  }),

  // module build
  pkj.module && merge(commonConfig, {
    output: {
      path: path.resolve(__dirname, path.dirname(pkj.module)),
      filename: path.basename(pkj.module),
      library: { type: "module" },
    },
    experiments: { outputModule: true }
  }),
].filter(it => it);