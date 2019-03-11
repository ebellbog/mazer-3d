const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = 'development';

const plugins = [
    new webpack.ProvidePlugin({
        $: 'jquery'
    }),
    new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        exclude: [/node_modules.+\.js/]
    }),
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        filename: path.resolve(__dirname, 'dist/index.html'),
        templateParameters: {
            isProduction: mode === 'production'
        }
    })
];

const config = {
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
    },
    devtool: 'cheap-module-eval-source-map',
    entry: './src/js/index.js',
    externals: mode === 'production' ? {jquery: 'jQuery'} : {},
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: mode,
    module: {
        rules: [
            { 
                test: /\.less$/,
                use: [
                    mode === 'production' ? 
                        MiniCssExtractPlugin.loader : 
                        'style-loader',
                        'css-loader', 
                        'less-loader'
                ],
            },
        ]
    },
    plugins: mode === 'production' ? plugins.concat([new MiniCssExtractPlugin()]) : plugins
};

module.exports = config;
