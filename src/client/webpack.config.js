const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

var extractPlugin = new MiniCssExtractPlugin({
    filename: 'bundle.css'
});

module.exports = {
    entry: "./src/client/App.tsx",
    output: {
        filename: "client.js",
        path: __dirname + "/../../build/public"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        plugins: [new TsconfigPathsPlugin({ configFile: './src/client/tsconfig.json' })]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },

    plugins: [
        extractPlugin,
    ],

};
