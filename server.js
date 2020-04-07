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
  const Json2csvParser = require("json2csv").Parser;
  const {MongoClient} = require('mongodb');
  const uri = "mongodb+srv://gpeterson:X4CCPcfnMbJ1ZQN6@cluster0-pt6fc.mongodb.net/lab6?retryWrites=true&w=majority";
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
            client.db().collection("data", {capped: false, w:1}, function(err, collection) {
              collection.insertOne({data: json.results}, {w:1});
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
      socket.on('export', function(format) {
        client.db().collections(function(err, collections) {
          if(collections.length) {
            collections[0].find().toArray(function(err,docs) {
              console.log(docs);
              if(format == 'json') {
                fs.writeFile('public/peterg4-lab5.json', JSON.stringify(docs), function (err) {
                  if (err) return console.log(err);
                });
              } else {
                const json2csvParser = new Json2csvParser({ header: true });
                const csvData = json2csvParser.parse(docs);
                fs.writeFile('public/peterg4-lab5.csv', csvData, function (err) {
                  if (err) return console.log(err);
                });
              }
            })
          }
        });
      });
      socket.on('register', function(package) {
        console.log(package);
        client.db().collection('users', function(err, collection){
          if(err) console.log(err);
          else collection.insertOne({username: package[0], pwd: package[1]}, {w:1});
        })
      });
    });
    app.get('/read', function(req, res) {
      client.db().collection('data', function(err, collection) {
          collection.find().toArray(function(err,docs) {
            console.log(docs);
            res.json({data: docs});
        });
      });
    });

    app.use(express.static('public'));
    // start server
    http.listen(3000, function(){
      console.log('Server up on *:3000');
    });
  }
}
