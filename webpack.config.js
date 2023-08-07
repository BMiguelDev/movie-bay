const path = require("path");
const webpack = require('webpack');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '/.env')
});

// const dotenv = require('dotenv').config();

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
        // publicPath: '/',
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
            // Now any images are being required/imported in javascript but webpack still doens't know how to handle/use them 
            // We need the file-loader to load those images
            // {
            //     test: /\.(svg|png|jpg|jpeg|gif)$/i,
            //     use: {
            //         loader: "file-loader",
            //         options: {
            //             name: "[name][contenthash].[ext]",
            //             outputPath: "images"
            //         }
            //     }
            // }
        ]
    },
    plugins: [
        // Use "DefinePlugin" to make it possible to use "process.env" inside the application
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(dotenv.parsed),
            // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
            new CssMinimizerWebpackPlugin(),    // Minimize the outputed css file
            new TerserPlugin()      // Minimize the outputed js file
        ]
    }
};

// TODO:
//  - Remove comments from webpack.config.js
