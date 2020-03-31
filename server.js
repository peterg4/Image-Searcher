// server init + mods
// require syntax
main();
async function main() {

  const fetch = require('node-fetch');
  global.fetch = fetch;
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var express = require('express');
  var fs = require('fs');
  const {MongoClient} = require('mongodb');
  const uri = "mongodb+srv://gpeterson:X4CCPcfnMbJ1ZQN6@cluster0-pt6fc.mongodb.net/lab5?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  var data;

  try {
    //connect cluster
    await client.connect();

  } catch (e) {
    console.error(e);
  } finally {
    // server route handler
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
    });
    // user connected even handler
    io.on('connection', function(socket){  
      socket.on('lookup', function(package){
        console.log(package);
        let url = 'https://api.unsplash.com/search/photos?per_page='+package[1]+'&query='+package[0]+'&client_id=cb74d8278199920f87f738071a4b5957f92c83d2704aa72f0ea8f0fd04564f65';
        let settings = { method: "Get" };
        fetch(url, settings)
          .then(res => res.json())
          .then((json) => {
            client.db().createCollection("data", {capped: false, w:1}, function(err, collection) {
              collection.insert({data: json.results}, {w:1});
            });
          });
      });
      socket.on('reset', function() {
        client.db().collections(function(err, collections) {
          collections.forEach(function(collection) {
            collection.drop();
          })
        })
      });
    });
    app.get('/read', function(req, res) {
      client.db().collections(function(err, collections) {
        collections[0].find().toArray(function(err,docs) {
          console.log(docs);
          res.json({data: docs})
        })
      });
    });
  /*  socket.on('export', function(format) {
      //export
    });*/

    app.use(express.static('public'));
    // start server
    http.listen(3000, function(){
      console.log('Server up on *:3000');
    });
   // await client.close();
  }
}
