// load socket.io-client
var socket = io();
var app = angular.module("app", []);
// Here is the Javascript for our controller which we linked (scoped) to the body tag
app.controller("controller", ['$scope','$http',function($scope, $http) {
  $scope.items=[];
  $scope.lookup;
  $scope.item_count=[5,10,20];
  $scope.export = 'json';
  $scope.exports = ['json','CSV'];
  $scope.count = 5;
  $scope.search = function(){
    $scope.items=[];
    $scope.package=[];
    $scope.package.push($scope.lookup);
    $scope.package.push($scope.count);
    console.log($scope.package);
    socket.emit('lookup', $scope.package);
  }
  $scope.read = function(){
    $scope.items = []; 
    $http.get("/read").then(function(data) {
      console.log(data.data.data[0].data)
      var index = data.data.data.length-1;
      console.log(data.data.data[index].data.length);
      for(var i = 0; i < data.data.data[index].data.length; i++) {
        $scope.items.push(data.data.data[index].data[i].urls.raw);
      }
      console.log($scope.items);
    });
  }
  $scope.reset = function(){
    $scope.items = [];
    socket.emit('reset');
  }
}]);