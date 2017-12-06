/* Includes */
var assert = require('assert');
var onOff =  require('onoff');
var lcdDriver = require('lcd');
var async = require("async");
require('array.prototype.find');

/* Constantes */
const DISPLAY_L = 15;
const DISPLAY_E = 8;
const DISPLAY_RS = 7;
const DISPLAY_D4 = 25;
const DISPLAY_D5 = 24;
const DISPLAY_D6 = 23;
const DISPLAY_D7 = 18;

/* Variaveis globais */
var gpio = onOff.Gpio;
var lcd = new lcdDriver({rs: DISPLAY_RS, e: DISPLAY_E, data: [DISPLAY_D4, DISPLAY_D5, DISPLAY_D6, DISPLAY_D7], cols: 8, rows: 2});
var backlight = new gpio(DISPLAY_L, 'low');

backlight.writeSync(1);
console.log('Ligou backlight');
lcd.on('ready', function (){
        console.log('Pronto');
	lcd.clear();
	//lcd.autoscroll();
	lcd.setCursor(4, 0);
	this.print('Teste');
}.bind(this));
process.on('SIGINT', function (){
	lcd.close();
	process.exit();
});

setInterval(function(){
    console.log('vivo');
}, 1000);