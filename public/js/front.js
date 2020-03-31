// load socket.io-client
var socket = io();
var app = angular.module("app", []);
// Here is the Javascript for our controller which we linked (scoped) to the body tag
app.controller("controller", ['$scope','$http',function($scope, $http) {
  $scope.items=[];
  $scope.lookup;
  $scope.item_count=[5,10,20];
  $scope.count = 5;
  $scope.search = function(){
    $scope.items=[];
    $scope.package =[]
    $scope.package.push($scope.lookup);
    $scope.package.push($scope.count);
    console.log($scope.package);
    socket.emit('lookup', $scope.package);
    socket.on('response', function() {
      $http.get('data.json')
      .then(function(response) {
          console.log(response);
          angular.forEach(response.data, function(value) {
              $scope.items.push(value.urls.full);
              console.log(value);
          }, $scope.items);
        });      
      })
    }

  $scope.getItems = function() {
    $http.get('data.json').then(function(response) {
       console.log(response);
       angular.forEach(response.data, function(value) {
          $scope.items.push(value.urls.full);
       }, $scope.items);
     });     
    }
}]);