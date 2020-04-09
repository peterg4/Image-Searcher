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
      console.log(data);
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0)
          $scope.items.push(data.data.data[i].urls.small);
        else if((i+1) % 2 == 0)
          $scope.items2.push(data.data.data[i].urls.small);
        else if((i+1) % 1 == 0)
          $scope.items3.push(data.data.data[i].urls.small);
      }
    });
  }
  //adds more data when you hit the bottom of the page
  $scope.moreSearch = function(){
    $scope.page_count++;
    $http.get("/lookup?keyword="+$scope.keyword+"&page="+$scope.page_count).then(function(data) { 
      console.log(data);
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0)
          $scope.items.push(data.data.data[i].urls.small);
        else if((i+1) % 2 == 0)
          $scope.items2.push(data.data.data[i].urls.small);
        else if((i+1) % 1 == 0)
          $scope.items3.push(data.data.data[i].urls.small);
      }
    });
  }
  //gets trending images from unslpash and populates the page
  $scope.explore = function() {
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    $scope.page_count = 1;
    $http.get("/explore?page=1").then(function(data) {
      console.log(data);
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0)
          $scope.items.push(data.data.data[i].urls.small);
        else if((i+1) % 2 == 0)
          $scope.items2.push(data.data.data[i].urls.small);
        else if((i+1) % 1 == 0)
          $scope.items3.push(data.data.data[i].urls.small);
      }
    });
  }
  //adds more trending images if you hit the bottom of the page
  $scope.moreExplore = function() {
    $scope.page_count++;
    $http.get("/explore?page="+$scope.page_count).then(function(data) {
      console.log(data);
      for(var i = 0; i < data.data.data.length; i++) {
        if((i+1) % 3 == 0)
          $scope.items.push(data.data.data[i].urls.small);
        else if((i+1) % 2 == 0)
          $scope.items2.push(data.data.data[i].urls.small);
        else if((i+1) % 1 == 0)
          $scope.items3.push(data.data.data[i].urls.small);
      }
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
      for(var i = 0; i < data.data.data[index].data.length; i++) {
        if((i+1) % 3 == 0)
          $scope.items.push(data.data.data[index].data[i].urls.small);
        else if((i+1) % 2 == 0)
          $scope.items2.push(data.data.data[index].data[i].urls.small);
        else if((i+1) % 1 == 0)
          $scope.items3.push(data.data.data[index].data[i].urls.small);
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
  //logs a user out of the DB
  $scope.logout = function() {
    $scope.logged = 0;
    $scope.userdata = 0;
    $scope.target = '#login';
  }
}]);