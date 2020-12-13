/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Dominik Fretz<info@codewithpassion.com>
 * Date: 2012-10-11
 *
 * Description:
 * This module starts the video-server.js file in the root to mock a video stream.
 *  
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 */
var fork = require('child_process').fork, request = require('request'), EventEmitter = require('events').EventEmitter, fs = require('fs'), path = require('path'), CONFIG = require('./config'), logger = require('./logger').create(CONFIG), moment = require('moment');

var OpenROVCamera = function (options) {
  var camera = new EventEmitter();
  var _capturing = false;
  var captureProcess;
  

  // End camera process gracefully
  camera.close = function () {
    _capturing = false;
    logger.log('sending SIGHUP to capture process');
    process.kill(captureProcess.pid, 'SIGHUP');
  };
  // Actual camera capture function
  camera.capture = function (callback) {
    var captureProcess = fork(path.join(__dirname, 'mock-video-server.js'));
    captureProcess.on('exit', function (code, signal) {
      logger.log('Got \'exit\' message from camera child. Code: ' + code);
    });
    captureProcess.on('error', function (err) {
      logger.log('Got \'error\' message from camera child. Error: ' + err);
    });
    camera.emit('started');
  };
  camera.snapshot = function(prefix, callback) {
    var time = moment().format('YYYYMMDDHHmmss');
    var ext = '.jpeg';
    request('http://localhost:8090/?action=snapshot-' + prefix + time);
    callback(time + ext);
  };

  return camera;
};

module.exports = OpenROVCamera;
