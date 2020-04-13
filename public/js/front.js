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
        var sublikes = 0;
        for( var j = 0; j < obj[i].data.length; j++) {
          sublikes += obj[i].data[j].likes;
        }
        likes.push(sublikes);
        titles.push(obj[i].data[0].tags[0].title);
      }
      console.log(likes);
      console.log(titles);
      var ctx = document.getElementById('myChart').getContext('2d');
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: titles,
          datasets: [{
              label: 'Most Liked Pix by Tag (separated by search instances)',
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
                  display: true
              }
            }]
          }
        }
      });

      var ctx = document.getElementById('myChart2').getContext('2d');
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: titles,
          datasets: [{
              label: 'Most Liked Pix by Tag (separated by search instances)',
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
                  display: true
              }
            }]
          }
        }
      });

      // Themes begin
      am4core.useTheme(am4themes_animated);
      // Themes end

      // Create map instance
      var chart = am4core.create("chartdiv", am4maps.MapChart);

      // Set map definition
      chart.geodata = am4geodata_worldLow;

      // Set projection
      chart.projection = new am4maps.projections.Miller();

      // Create map polygon series
      var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

      // Exclude Antartica
      polygonSeries.exclude = ["AQ"];

      // Make map load polygon (like country names) data from GeoJSON
      polygonSeries.useGeodata = true;

      // Configure series
      var polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}";
      polygonTemplate.polygon.fillOpacity = 0.6;


      // Create hover state and set alternative fill color
      var hs = polygonTemplate.states.create("hover");
      hs.properties.fill = chart.colors.getIndex(0);

      // Add image series
      var imageSeries = chart.series.push(new am4maps.MapImageSeries());
      imageSeries.mapImages.template.propertyFields.longitude = "longitude";
      imageSeries.mapImages.template.propertyFields.latitude = "latitude";
      imageSeries.mapImages.template.tooltipText = "{title}";
      imageSeries.mapImages.template.propertyFields.url = "url";

      var circle = imageSeries.mapImages.template.createChild(am4core.Circle);
      circle.radius = 3;
      circle.propertyFields.fill = "color";

      var circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
      circle2.radius = 3;
      circle2.propertyFields.fill = "color";


      circle2.events.on("inited", function(event){
        animateBullet(event.target);
      })


      function animateBullet(circle) {
          var animation = circle.animate([{ property: "scale", from: 1, to: 5 }, { property: "opacity", from: 1, to: 0 }], 1000, am4core.ease.circleOut);
          animation.events.on("animationended", function(event){
            animateBullet(event.target.object);
          })
      }

      var colorSet = new am4core.ColorSet();

      imageSeries.data = [ {
        "title": "Brussels",
        "latitude": 50.8371,
        "longitude": 4.3676,
        "color":colorSet.next()
      }, {
        "title": "Copenhagen",
        "latitude": 55.6763,
        "longitude": 12.5681,
        "color":colorSet.next()
      }, {
        "title": "Paris",
        "latitude": 48.8567,
        "longitude": 2.3510,
        "color":colorSet.next()
      }, {
        "title": "Reykjavik",
        "latitude": 64.1353,
        "longitude": -21.8952,
        "color":colorSet.next()
      }, {
        "title": "Moscow",
        "latitude": 55.7558,
        "longitude": 37.6176,
        "color":colorSet.next()
      }, {
        "title": "Madrid",
        "latitude": 40.4167,
        "longitude": -3.7033,
        "color":colorSet.next()
      }, {
        "title": "London",
        "latitude": 51.5002,
        "longitude": -0.1262,
        "url": "http://www.google.co.uk",
        "color":colorSet.next()
      }, {
        "title": "Peking",
        "latitude": 39.9056,
        "longitude": 116.3958,
        "color":colorSet.next()
      }, {
        "title": "New Delhi",
        "latitude": 28.6353,
        "longitude": 77.2250,
        "color":colorSet.next()
      }, {
        "title": "Tokyo",
        "latitude": 35.6785,
        "longitude": 139.6823,
        "url": "http://www.google.co.jp",
        "color":colorSet.next()
      }, {
        "title": "Ankara",
        "latitude": 39.9439,
        "longitude": 32.8560,
        "color":colorSet.next()
      }, {
        "title": "Buenos Aires",
        "latitude": -34.6118,
        "longitude": -58.4173,
        "color":colorSet.next()
      }, {
        "title": "Brasilia",
        "latitude": -15.7801,
        "longitude": -47.9292,
        "color":colorSet.next()
      }, {
        "title": "Ottawa",
        "latitude": 45.4235,
        "longitude": -75.6979,
        "color":colorSet.next()
      }, {
        "title": "Washington",
        "latitude": 38.8921,
        "longitude": -77.0241,
        "color":colorSet.next()
      }, {
        "title": "Kinshasa",
        "latitude": -4.3369,
        "longitude": 15.3271,
        "color":colorSet.next()
      }, {
        "title": "Cairo",
        "latitude": 30.0571,
        "longitude": 31.2272,
        "color":colorSet.next()
      }, {
        "title": "Pretoria",
        "latitude": -25.7463,
        "longitude": 28.1876,
        "color":colorSet.next()
      } ];



    });
  }
}]);