var express = require('express');
var app     = express(); 
var server = require('http').createServer(app);
var port    = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var io = require('socket.io').listen(server);
var path = require('path');
var Chat = require('./app/models/chat');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/antrianunikom');

users = []; 
connections =[]; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/public',express.static(path.join(__dirname, 'public')));
app.get('/',function(req,res){
    res.render('pages/index');
});

server.listen(port,function(){
    console.log('Listening on '+port);
});



io.sockets.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected : %s sockets connected', connections.length);
    
    socket.on('get data',function(){
            Chat.find({},function(err,data){
                if (io.sockets.connected[socket.id]) {
                    io.sockets.connected[socket.id].emit('get data', data);
                }
            });
    });

    //Disconnect
    socket.on('disconnect',function(data){
        if(!socket.username) return; 
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();

        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected : %s sockets connected', connections.length);
    });
    
    //send message 
    socket.on('kirim pesan',function(data){
        var chat = new Chat(); 
        chat.username = socket.username; 
        chat.message=data; 
        chat.room="general";
        chat.save();
        io.sockets.emit('pesan baru',{msg:data,user: socket.username});
    });

    //login 
    socket.on('new user',function(data, callback){
        callback(true);
        socket.username = data; 
        users.push(socket.username);
        updateUsernames(); 
    });

    socket.on("tes",function(data){
        console.log(data);
        io.sockets.emit("tes",data);
    });

    socket.on("selesai",function(data){
        io.sockets.emit("selesai",data);
    });
    
    function updateUsernames(){
        io.sockets.emit('get users',users);
    }
});