var assert = require('assert');
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var async = require("async");
var exec = childProcess.exec;

var spawn = childProcess.spawn;
var mplayer = spawn('omxplayer', [path.join(__dirname, 'music', 'portugues5.mp3')]);
mplayer.on('close', function(data){
   console.log('Acabou');
});
mplayer.on('error', function(data){
    console.log('Erro mplayer: '+data);
});
setTimeout(function(){
  spawn('killall', ['omxplayer.bin']); 
  //mplayer.stdin.pause();
  mplayer.kill();
  console.log('Id: '+mplayer.pid);
}, 3000);

