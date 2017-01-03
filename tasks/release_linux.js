'use strict';

var Q = require('q');
var gulpUtil = require('gulp-util');
var childProcess = require('child_process');
var jetpack = require('fs-jetpack');
var utils = require('./utils');
var nw = require('nw');

var projectDir;
var releasesDir;
var packName;
var packDir;
var tmpDir;
var readyAppDir;
var manifest;

var init = function () {
    projectDir = jetpack;
    tmpDir = projectDir.dir('./tmp', { empty: true });
    releasesDir = projectDir.dir('./releases');
    manifest = projectDir.read('app/package.json', 'json');
    packName = manifest.name + '_' + manifest.version;
    packDir = tmpDir.dir(packName);
    readyAppDir = packDir.cwd('opt', manifest.name);

    return Q();
};

var copyRuntime = function () {
    return projectDir.copyAsync('node_modules/nw/nwjs', readyAppDir.path(), { overwrite: true });
};

var copyBuiltApp = function () {
    return projectDir.copyAsync('build', readyAppDir.path(), { overwrite: true });
};

var moveDat = function () {
    return projectDir.moveAsync(readyAppDir.path()+'/icudtl.dat', releasesDir.path()+'/icudtl.dat')
}

var movePak = function () {
    return projectDir.moveAsync(readyAppDir.path()+'/nw.pak', releasesDir.path()+'/nw.pak')
}

var packToFile = function () {
    var deferred = Q.defer();

    var zipFileName = packName + ".nw";
    var zipPath = tmpDir.path(zipFileName);
    var outPath = releasesDir.path(packName);

    gulpUtil.log('Creating package...');

    // Counting size of the app in KiB
    var appSize = Math.round(readyAppDir.inspectTree('.').size / 1024);

    // Build the zip...
    childProcess.execSync('zip -r ' + zipPath + ' ' + readyAppDir.path());
    childProcess.execSync('cat '+ nw.findpath() + ' ' + zipPath + ' > ' + outPath + ' && chmod +x ' + outPath,
        function (error, stdout, stderr) {
            if (error || stderr) {
                console.log("ERROR while building linux package:");
                console.log(error);
                console.log(stderr);
            } else {
                gulpUtil.log('package ready!', path);
            }
            deferred.resolve();
        });

    return deferred.promise;
};

var cleanClutter = function () {
    return tmpDir.removeAsync('.');
};

module.exports = function () {
    return init()
    .then(copyRuntime)
    .then(copyBuiltApp)
    .then(moveDat)
    .then(movePak)
    .then(packToFile)
    .then(cleanClutter);
};
