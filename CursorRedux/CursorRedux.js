//Rewrite of my inital "CursorMirror" miniproject.
//This version should be much more efficient and less glitchy. 

var http = require('http').createServer(handler), //create http instance
    io = require('socket.io').listen(http),  //require socket.io, listen on http instance port 
    fs = require('fs') //require filesystem - allows reading of static files (i.e. html).

http.listen(4001); //listen on port 4001

var clients = {};

function handler( req, res){ //request, response
	fs.readFile(__dirname + '/index.html',
		function(err, data){
			if(err){ //if we encounter an error
				res.writeHead(500); //write HTTP 500 status code.
				return res.end('Error! '+err);//return error message, exit function
			}
		res.writeHead(200); //HTTP 200 header
		res.end(data); //output contents of index.html.
	});	
}

io.sockets.on('connection', function(socket){
  clients[socket.id] = null; //add client to list, no co-ords yet
  io.sockets.emit('clientlist', clients); //send new client list to other clients

  socket.on('mouseupdate', function(data){ //when new mouse-coords are recieved from client
    clients[socket.id] = {"x": data.data.x, "y": data.data.y}; //update JSON 
    io.sockets.emit('updateposition', clients[socket.id]); //emit updated position of that client /only/
  });

  socket.on('disconnect', function(data){
    delete clients[socket.id]; //on disconnect, remove client from JSON file 
    io.sockets.emit('clientdisconnect', {"clientid": socket.id}); //emit socket id (which acts as client id) of upon disconnect
		io.sockets.emit('clientlist', clients); //emit client list, just to ensure client<->server sync
  });
});
