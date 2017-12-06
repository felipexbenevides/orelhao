const spawn = require('child_process').spawn;
const omxplayer = spawn('mplayer', ['volume 100', '/home/pi/orelhao/music/music1.mp3']);

omxplayer.stdout.pipe(process.stdout);

omxplayer.on('close', function(data){
    console.log('Terminou');	
    omxplayer = null;
}.bind(this));

setTimeout(function(){
    console.log('Foi');
    omxplayer.stdin.pause();
    omxplayer.kill();
}, 30000);