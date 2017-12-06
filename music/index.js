/* Includes */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongo = require('mongodb');
var assert = require('assert');
var childProcess = require('child_process');
var fs = require('fs');
var onOff =  require('onoff');
var lcdDriver = require('lcd');
var path = require('path');
var async = require("async");
var exec = childProcess.exec;
//require('array.prototype.find');

/* Substitui o array.prototype.find que nao funcionou no Raspbarry */
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

/* Constantes */
const DISPLAY_L = 15;
const DISPLAY_E = 8;
const DISPLAY_RS = 7;
const DISPLAY_D4 = 25;
const DISPLAY_D5 = 24;
const DISPLAY_D6 = 23;
const DISPLAY_D7 = 18;
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
var mongoClient = mongo.MongoClient;
var spawn = childProcess.spawn;
var objectId = mongo.ObjectID;
var router = express.Router();
var url = 'mongodb://localhost:27017/orelhao';
var logErro = fs.createWriteStream('/home/pi/orelhao/logs/erros.log', {flags: 'a'});
var storage = multer.diskStorage({
    destination: 'music/',
    filename: function (req, file, callback) {
        callback(null, file.originalname.replace(/ /g, '_').toLowerCase());
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        callback(null, ['.MP3', '.HTML', '.JS', '.CSS'].indexOf(file.originalname.substr(file.originalname.lastIndexOf('.')-file.originalname.length).toUpperCase()) > -1);
    }
});
var gpio = onOff.Gpio;
var lcd = new lcdDriver({rs: DISPLAY_RS, e: DISPLAY_E, data: [DISPLAY_D4, DISPLAY_D5, DISPLAY_D6, DISPLAY_D7], cols: 8, rows: 2});

/* Log de erros para arquivo */
process.stderr.write = logErro.write.bind(logErro);
process.on('uncaughtException', function(err){
    console.error((err && err.stack) ? err.stack : err);
    console.log('<<uncaughtException>>');
    process.exit(1);
});

/* Somente para depuracao 
function gpio(pin, direction, bound){
    this.pin = pin;
    this.direction = direction;
    this.bound = bound;
    this.onChange = null;
    this.value = 0;
    this.sources = null;
    this.source = 0;
    this.watch = function(callback){
        this.onChange = callback;
    };
    this.writeSync = function(val){
        this.value = val;
    };
    this.readSync = function(){
        if(this.direction == 'in'){
            if(this.sources){
                //return this.sources.find(function(a){return a.value;}) && this.value;
                return this.source && this.sources[this.source-1].value && this.value;
            }else{
                return this.value;
            }
        }
    };
    this.setTemporarily = function(timerDelay, source){
        this.value = 1;
        this.source = source;
        setTimeout(function(){
            this.value = 0;
            this.source = 0;
        }.bind(this), timerDelay);
    };
    this.setValue = function(value){
        var call = (!this.value && value && (['rising', 'both'].indexOf(this.bound)+1)) || (this.value && !value && (['falling', 'both'].indexOf(this.bound)+1));
        this.value = value;
        if(this.onChange && call){
            this.onChange(null, value);
        }
    }
};
function lcdDriver(config){
    this.config = config;
    this.on = function(event, callback){
        if(event == 'ready'){
            setTimeout(callback.bind(this), 1000);
        }
    };
    this.close = function(){
        console.log('display: close()');
    };
    this.clear = function(){
        console.log('display: clear()');
    };
    this.autoscroll = function (){
        console.log('display: autoscroll()');
    };
    this.print = function(buffer, callback){
        console.log('display: print("'+buffer+'")');
        setTimeout(callback.bind(this), 50);
    };
};
var lcd = new lcdDriver({rs: DISPLAY_RS, e: DISPLAY_E, data: [DISPLAY_D4, DISPLAY_D5, DISPLAY_D6, DISPLAY_D7], cols: 8, rows: 2});*/

/* Display 16x2 */
var display = {
    lines: [{
        text: '',
        scroll: false,
        pos: 0,
        changed: false
    },{
        text: '',
        scroll: false,
        pos: 0,
        changed: false
    }],
    backlight: null,
    ready: false,
    active: false,
    intervalLoop: null,
    setText: function(lines){
        if(this.active){
            for(var i = 0; i < 2; i++){
                if(lines[i]){
                    this.lines[i].text = lines[i].text;
                    this.lines[i].scroll = lines[i].scroll;
                    this.lines[i].pos = 0;
                    this.lines[i].changed = true;
                }
            }
        }
    },
    init: function(){
        this.backlight = new gpio(DISPLAY_L, 'low');
        lcd.on('ready', function (){
            lcd.clear();
            lcd.autoscroll();
            this.ready = true;
            this.intervalLoop = setInterval(this.refresh.bind(this), 500);
        }.bind(this));
        process.on('SIGINT', function (){
            lcd.close();
            process.exit();
        });
    },
    refresh: function(){
        if(this.active){
            this.refreshLine1(this.refreshLine2.bind(this));
        }
    },
    refreshLine1: function(callback){
        if(this.lines[0].changed || this.lines[0].scroll){
            lcd.setCursor(8, 0);
            this.print(this.lines[0]);
        }else if(callback){
            callback();
        }
    },
    refreshLine2: function(callback){
        if(this.lines[1].changed || this.lines[1].scroll){
            lcd.setCursor(8, 1);
            this.print(this.lines[1], callback);
        }else if(callback){
            callback();
        }
    },
    print: function(line, callback){
        var buffer = (line.changed && line.scroll ? (new Array(15)).join(' ') : '');
        line.pos = (!line.scroll || (line.pos+1 >= line.text.length) ? 0 : line.pos);
        buffer += (line.scroll ? line.text[line.pos++] : line.text);
        buffer = (line.changed && !line.scroll ? (buffer+(new Array(15)).join(' ')).substr(0, 16) : buffer);
        line.changed = false;
        if(buffer){
            lcd.print(buffer, callback);
        }
    },
    start: function(){
        if(this.ready){
            this.backlight.writeSync(1);
            this.active = true;
            lcd.clear();
        }
    },
    stop: function(){
        if(this.ready){
            this.active = false;
            lcd.clear();
            this.backlight.writeSync(0);
        }
    }
};

/* Player de audio */
var sound = {
    file: '',
    mplayer: null,
    initVolume: 100,
    playing: false,
    play: function(fileName){
        if(this.playing){
            this.stop();
        }
        this.file = fileName.replace(/ /g, '_').toLowerCase();
        this.mplayer = spawn('mplayer', [path.join(__dirname, 'music', this.file)]);
        this.mplayer.on('close', function(data){
            this.playing = false;
            this.mplayer = null;
        });
        this.mplayer.on('error', function(data){
            this.playing = false;
            console.log('Erro mplayer: '+data);
            this.mplayer = null;
        });
        this.playing = true;
        console.log('Executando: mplayer '+path.join(__dirname, 'music', this.file));
    },
    stop: function(){
        if(this.mplayer){
            this.mplayer.stdin.pause();
            this.mplayer.kill();
        }else{
            this.playing = false;
        }
        this.file = '';
    },
    volumeUp: function(){
        if(this.playing && this.mplayer){
            this.mplayer.stdin.write('*');
        }
    },
    volumeDown: function(){
        if(this.playing && this.mplayer){
            this.mplayer.stdin.write('/');
        }
    }
};

/* Objeto principal */
var orelhao = {
    hook: null,
    currentState: null,
    hotKeys: [],
    hookState: false,
    init: function(){
        var self = this;
        root.readDb(function(docs){console.log('Dados carregados do banco')});
        self.hook = new gpio(HOOK, 'in', 'both');
        self.hook.watch(function(err, value) {
            setTimeout(function(){
                if(value == self.hook.readSync()){
                    if(value){
                        console.log('Gancho off');
                        if(self.hookState){
                            self.off();
                            self.hookState = false;
                        }
                    }else{
                        console.log('Gancho on');
                        if(!self.hookState){
                            self.on();
                            self.hookState = true;
                        }
                    }
                }
            }.bind(this), 100);
        }.bind(this));
        /* Visor desabilitado 
        display.init();*/
        keypad.init();
        /* Somente para depuracao 
        keypad.cols[0].sources = keypad.rows;
        keypad.cols[1].sources = keypad.rows;
        keypad.cols[2].sources = keypad.rows;
        keypad.cols[3].sources = keypad.rows;*/
    },
    keyPressed: function(key){
        if(this.currentState){
            if(key == 'A'){
                sound.volumeUp();
            }else if(key == 'B'){
                sound.volumeDown();
            }else if(key == this.currentState.botaoVoltar){
                root.path.pop();
                this.updateState();
            }else if(this.hotKeys.indexOf(key) > -1){
                root.path.push(this.currentState.filhos[this.hotKeys.indexOf(key)].nome);
                this.updateState();
            }
        }
    },
    on: function(){
        root.path = [];
        this.hotKeys = [];
        this.currentState = null;
        /* Visor desabilitado 
        display.start();*/
        this.updateState();
        keypad.start(this.keyPressed.bind(this));
    },
    updateState: function(){
        this.currentState = root.data.orelhao[0];
        this.hotKeys = [];
        for(var i = 0; i < root.path.length; i++){
            this.currentState = this.currentState.filhos.find(function(a){return a.nome == root.path[i];});
        }
        for(var i = 0; i < (this.currentState.filhos ? this.currentState.filhos.length : 0); i++){
            this.hotKeys.push(this.currentState.filhos[i].botaoEntrar);
        }
        sound.play(this.currentState.audio);
        /* Visor desabilitado 
        if(this.currentState.visor){
            var lines = new Array(2);
            for(var i = 0; i < this.currentState.visor.length; i++){
                lines[this.currentState.visor[i].linha] = {
                    text: this.currentState.visor[i].texto,
                    scroll: this.currentState.visor[i].rolagem
                };
            }
            display.setText(lines);
        }*/
    },
    off: function(){
        root.path = [];
        this.hotKeys = [];
        this.currentState = null;
        keypad.stop();
        sound.stop();
        /* Visor desabilitado 
        display.stop();*/
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
                        console.log('Pressionou: '+this.pressed);
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
                if(err){
                    console.log('Erro no keypad: '+err);
                }
            }
        );
    },
    stop: function(){
        this.started = false;
        this.onChange = null;
    }
};

/* Objeto root */
var root = {
    data: {},
    path: [],
    readDb: function(callback){
        var self = this;
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            var collection = db.collection('orelhaco');
            collection.find().nextObject(function(err, docs) {
                assert.equal(null, err);
                self.data = docs,
                callback(docs);
                db.close();
            });
        });
    },
    writeDb: function(data, callback){
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            var collection = db.collection('orelhaco');
            if(data._id){
                delete data._id;
            }
            collection.deleteMany({}, function(err, results){
                collection.updateOne({}, data, {upsert: true}, function(err, results) {
                    assert.equal(null, err);
                    callback(results);
                    db.close();
                });
            });
        });
    }
};

/* Habilitando os parsers */
app.use(express.static('/home/pi/orelhao/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* Responde a uma solicitacao de teste */
app.get('/test', function(req, res){
    res.json({status: 'ok'});
});

/* Executa comando teste */
app.get('/test/command/:comando', function(req, res){
    console.log('Executando comando: '+req.params.comando);
    if(req.params.comando == 'on'){
        orelhao.hook.setValue(1);
    }else if(req.params.comando == 'off'){
        orelhao.hook.setValue(0);
    }else{
        switch(req.params.comando){
            case 'A': keypad.cols[0].setTemporarily(3000, 1); break;
            case '1': keypad.cols[1].setTemporarily(3000, 1); break;
            case '2': keypad.cols[2].setTemporarily(3000, 1); break;
            case '3': keypad.cols[3].setTemporarily(3000, 1); break;
            case 'B': keypad.cols[0].setTemporarily(3000, 2); break;
            case '4': keypad.cols[1].setTemporarily(3000, 2); break;
            case '5': keypad.cols[2].setTemporarily(3000, 2); break;
            case '6': keypad.cols[3].setTemporarily(3000, 2); break;
            case 'C': keypad.cols[0].setTemporarily(3000, 3); break;
            case '7': keypad.cols[1].setTemporarily(3000, 3); break;
            case '8': keypad.cols[2].setTemporarily(3000, 3); break;
            case '9': keypad.cols[3].setTemporarily(3000, 3); break;
            case 'D': keypad.cols[0].setTemporarily(3000, 4); break;
            case '*': keypad.cols[1].setTemporarily(3000, 4); break;
            case '0': keypad.cols[2].setTemporarily(3000, 4); break;
            case '#': keypad.cols[3].setTemporarily(3000, 4); break;
        }
    }
    res.json({status: 'ok'});
});

/* Solicitacao para enviar os dados do orelhao pelo banco */
app.get('/data', function(req, res){
    root.readDb(function(docs) {
        res.json(docs);
    });
});

/* Envia os dados do orelhao para banco */
app.post('/data', function(req, res){
    root.writeDb(req.body, function(results) {
        res.json({status: 'ok'});
    });
});

/* Enviar arquivo de audio */
app.get('/music/:file', function(req, res){
    res.sendFile('/music/' + file);
});

/* Faz upload do audio */
app.post('/music', upload.single('music'), function(req, res){
    console.log(req.body); //form fields
    console.log(req.file); //form files
    res.status(req.file ? 200 : 400).end();
});

/* Inicializa todo sistema */
orelhao.init();

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});