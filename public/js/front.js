// load socket.io-client
var socket = io();
var app = angular.module("app", ['infinite-scroll']);

// Here is the Javascript for our controller which we linked (scoped) to the body tag
app.controller("controller", ['$scope','$http',function($scope, $http) {
  
  var scr = document.getElementsByTagName("BODY")[0];
  var intElemScrollTop = scr.scrollTop;
  console.log(intElemScrollTop);
  $scope.items=[];
  $scope.items2=[];
  $scope.items3=[];
  $scope.keyword;
  $scope.format = 'JSON';
  $scope.exports = ['JSON','CSV'];
  $scope.count = 25;
  $scope.currid = 'home';
  $scope.view = 0;
  $scope.username;
  $scope.password;
  $scope.class="show";
  $scope.userdata = 0;
  $scope.logged = 0;
  $scope.target = '#login';
  $scope.page_count = 1;
  //helper function for reading data into rows
  $scope.populate = function(data) {
    console.log(data);
    var entry = [];
    for(var i = 0; i < data.data.data.length; i++) {
      if((i+1) % 3 == 0) {
        entry = [];
        entry.push(data.data.data[i].urls.small);
        entry.push(data.data.data[i].user.name);
        entry.push(data.data.data[i].user.profile_image.small);
        $scope.items.push(entry);
      } else if((i+1) % 2 == 0) {
        entry = [];
        entry.push(data.data.data[i].urls.small);
        entry.push(data.data.data[i].user.name);
        entry.push(data.data.data[i].user.profile_image.small);
        $scope.items2.push(entry);
      }
      else if((i+1) % 1 == 0) {
        entry = [];
        entry.push(data.data.data[i].urls.small);
        entry.push(data.data.data[i].user.name);
        entry.push(data.data.data[i].user.profile_image.small);
        $scope.items3.push(entry);
      }
    }
  }
  //populated columns with data from search unsplash api call
  $scope.search = function(keyword){
    $scope.page_count = 1;
    $scope.keyword = keyword;
    var package = [$scope.count, keyword];
    console.log(package);
    socket.emit('lookup', package);
    $http.get("/lookup?keyword="+package[1]+"&page=1").then(function(data) {
      $scope.items=[];
      $scope.items2=[];
      $scope.items3=[];
      $scope.populate(data);
    });
  }
  //adds more data when you hit the bottom of the page
  $scope.moreSearch = function(){
    $scope.page_count++;
    $http.get("/lookup?keyword="+$scope.keyword+"&page="+$scope.page_count).then(function(data) { 
      $scope.populate(data);
    });
  }
  //gets trending images from unslpash and populates the page
  $scope.explore = function() {
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    $scope.page_count = 1;
    $http.get("/explore?page=1").then(function(data) {
      $scope.populate(data);
    });
  }
  //adds more trending images if you hit the bottom of the page
  $scope.moreExplore = function() {
    $scope.page_count++;
    $http.get("/explore?page="+$scope.page_count).then(function(data) {
      $scope.populate(data);
    });
  }
  //reads results from the database returns info about most recent search
  $scope.read = function(){
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    
    $http.get("/read").then(function(data) {
      console.log(data);
      var index = data.data.data.length-1;
      var entry = [];
      for(var i = 0; i < data.data.data[index].data.length; i++) {
        if((i+1) % 3 == 0) {
          entry = [];
          entry.push(data.data.data[index].data[i].urls.small);
          entry.push(data.data.data[index].data[i].user.name);
          entry.push(data.data.data[index].data[i].user.profile_image.small);
          $scope.items.push(entry);
        }
        else if((i+1) % 2 == 0) {
          entry = [];
          entry.push(data.data.data[index].data[i].urls.small);
          entry.push(data.data.data[index].data[i].user.name);
          entry.push(data.data.data[index].data[i].user.profile_image.small);
          $scope.items2.push(entry);
        }
        else if((i+1) % 1 == 0) {
          entry = [];
          entry.push(data.data.data[index].data[i].urls.small);
          entry.push(data.data.data[index].data[i].user.name);
          entry.push(data.data.data[index].data[i].user.profile_image.small);
          $scope.items3.push(entry);
        }
      }
    });
  }
  //resets all data in the database -- includes userdata
  $scope.reset = function(){
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    socket.emit('reset');
  }
  //exports to selected format
  $scope.export = function(format) {
    console.log(format);
    socket.emit('export', format);
  }
  //chanages the selected navbar element
  $scope.changeActive = function(id) {
    document.getElementById($scope.currid).className = 'nav-link';
    document.getElementById(id).className = 'nav-link active';
    $scope.currid = id;
  }
  //registers a user in the database
  $scope.register = function() {
    var package = [$scope.username, $scope.password];
    console.log('register', package);
    socket.emit('register', package);
  }
  //logs a user into the DB - stores userdata in var
  $scope.login = function() {
    var package = [$scope.username, $scope.password];
    console.log(package);
    socket.emit('login', package);
    socket.on('user_return', function(data) {
      $scope.userdata = data;
      if(data) {
        $scope.logged = 1; 
        console.log($scope.logged);
        $scope.$apply(function () {
          $scope.userdata = data;
          $scope.logged = 1;
          $scope.target = '#upl';
        })
      }
      console.log($scope.userdata);
    });
  }
  //saves an image to a users profile
  $scope.save = function(data) {
    var pack = {...data, ...$scope.userdata};
    console.log(pack);
    socket.emit('save', pack);
  }
  //logs a user out of the DB
  $scope.logout = function() {
    $scope.logged = 0;
    $scope.userdata = 0;
    $scope.target = '#login';
    $scope.currid='home';
  }
  $scope.collections = function() { 
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    $scope.page_count = 1;
    $http.get("/collections?page=1").then(function(data) {
      console.log(data);
      var entry = [];
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items.push(entry);
        } else if((i+1) % 2 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items2.push(entry);
        }
        else if((i+1) % 1 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items3.push(entry);
        }
      }
    });
  }
  $scope.moreCollections = function() {
    $scope.page_count++;
    $http.get("/collections?page="+$scope.page_count).then(function(data) {
      console.log(data);
      var entry = [];
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items.push(entry);
        } else if((i+1) % 2 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items2.push(entry);
        }
        else if((i+1) % 1 == 0) {
          entry = [];
          entry.push(data.data.data[i].cover_photo.urls.small);
          entry.push(data.data.data[i].title);
          entry.push(data.data.data[i].user.profile_image.small);
          entry.push(data.data.data[i].links.html);
          $scope.items3.push(entry);
        }
      }
    });
  }
  //open a specific collection on unplash
  $scope.open = function(data) {
    console.log(data);
    $http.get("/collections/collectionById?id="+data[3]).then(function(doc) {
      console.log(doc);
    });
  }
  //read userdata
  $scope.readData = function() {
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    for(var i = 0; i < $scope.userdata.saved.length; i++) {
      if((i+1) % 3 == 0) {
        entry = [];
        entry.push($scope.userdata.saved);
        $scope.items.push(entry);
      } else if((i+1) % 2 == 0) {
        entry = [];
        entry.push($scope.userdata.saved);
        $scope.items2.push(entry);
      }
      else if((i+1) % 1 == 0) {
        entry = [];
        entry.push($scope.userdata.saved);
        $scope.items3.push(entry);
      }
    }
  }
  //
  $scope.statistics = function() {
    $http.get("/stats").then(function(data) {
      console.log(data.data.data);
      var obj =  data.data.data;
      var likes = [];
      var titles = [];
      
      for(var i = 0; i < obj.length; i++) {
        for( var j = 0; j < obj[i].data.length; j++) {
          likes.push(obj[i].data[j].likes);
          titles.push(obj[i].data[j].tags[0].title);
        }
      }
      console.log(likes);
      console.log(titles);
      var ctx = document.getElementById('myChart').getContext('2d');
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: titles,
          datasets: [{
              label: 'Most Liked Pix',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: likes,
            }]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }],
            xAxes: [{
              ticks: {
                  display: false 
              }
            }]
          }
        }
      });
    });
  }
}]);