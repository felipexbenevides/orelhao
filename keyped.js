/* Includes */
var assert = require('assert');
var onOff =  require('onoff');
var async = require("async");
require('array.prototype.find');

/* Constantes */
const KEYPAD_R1 = 2;
const KEYPAD_R2 = 3;
const KEYPAD_R3 = 4;
const KEYPAD_R4 = 17;
const KEYPAD_C1 = 27;
const KEYPAD_C2 = 22;
const KEYPAD_C3 = 10;
const KEYPAD_C4 = 9;
const HOOK = 11;

/* Variaveis globais */
var gpio = onOff.Gpio;

/* Objeto principal */
var orelhao = {
    hook: null,
    currentState: null,
    hotKeys: [],
    init: function(){
        var self = this;
        self.hook = new gpio(HOOK, 'in', 'both');
        self.hook.watch(function(err, value) {
            if(value){
                self.on();
            }else{
                self.off();
            }
        }.bind(this));
        keypad.init();
        keypad.start(this.keyPressed.bind(this));
    },
    keyPressed: function(key){
		console.log(key);
    },
    on: function(){
		console.log('on');
    },
    off: function(){
		console.log('off');
    },
    shutdown: function(){
        exec('shutdown -r now', function(error, stdout, stderr){console.log(stdout);});
    }
};

/* Keypad matricial 4x4 */
var keypad = {
    pressed: '',
    onChange: null,
    started: false,
    currentRow: 0,
    currentCol: 0,
    rows: [],
    cols: [],
    values: [],
    init: function(){
        this.rows = [new gpio(KEYPAD_R1, 'low'), new gpio(KEYPAD_R2, 'low'), new gpio(KEYPAD_R3, 'low'), new gpio(KEYPAD_R4, 'low')];
        this.cols = [new gpio(KEYPAD_C1, 'in'), new gpio(KEYPAD_C2, 'in'), new gpio(KEYPAD_C3, 'in'), new gpio(KEYPAD_C4, 'in')];
        this.values = [['A', '1', '2', '3'], ['B', '4', '5', '6'], ['C', '7', '8', '9'], ['D', '*', '0', '#']];
    },
    stoppingCondition: function(){
        return this.started;
    },
    checkRow: function(callback){
        this.rows[this.currentRow].writeSync(1);
        setTimeout(function () {
            for(this.currentCol = 0; this.currentCol < this.cols.length; this.currentCol++){
                if(this.cols[this.currentCol].readSync()){
                    if(this.pressed != this.values[this.currentRow][this.currentCol]){
                        this.pressed = this.values[this.currentRow][this.currentCol];
                        if(this.onChange){
                            this.onChange(this.pressed);
                        }
                    }
                }else{
                    if(this.pressed == this.values[this.currentRow][this.currentCol]){
                        this.pressed = '';
                    }
                }
            }
            this.rows[this.currentRow].writeSync(0);
            this.currentRow = (this.currentRow+1 >= this.rows.length ? 0 : this.currentRow+1);
            setTimeout(function () {
                callback(null);
            }.bind(this), 20);
        }.bind(this), 20);
    },
    clearRows: function(){
        for(var i = 0; i < this.rows.length; i++){
            this.rows[i].writeSync(0);
        }
    },
    start: function(onChangeCallback){
        this.onChange = onChangeCallback;
        this.started = true;
        this.key = '';
        this.pressed = '';
        this.currentRow = 0;
        this.currentCol = 0;
        this.clearRows();
        async.whilst(
            this.stoppingCondition.bind(this),
            this.checkRow.bind(this),
            function (err){
                console.log('Erro no keypad: '+err);
            }
        );
    },
    stop: function(){
        this.started = false;
        this.onChange = null;
    }
};

/* Inicializa todo sistema */
orelhao.init();

console.log('Iniciado');