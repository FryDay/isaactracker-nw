'use strict';

var gulp = require('gulp');
var NwBuilder = require('nw-builder');

var nw = new NwBuilder({
    files: ['./app/**'],
    flavor: 'normal',
    buildDir: 'releases',
    platforms: ['linux64']
});

module.exports = function () {
  return nw.build().catch(function (error) {
    console.error(error);
  });
}
