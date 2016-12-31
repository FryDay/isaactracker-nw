'use strict';

var gulp = require('gulp');
var utils = require('./utils');

var releaseForOs = {
    osx: require('./release_osx'),
    linux: require('./release_linux'),
    deb: require('./release_deb'),
    windows: require('./release_windows'),
};

gulp.task('release', ['build'], function () {
    return releaseForOs[utils.os()]();
});
