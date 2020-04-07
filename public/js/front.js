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
  $scope.item_count=[5,10,20];
  $scope.format = 'JSON';
  $scope.exports = ['JSON','CSV'];
  $scope.count = 20;
  $scope.currid = 'home';
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
        if(i < 5)
          $scope.items.push(data.data.data[index].data[i].urls.regular);
        else if(i >=5 && i < 10)
          $scope.items2.push(data.data.data[index].data[i].urls.regular);
        else if(i >=10 && i < 15)
          $scope.items3.push(data.data.data[index].data[i].urls.regular);
        else
          $scope.items4.push(data.data.data[index].data[i].urls.regular);
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
}]);