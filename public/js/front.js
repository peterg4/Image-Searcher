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

  $scope.search = function(keyword){
    var package = [$scope.count, keyword];
    console.log(package);
    socket.emit('lookup', package);
    $http.get("/lookup?keyword="+package[1]).then(function(data) {
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
  $scope.explore = function() {
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
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
  $scope.newExplore = function() {
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
  $scope.reset = function(){
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    socket.emit('reset');
  }
  $scope.export = function(format) {
    console.log(format);
    socket.emit('export', format);
  }
  $scope.changeActive = function(id) {
    document.getElementById($scope.currid).className = 'nav-link';
    document.getElementById(id).className = 'nav-link active';
    $scope.currid = id;
  }
  $scope.register = function() {
    var package = [$scope.username, $scope.password];
    console.log('register', package);
    socket.emit('register', package);
  }
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
  $scope.logout = function() {
    $scope.logged = 0;
    $scope.userdata = 0;
    $scope.target = '#login';
  }
}]);