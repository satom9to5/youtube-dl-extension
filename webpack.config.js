const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: {
    background: './src/background/main.ts',
    content: './src/content/main.ts',
    popup: './src/popup/main.ts',
    info: './src/info/main.ts',
    preferences: './src/preferences/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.ya?ml$/,
        exclude: /node_modules/,
        use: "js-yaml-loader"
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.js$/,
	loader: 'babel-loader',
	options: {
           presets: ['@babel/preset-env']
        }
      },
    ]
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: [".ts", ".vue", ".js", ".yml", ".yaml", ".css"],
    alias: {
      '@config': path.resolve(__dirname, 'config'),
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ],
}

