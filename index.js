const express = require('express');
var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
server.listen(3000);
console.log('http://localhost:3000');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/config/save', function (req, res) {
  //_config.json
  //console.log(req.body);

  var json = JSON.stringify(req.body);
  var fs = require('fs');
  fs.writeFile(__dirname + '/public/' + req.body.location + '_config.json', json, 'utf8', (error) => {
    res.json(req.body);
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('render-frame', function (data) {
    data.file = data.file.split(',')[1]; // Get rid of the data:image/png;base64 at the beginning of the file data
    var buffer = new Buffer(data.file, 'base64');
    fs.writeFile(__dirname + '/public/tmp/frame-' + data.frame + '.png', buffer.toString('binary'), 'binary', (error) => {
      //console.log('error');
    });
  });
});/**/

//ffmpeg -r 60 -i /tmp/frame-%04d.png -vcodec libx264 -vpre lossless_slow -threads 0 output.mp4

//Max4Live Connection - song triggering, fx connection
/*var osc = require('node-osc');
var oscServer = new osc.Server(9001, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
  console.log("OSC:", msg);
});
var client = new osc.Client('127.0.0.1', 9000);
client.send('/oscAddress', 'message from node', function () {
  //client.kill();
});*/
