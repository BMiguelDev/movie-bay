const path = require("path");
const webpack = require('webpack');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '/.env')
});

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    entry: {
        bundle: path.resolve(__dirname, './src/app.js')
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].[contenthash].js',
        clean: true,     // Remove previous bundle files that have since been changed and aren't being used 
        assetModuleFilename: './images/[name][contenthash][ext]'  // Allow assets (like images) to get specific names when outputted to the "dist" folder
    },
    // devtool: 'source-map',
    devServer: {
        // The webpack dev server will serve the files inside the "dist" folder
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : "style-loader",    // 2. If production build, extract css into bundle css file, if development build, inject styles into dom
                    'css-loader',   // 1. Turn css into commonJs
                    'postcss-loader'    // 1. Parse css for cross-browser compatibility using the autoprefixer dependency to add vendor prefixes for older browsers specified in the "browserslist" property in package.json
                ]
            },
            // The HTML loader will replace any image's "src" with a require statement for that image's source
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            // Use asset resource loader to load images 
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
        ]
    },
    plugins: [
        // Use "DefinePlugin" to make it possible to use "process.env" inside the application
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(dotenv.parsed)
        }),
        new HtmlWebpackPlugin({
            title: 'Movie Bay',
            filename: 'index.html',
            template: 'src/index.html',
            favicon: 'public/favicon.ico',
            // Minimize the outputted index.html file 
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        // Use "MiniCssExtractPlugin" to extract the css of the application into a separate css file, for better performance
        isProduction && new MiniCssExtractPlugin({  // Only apply this plugin on production builds
            filename: "[name].[contenthash].css",
        }),
    ],
    optimization: {
        minimizer: [
            new CssMinimizerWebpackPlugin(),    // Minimize the outputed CSS file
            new TerserPlugin()      // Minimize the outputed JS file
        ]
    }
};
