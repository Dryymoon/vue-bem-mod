const path = require("path")

module.exports = {
  entry: "./vue-bem-mod.mjs",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vue-bem-mod.js",
    library: "vueBemMod",
    // libraryTarget: 'umd',
    // globalObject: 'this',
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