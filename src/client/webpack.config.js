const ExtractTextPlugin = require("extract-text-webpack-plugin");

var extractPlugin = new ExtractTextPlugin({
   filename: 'bundle.css'
});

module.exports = {
    entry: "./src/client/client.tsx",
    output: {
        filename: "client.js",
        path: __dirname + "/../../build/public"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
        ]
    },

    plugins: [
        extractPlugin
    ],

};
