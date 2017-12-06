
var ocultural = 
    {    
        "orelhao" : 
            [{
                "nome":"Menu",
                "audio":"teste.mp3",
                "botaoEntrar":"A",
                "botaoVoltar":"0",
                "visor": {
                    "linha":"",
                    "texto":"",
                    "rolagem":""
                },
                "filhos":[{
                    "nome":"Submenu",
                    "audio":"teste.mp3",
                    "botaoEntrar":"B",
                    "botaoVoltar":"0",
                    "visor": {
                        "linha":"",
                        "texto":"",
                        "rolagem":""
                    },
                    "filhos":[{
                        "nome":"Audio",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    },{
                        "nome":"Audio2",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    }]
                }]
            },{
                    "nome":"Menu2",
                    "audio":"teste.mp3",
                    "botaoEntrar":"B",
                    "botaoVoltar":"0",
                    "visor": {
                        "linha":"",
                        "texto":"",
                        "rolagem":""
                    },
                    "filhos":[{
                        "nome":"Audio3",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    },{
                        "nome":"Audio4",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    }]
            },{
                    "nome":"Menu3",
                    "audio":"teste.mp3",
                    "botaoEntrar":"B",
                    "botaoVoltar":"0",
                    "visor": {
                        "linha":"",
                        "texto":"",
                        "rolagem":""
                    },
                    "filhos":[{
                        "nome":"Audio5",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    },{
                        "nome":"Audio6",
                        "audio":"teste.mp3",
                        "botaoEntrar":"C",
                        "botaoVoltar":"0",
                        "visor": {
                            "linha":"",
                            "texto":"",
                            "rolagem":""
                        },
                        "filhos":[] 
                    }]
            }]
    };

//INICIALIZACAO DA ARVORE
var treeview = $("#treeview1").data("treeview");
var root, node;
var ob;
var indAudio = 1;
function carregar(elm){
    $.ajax({
        type: 'GET',
        url: '/data',
        dataType: 'json',
        success: function(jsonData) {
            console.log(jsonData);
            console.log('Carregado com sucesso.');
            ocultural = jsonData;
            $("#treeview1").html('');            
            root = treeview.addLeaf(false, "Inicio");
            add(root, ocultural);
            ob = jsonQ(ocultural['orelhao']);
        },
        error: function() {
            alert('Erro ao ler json no servidor');
        }
    });
}
carregar();

var globalIndex= [];



var activeNode = {};


//add(root, json); agora é feito na requisicao


function add(parent, data){
    $.each(data, function(key, value){
        if (typeof value === 'string') {
            if (key == "nome") {
                node = treeview.addLeaf(parent, this);
            }
        } else if (typeof value === 'object' && key != "visor") {
                if (key!="filhos") {
                    node = parent;
                }
                add(node, value);
        }
    });
}

function nodeTemp(nome, botaoEntrar,botaoVoltar) {
    var temp = {        
            "nome":"NovoAudio"+indAudio,
            "audio":"",
            "botaoEntrar":"0",
            "botaoVoltar":"0",
            "visor":{
                "linha":"",
                "texto":"",
                "rolagem":""
            },
            "filhos":  []
        };    
        indAudio++;
        return temp;
}
function tree_add_leaf_runtime_example_click(){
    var tree = $("#treeview1").data("treeview");
    var node = tree.element.find('li.active');
    // if(node[0]['childNodes'][0]['childNodes'][0]['nodeValue'] == 'Inicio'){

    // }else{
    pathGIActive();
    if(node[0]['childNodes'][0]['childNodes'][0]['nodeValue'] == 'Inicio'){
        tree.addLeaf(node, "NovoAudio");
        if(ocultural['orelhao'][0] == undefined){
            ocultural['orelhao'][0] = {};
            globalIndex = [];
            globalIndex[0] = 0;
            console.log(ocultural['orelhao'], globalIndex);
        ocultural['orelhao'][0] = nodeTemp();

        }else{
            ob.setPathValue(globalIndex,nodeTemp());
        }

    }else{
        if(ob.pathValue(globalIndex)['filhos'] == undefined){
            tree.addLeaf(node, "NovoAudio");
            globalIndex.push('filhos');  
            globalIndex.push('0');
        }else{
            var nodePos = ob.pathValue(globalIndex)['filhos'].length;
            tree.addLeaf(node, "NovoAudio");
            globalIndex.push('filhos');  
            globalIndex.push(''+nodePos+'');
        }

        ob.setPathValue(globalIndex,nodeTemp());
    }
    

    // console.log(ob.pathValue(globalIndex));
    gravar();
    // }


    clearContentPanel();
}         
function tree_rem_leaf_runtime_example_click(){
    var tree = $("#treeview1").data("treeview");
    var node = tree.element.find('li.active');
    var n, p;
    clearContentPanel();
    disableContentPanel();
    var temp = {        
            "nome":"",
            "audio":"",
            "botaoEntrar":"",
            "botaoVoltar":"",
            "visor":{
                "linha":"",
                "texto":"",
                "rolagem":""
            },
            "filhos":  []
        };

    pathGIActive();
    if(globalIndex.length > 1){
        // console.log(globalIndex);
        p = globalIndex.pop();// pego o index do elemento
        globalIndex.pop();
        temp['nome'] = ob.pathValue(globalIndex)['nome'];
        temp['audio'] = ob.pathValue(globalIndex)['audio'];
        temp['botaoEntrar'] = ob.pathValue(globalIndex)['botaoEntrar'];
        temp['botaoVoltar'] = ob.pathValue(globalIndex)['botaoVoltar'];
        if(ob.pathValue(globalIndex)['visor'] != undefined){
            temp['visor']['linha'] = ob.pathValue(globalIndex)['visor']['linha'];
            temp['visor']['texto'] = ob.pathValue(globalIndex)['visor']['texto'];
            temp['visor']['rolagem'] = ob.pathValue(globalIndex)['visor']['rolagem'];
        }
        for (var i = 0; i < ob.pathValue(globalIndex)['filhos'].length ; i++) {
            if(i != parseInt(p)){
                 // console.log('for',ob.pathValue(globalIndex)['filhos'][i]);
                 // console.log('length', temp['filhos'].length);
                temp['filhos'][temp['filhos'].length] = ob.pathValue(globalIndex)['filhos'][i];

            }
        }
        // console.log('temp',temp);
        ob.setPathValue(globalIndex, temp);
    }else{
        if(ocultural['orelhao'].length < 2){
            ocultural['orelhao'] = [];
            console.log(ocultural['orelhao']);
        }else{
            temp = [];
            console.log('temp', temp);
            console.log('templength', temp.length);

            p = globalIndex.pop();// pego o index do elemento
            for (var i = 0; i < ocultural['orelhao'].length ; i++) {
                if(i != parseInt(p)){
                    temp[temp.length] = ocultural['orelhao'][i]; 
                }
            }
            ocultural['orelhao'] = temp;
        }
    }

    // temp[''] = ;

    // console.log(globalIndex);
    // n = ob.pathValue(globalIndex)['filhos'].length;
    // console.log(p, n);

    node.remove();
    gravar();

}  

function disableContentPanel(){
    $('#namePanel input, #audioPanel input, #button01Panel input, #button02Panel input, #linhaPanel select, #mensagemPanel input, #rolagemPanel input').prop( "disabled", true ); //disable

}

function clearContentPanel(){
    $('#titlePanel').html('Inicio');
    $('#namePanel input').val('');
    $('#audioPanel label').html('');
    $('#button01Panel input').val('');
    $('#button02Panel input').val('');
    $('#linhaPanel select').val('');
    $('#mensagemPanel input').val('');
    $('#rolagemPanel input').val('');
    
    disableContentPanel();

}

function enableContentPanel(){
    $('#namePanel input, #audioPanel input, #button01Panel input, #button02Panel input, #linhaPanel select, #mensagemPanel input, #rolagemPanel input').prop( "disabled", false ); //Enable
}

function loadContentPanel(jsonObject) {
    console.log(jsonObject);
    $('#titlePanel').html(jsonObject['nome']);
    $('#namePanel input').val(jsonObject['nome']);
    $('#audioPanel label').html(jsonObject['audio']);
    $('#button01Panel input').val(jsonObject['botaoEntrar']);
    $('#button02Panel input').val(jsonObject['botaoVoltar']);
    $('#linhaPanel select').val(jsonObject['linha']);
    $('#mensagemPanel input').val(jsonObject['texto']);
    $('#rolagemPanel input').val(jsonObject['rolagem']);
    enableContentPanel();
}

function loadContent(jsonObject, word) {
    for(i in jsonObject){
        if (typeof  jsonObject[i] === 'object' && jsonObject[i]['nome']){
            if(jsonObject[i]['nome'] == word){
                activeNode = jsonObject[i];
                loadContentPanel(activeNode);
            }
            if(typeof jsonObject[i]['filhos'] === 'object'){
                loadContent(jsonObject[i]['filhos'], word);
            }
        }

    }
}


function del(jsonObject, word) {
    for(i in jsonObject){
        if (typeof  jsonObject[i] === 'object' && jsonObject[i]['nome']){
            if (jsonObject[i]['nome'] == word) {    
                nivel.push(i);
                // console.log(jsonObject[i]['nome'], nivel);
                for(i in nivel){
                    globalIndex[i] = nivel[i];
                }
                return nivel;
                nivel.pop();
            }
            if(typeof jsonObject[i]['filhos'] === 'object' && jsonObject[i]['filhos'].length > 0){
                nivel.push(i);
                nivel.push('filhos');
                teste(jsonObject[i]['filhos'], word, nivel);
                nivel.pop();
                nivel.pop();
            }
        }

    }    

}
function teste(jsonObject, word,nivel) {
    for(i in jsonObject){
        if (typeof  jsonObject[i] === 'object' && jsonObject[i]['nome']){
            if (jsonObject[i]['nome'] == word) {    
                nivel.push(i);
                // console.log(jsonObject[i]['nome'], nivel);
                for(i in nivel){
                    globalIndex[i] = nivel[i];
                }
                return nivel;
                nivel.pop();
            }
            if(typeof jsonObject[i]['filhos'] === 'object' && jsonObject[i]['filhos'].length > 0){
                nivel.push(i);
                nivel.push('filhos');
                teste(jsonObject[i]['filhos'], word, nivel);
                nivel.pop();
                nivel.pop();
            }
        }

    }    

}

function pathGI(word) {
        var tree = $("#treeview1").data("treeview");
        var node = tree.element.find('li.active'); 
        var niveli = [];
        globalIndex = [];
        teste(ocultural['orelhao'], word, niveli); // teste node[0]['childNodes'][0]['childNodes'][0]['nodeValue']
        return globalIndex;
}

function pathGIActive() {
        var tree = $("#treeview1").data("treeview");
        var node = tree.element.find('li.active'); 
        var niveli = [];
        globalIndex = [];
        if(node[0]['childNodes'][0]['childNodes'][0]['nodeValue'] == 'Inicio'){
            if(ocultural['orelhao'] == undefined){
                ocultural['orelhao'] = {};
                globalIndex[0] = 0;
            }else{
                globalIndex[0] = '' + ocultural['orelhao'].length + '';

            }
        }else{
            teste(ocultural['orelhao'], node[0]['childNodes'][0]['childNodes'][0]['nodeValue'], niveli); // teste node[0]['childNodes'][0]['childNodes'][0]['nodeValue']
        }
        return globalIndex;
}

function saveChanges() {
    console.log($('#namePanel input').val());
    console.log($('#audioPanel input').val());
    console.log($('#audioPanel label').html());
    console.log($('#button01Panel input').val());
    console.log($('#button02Panel input').val());
    console.log($('#linhaPanel select').val());
    console.log($('#mensagemPanel input').val());
    console.log($('#rolagemPanel input').val());
    

    
    
    var temp = {        
            "nome":"",
            "audio":"",
            "botaoEntrar":"",
            "botaoVoltar":"",
            "visor":{
                "linha":"",
                "texto":"",
                "rolagem":""
            },
            "filhos":  []
        };

        temp["nome"] = $('#namePanel input').val();
        tempaudio = $("#audioPanel input").val();
        tempaudio = tempaudio.split('\\');
        tempaudio = tempaudio[(tempaudio.length-1)];
        var audioInput = tempaudio , audioLabel = $("#audioPanel label").html();
         if(audioInput == ''){
            temp['audio'] = audioLabel;
         }else{
             temp['audio'] = audioInput;
         }
        temp["botaoEntrar"] = $('#button01Panel input').val();
        temp["botaoVoltar"] = $('#button02Panel input').val();
        temp["linha"] = $('#linhaPanel select').val();
        temp["texto"] = $('#mensagemPanel input').val();
        temp["rolagem"] = $('#rolagemPanel input').val();

        return temp;
}

$( document ).ready(function() {

    var family = jsonQ(ocultural['orelhao']);
    console.log(ocultural['orelhao'][0]['filhos'][0]['filhos'][1]['nome']);
    var niveli = [];
    
    $("#treeview1, .reloadPanel").click(function(){
        var tree = $("#treeview1").data("treeview");
        var node = tree.element.find('li.active'); 
        console.log(node[0]['childNodes'][0]['childNodes'][0]['nodeValue']);
        loadContent(ocultural['orelhao'],node[0]['childNodes'][0]['childNodes'][0]['nodeValue']);
    });
    $('.savePanel').click(function(){
        var tree = $("#treeview1").data("treeview");
        var node = tree.element.find('li.active'); 
        var niveli = [];
        teste(ocultural['orelhao'], node[0]['childNodes'][0]['childNodes'][0]['nodeValue'], niveli); // teste node[0]['childNodes'][0]['childNodes'][0]['nodeValue']
        var temp = saveChanges();

        console.log('point');
        //problema filhos nao existir (window.var)
        console.log(globalIndex);
        if(ob.pathValue(globalIndex)['filhos'] !== undefined){
            temp['filhos'] = ob.pathValue(globalIndex)['filhos'];
        }
        console.log('AQUI', ob.pathValue(globalIndex));
        ob.setPathValue(globalIndex, temp);
        console.log('AQUI', ob.pathValue(globalIndex));

        // $("#treeview1").html('');
        // treeview = $("#treeview1").data("treeview");
        // root = treeview.addLeaf(false, "Inicio");
        // carregar();
        globalIndex = [];
        clearContentPanel();
        gravar();

    });     
      $("form").submit(function(evt){
       evt.preventDefault();
       var formData = new FormData($(this)[0]);
       $.ajax({
         url: '/music',
         type: 'POST',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         enctype: 'multipart/form-data',
         processData: false,
         success: function (response) {
           alert('Arquivo carregado com sucesso!');
         }
       });
       return false;
     });         
});    

function gravar(){
    $.ajax({
        type: 'POST',
        url: '/data',
        data: ocultural,
        dataType: 'json',
        success: function(jsonData) {
            console.log('Salvo com sucesso');
            carregar();
        },
        error: function() {
            alert('Erro ao tentar salvar json');
        }
    });
}