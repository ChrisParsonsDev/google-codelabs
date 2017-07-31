var grpc = require('grpc');
var events = require('events');

var booksProto = grpc.load('books.proto');

var server = new grpc.Server();
var bookStream = new events.EventEmitter();

var books = [
	{id: 123, title:"1984",author:"Orwell"}
];
server.addService(booksProto.books.BookService.service, {
	list: function(call, callback){
		callback(null, books);
	},
	insert: function(call, callback){
		var book = call.request;
		books.push(book);
		bookStream.emit('new_book', book);
		callback(null, {});
	},
	get: function(call, callback){
		for (var i = 0; i < books.length; i++){
			if(books[i].id == call.request.id){
				return callback(null, books[i]);
			}
		}
		callback({
			code: grpc.status.NOT_FOUND,
			details: "Not Found"
		});
	},
	delete: function(call, callback){
		for (var i = 0; i < books.length; i++){
			if(books[i].id == call.request.id){
				books.splice(i,1);
				return callback(null, books[i]);
			}
		}
		callback({
			code: grpc.status.NOT_FOUND,
			details: "Not Found"
		});
	},
	watch: function(stream){
		bookStream.on('new_book', function(book){
			stream.write(book);
		});
	}
});

server.bind('0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure());

console.log('Server Running at http://0.0.0.0:50051');
server.start();
