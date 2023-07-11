const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonPaths = require('./common-paths');

const config = {
    entry: {
        main: ['./src/index.js']
    },
    output: {
        filename: '[name].js',
        path: commonPaths.outputPath,
        publicPath: '/'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'eslint-loader',
                options: {
                    failOnWarning: true,
                    failOnerror: true
                },
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                })
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]'
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    /* optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }, */
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
         chunks: 'all',
         maxInitialRequests: Infinity,
         minSize: 0,
         cacheGroups: {
           vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
     
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `vbotcito.${packageName.replace('@', '')}`;
           },
         },
       },
      },
    },
    devServer: {
      historyApiFallback: true,
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new ExtractTextPlugin('[name].css'),
        new CleanPlugin(['../public'], { allowExternal: true }),
        new HtmlPlugin({
            filename: 'index.html',
            template: commonPaths.template,
            favicon: commonPaths.favicon,
            inject: true
        })
    ]
};

module.exports = config;