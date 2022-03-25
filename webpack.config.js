const { merge } = require('webpack-merge');
const path = require("path")

const commonConfig = {
  entry: "./vue-bem-mod.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vue-bem-mod.js",
  },
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

module.exports=[

  // module build
  merge(commonConfig,{
    output: {
      filename: 'vue-bem-mod.esm.js',
      library: {
        type: "module"
      },
    },
    experiments: {
      outputModule: true
    }
  }),

  // common legacy build
  merge(commonConfig, {
    output: {
      filename: 'vue-bem-mod.js',
      library: {
        name: "vueBemMod",
        type: "umd"
      },
      globalObject: 'this',
    }
  }),
];