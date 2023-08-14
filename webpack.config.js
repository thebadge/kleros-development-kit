module.exports = {
    entry: './src/metaEvidenceGenerator/index.js',
    output: {
        filename: 'bundle.js',
        libraryTarget: 'var',
        library: 'getMetaEvidence'
    },
    optimization: {
        minimize: true
    }
};
