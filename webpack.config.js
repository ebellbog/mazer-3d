const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = 'development';

function getPlugins(mode) {
    const plugins = [
        new webpack.ProvidePlugin({
            $: 'jquery'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: path.resolve(__dirname, `${mode === 'production' ? '' : 'dist/'}index.html`),
            templateParameters: {
                isProduction: mode === 'production'
            }
        })
    ];

    if (mode === 'production') {
        plugins.push(new MiniCssExtractPlugin());
    } else {
        plugins.push(new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
            exclude: [/node_modules.+\.js/]
        }));
    }

    return plugins;
}

module.exports = (env, argv) => {
    return {
        devServer: {
            contentBase: path.resolve(__dirname, 'dist'),
        },
        devtool: 'cheap-module-eval-source-map',
        entry: './src/js/index.js',
        externals: argv.mode === 'production' ? {jquery: 'jQuery'} : {},
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        argv.mode === 'production' ?
                            MiniCssExtractPlugin.loader :
                            'style-loader',
                            'css-loader',
                            'less-loader'
                    ],
                },
                {
                    test: /\.png$/,
                    use: [
                        'file-loader'
                    ]
                }
            ]
        },
        plugins: getPlugins(argv.mode)
    };
}