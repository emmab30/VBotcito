const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const config = {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        })
    ]
};

module.exports = config;