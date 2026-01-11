const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');

app.use(express.urlencoded({extended : true}));
app.use(express.json());
// Serve from dist in production, or public as fallback
const staticDir = fs.existsSync(__dirname + '/dist') ? '/dist' : '/public';
app.use(express.static(__dirname + staticDir));
server.listen(3001);
console.log('Express server running on http://localhost:3001');
console.log('For development, use: npm run dev (Vite on port 3000)');

app.get('/', function (req, res) {
  // Serve from dist in production, or use Vite dev server in development
  const indexPath = fs.existsSync(__dirname + '/dist/index.html')
    ? __dirname + '/dist/index.html'
    : __dirname + '/public/index.html';
  res.sendFile(indexPath);
});

app.post('/config/save', function (req, res) {
  //_config.json
  //console.log(req.body);

  const json = JSON.stringify(req.body);
  fs.writeFile(__dirname + '/public/' + req.body.location + '_config.json', json, 'utf8', (_error) => {
    res.json(req.body);
  });
});

io.on('connection', function (socket) {
  socket.on('render-frame', function (data) {
    data.file = data.file.split(',')[1]; // Get rid of the data:image/png;base64 at the beginning of the file data
    const buffer = Buffer.from(data.file, 'base64');
    fs.writeFile(__dirname + '/public/tmp/frame-' + data.frame + '.png', buffer.toString('binary'), 'binary', (_error) => {
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
