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
  const uri = "mongodb+srv://gpeterson:X4CCPcfnMbJ1ZQN6@cluster0-pt6fc.mongodb.net/test?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  var data;
  async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    clusters = await client.db().collections();

    console.log("Databases:");
    console.log(clusters);
    databasesList.databases.forEach(db => console.log(db));
  };

  try {
    //connect cluster
    await client.connect();
    //make db call
    await listDatabases(client);

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
            console.log(json.results);
            fs.writeFile('public/data.json', JSON.stringify(json.results), function (err) {
              if (err) return console.log(err);
              socket.emit('response');
            });
          });
      });
    });
    app.use(express.static('public'));
    // start server
    http.listen(3000, function(){
      console.log('Server up on *:3000');
    });
   // await client.close();
  }
}
