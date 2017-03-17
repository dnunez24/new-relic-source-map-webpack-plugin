"use strict";
const findSourceMap = require('./findSourceMap');
const {publishSourcemap} = require('@newrelic/publish-sourcemap');

module.exports = opts => item => {
    const {
        assets,
        staticAssetUrlBuilder,
        publicPath,
        applicationId,
        nrAdminKey,
        url,
        stats
    } = opts;

    const fileObj = assets[item];
    if (!fileObj.children) {
        return Promise.resolve();
    }

    const mapFile = assets[findSourceMap(fileObj.children)];
    if (mapFile === undefined || !mapFile.emitted) {
        return Promise.resolve();
    }

    const javascriptUrl = staticAssetUrlBuilder(url, publicPath, item, stats);
    return new Promise((resolve, reject) => {
        publishSourcemap({
            sourcemapPath: mapFile.existsAt,
            javascriptUrl,
            applicationId,
            nrAdminKey
        }, (err) => {
            if (err) {
                reject(err);
            }
            resolve(javascriptUrl);
        });
    });
};
