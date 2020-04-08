// load socket.io-client
var socket = io();
var app = angular.module("app", []);
// Here is the Javascript for our controller which we linked (scoped) to the body tag
app.controller("controller", ['$scope','$http',function($scope, $http) {
  $scope.items=[];
  $scope.items2=[];
  $scope.items3=[];
  $scope.items4=[];
  $scope.lookup;
  $scope.format = 'JSON';
  $scope.exports = ['JSON','CSV'];
  $scope.count = 25;
  $scope.currid = 'home';
  $scope.view = 0;
  $scope.username;
  $scope.password;
  $scope.class="show";
  $scope.search = function(){
    $scope.items=[];
    $scope.package=[];
    $scope.package.push($scope.lookup);
    $scope.package.push($scope.count);
    console.log($scope.package);
    socket.emit('lookup', $scope.package);
  }
  $scope.read = function(){
    $scope.items=[];
    $scope.items2=[];
    $scope.items3=[];
    $scope.items4=[];
    
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
    $scope.items = [];
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
  
}]);