var http = require('http').createServer(handler), //create http instance
    io = require('socket.io').listen(http),  //require socket.io, listen on http instance port 
    fs = require('fs') //require filesystem - allows reading of static files (i.e. html).

http.listen(4001); //listen on port 4001

var clients = {}


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
  
  clients[socket.id] = null;
  console.log("New client joined: "+socket.id);
  io.sockets.emit('joined', clients);
  console.log("New packet client packet sent");

  socket.on('mousepos', function(data){
    clients[socket.id]=data;
    io.sockets.emit('position', clients);
  });

  socket.on('disconnect', function(){
   delete clients[socket.id];
   io.sockets.emit('dc', {socketid: socket.id});
  });

});

