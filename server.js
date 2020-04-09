// server init + mods
// require syntax
main();
function checkStatus(res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
      return res;
  } else {
      throw console.log(res.statusText + ': Most likely a rate limit issue');
  }
}
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
  const client = new MongoClient(uri,{useUnifiedTopology: true});
  var data;

  try {
    //connect cluster
    await client.connect();
     // server route handler
     app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
    });
    // user connected even handler
    io.on('connection', function(socket){  
      socket.on('lookup', function(package){
        console.log(package);
        let url = 'https://api.unsplash.com/search/photos?per_page='+package[0]+'&query='+package[1]+'&client_id=cb74d8278199920f87f738071a4b5957f92c83d2704aa72f0ea8f0fd04564f65';
        let settings = { method: "Get" };
        fetch(url, settings)
          .then(checkStatus).catch(console.log('Rate Limit is 50/hour'))
          .then(res => res.json())
          .then((json) => {
            client.db().collection("data", {capped: false, w:1}, function(err, collection) {
              if(!err){
                collection.insertOne({data: json.results}, {w:1});
              } else {
                console.log(err);
              } 
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
      socket.on('login', function(package){
        console.log(package);
        client.db().collection('users', function(err, collection){
          if(err) console.log(err);
          else 
            collection.findOne({username: package[0], pwd: package[1]}, function(err, res){
              if(err) console.log(err)
              else { 
                console.log(res);
                socket.emit('user_return', res);
              }
            });
        })
      });
      socket.on('save', function(data) {
        console.log(data);
        client.db().collection('users', function(err, collection){
          if(err) console.log(err);
          else  
            collection.findOneAndUpdate({username: data.username, pwd: data.pwd}, { $set: {saved: data[0]} }, function(err, doc) {
              if(err) console.log(err);
              else console.log(doc);
            });
        })
      })
    });
    app.get('/read', function(req, res) {
      client.db().collection('data', function(err, collection) {
          collection.find().toArray(function(err,docs) {
            res.json({data: docs});
        });
      });
    });
    app.get('/lookup', function(req, res) {
      console.log(req.query.keyword);
      let url = 'https://api.unsplash.com/search/photos?page='+req.query.page+'&per_page=25&query='+req.query.keyword+'&client_id=cb74d8278199920f87f738071a4b5957f92c83d2704aa72f0ea8f0fd04564f65';
      let settings = { method: "Get" };
      fetch(url, settings)
        .then(checkStatus).catch(console.log('Rate Limit is 50/hour'))
        .then(res => res.json())
        .then((json) => {
          res.json({data: json.results});
      });
    });
    app.get('/explore', function(req, res) {
      let url = 'https://api.unsplash.com/photos?page='+req.query.page+'&per_page=30&client_id=cb74d8278199920f87f738071a4b5957f92c83d2704aa72f0ea8f0fd04564f65';
      let settings = { method: "Get" };
      fetch(url, settings)
        .catch(err => console.error(err)) 
        .then(res => res.json())
        .then((json) => {
          res.json({data: json});
      });
    })

    app.use(express.static('public'));
    // start server
    http.listen(3000, function(){
      console.log('Server up on *:3000');
    });
  } catch (e) {
    console.error(e);
  } finally {
    console.log("End.")
  }
}
