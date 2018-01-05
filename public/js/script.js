/*global angular*/
/*jslint indent: 2*/
(function () {
  "use strict";

  var app=angular.module('Example', []);

  //Defining first controller
  app.controller('mycontroller', function($http,$scope, $window) {

  $scope.register = function() {
  //register to server and then redirect to dashboard
  	$scope.username;
  	$scope.password.new;
  	$scope.password.confirm;

    	  //console.log($scope.username)
    	  //console.log($scope.password.new)
    	  //console.log($scope.password.confirm)


    	var json_string1=JSON.stringify([{username:$scope.username,password:$scope.password.new}]);
    	//console.log(json_string1)
  			
  		$http({
  			method:'POST',
  			url: 'http://127.0.0.1:3000/user',
  			data: json_string1,
  			headers:{'Content-Type':'application/json'}
  		}).then(function (response){
        if (angular.equals(response.data.message,"Entry exists")) {

            alert("Username exists. Try another username.!");
          
        }
        else{
  			console.log(response)
        console.log(response.data)
        console.log(response.data.username)
        $window.localStorage.setItem('username',response.data.username)
  			$window.location.href='../views/index.html'		
        }
  		});
    	  
    }

  $scope.login = function() {
  //login to server and then redirect to dashboard
    $scope.username;
    $scope.password;
        //console.log($scope.username)
        //console.log($scope.password)
        var json_string2=JSON.stringify([{username:$scope.username , password:$scope.password}]);
        //console.log(json_string2)
        
      $http({
        method:'POST',
        url: 'http://127.0.0.1:3000/userlogin',
        data: json_string2,
        headers:{'Content-Type':'application/json'}
      }).then(function (response){
        //console.log(response)
        if (angular.equals(response.data.message,"No data found")) {

          alert("Check credentials");
        }
        else if(angular.equals(response.data.message,"server error")){

          alert("Server Error");
        }
        else{
        $window.localStorage.setItem('username',response.data.username)

        $window.location.href='./views/index.html' 
        }   
      });
        
  };

});
  app.directive('valueMatches', ['$parse', function ($parse) {
    return {
      require: 'ngModel',
          link: function (scope, elm, attrs, ngModel) {
            var originalModel = $parse(attrs.valueMatches),
                secondModel = $parse(attrs.ngModel);
            // Watch for changes to this input
            scope.$watch(attrs.ngModel, function (newValue) {
              ngModel.$setValidity(attrs.name, newValue === originalModel(scope));
            });
            // Watch for changes to the value-matches model's value
            scope.$watch(attrs.valueMatches, function (newValue) {
              ngModel.$setValidity(attrs.name, newValue === secondModel(scope));
            });
          }
        };
    }]);
    
//Defining second controller
app.controller('SettingsController1', function($http,$scope, $window) {
//using username and password get uid of the user and then push those uid to create the consoles


$scope.lock;
$scope.robo;
$scope.local_user=$window.localStorage.getItem('username');
console.log($scope.local_user)
$scope.robot = [] //array of all the bots
$scope.doorlock = [] //array of all the locks
$http.get("http://127.0.0.1:3000/user/"+$window.localStorage.getItem('username'))
    .then(function(response){
      console.log(response);
      $scope.products=response.data.productId;

      var arrayLength = $scope.products.length;
      //console.log(arrayLength)
      for (var i = 0; i < arrayLength; i++) {
        //console.log($scope.products[i])
        var str = $scope.products[i].uid; 
        var n = str.search("lock");
        //console.log(n);
          if (angular.equals(n,-1)){
            //console.log("lock not present")
          }
          else{
            $scope.doorlock.push({'uid':'-'+$scope.products[i].uid,'message':$scope.products[i].status})
            //added message while pushing elements so as to display individual status of each device
          }

      }
      for (var i = 0; i < arrayLength; i++) {
        //console.log($scope.products[i].uid)
        var str = $scope.products[i].uid; 
        var n = str.search("bot");
        //console.log(n);
          if (angular.equals(n,-1)){
            //console.log("bot not present")
          }
          else{
            $scope.robot.push({'uid':'-'+$scope.products[i].uid,'message':$scope.products[i].status})
            //added message while pushing elements so as to display individual status of each device
            //console.log($scope.robot);
          }

      }
      
    });



  $scope.addrobot = function() {
    //first send request to server and verify uid, then push item
  	  var newItemNo = $scope.robot.length+1;
  	  console.log($scope.robo);
      console.log($scope.robot.length);
      var json_string3=JSON.stringify([{username:$scope.local_user, productId:$scope.robo, status:'Inactive'}]);
      // sending a default status field so as to add an entry ina database[refer schema]
      //console.log(json_string3)
      
    $http({
      method:'POST',
      url: 'http://127.0.0.1:3000/user/'+$window.localStorage.getItem('username'),
      data: json_string3,
      headers:{'Content-Type':'application/json'}
    }).then(function (response){
        console.log(response)
          if (angular.equals(response.data.message,"pushed")){
          $scope.robot.push({'uid':'-'+$scope.robo,'message':'Inactive'})
          //setting up a default message for first time device creation
          $window.location.href='./index.html'
          }
          else
          {
            alert("Product exists")
          }
    });
  };

  $scope.adddoorlock = function() {

  	var newItemNo = $scope.doorlock.length+1;
    //first send request to server and verify uid, then push item
    var json_string4=JSON.stringify([{username:$scope.local_user, productId:$scope.lock, status:'Inactive'}]);
    // sending a default status field so as to add an entry ina database[refer schema]
      console.log(json_string4)
      $http({
      method:'POST',
      url: 'http://127.0.0.1:3000/user/'+$window.localStorage.getItem('username'),
      data: json_string4,
      headers:{'Content-Type':'application/json'}
    }).then(function (response){
      console.log(response)
          if (angular.equals(response.data.message,"pushed")){
          $scope.doorlock.push({'uid':'-'+$scope.lock,'message':'Inactive'})
          //setting up a default message for first time device creation
          $window.location.href='./index.html'
          }
          else
          {
            alert("Prouct exists")
          }
    });
    
  };

$scope.command=function(product_id,command){
  //retrieve command and robot id through parameters of this function
  $scope.local_user1=$window.localStorage.getItem('username');
  var string_1=product_id; //product_id is not a string
  $scope.cmd=command;
  //var length_string1=string_1.length;
  var bot_number=string_1.slice(1) // to remove the escape character
  //console.log(bot_number);
  //console.log($scope.cmd);
  //console.log($scope.local_user1);
 var index = $scope.products.findIndex(x => x.uid==bot_number);
 //searching for the _id corresponding to the button pressed from selected console
  //console.log(index)


  var json_string5=JSON.stringify([{username:$scope.local_user1, productId:bot_number, cmd:$scope.cmd, id:$scope.products[index]._id}]);
  //sending the command and _id to server so that it can update that particular device's status 
      //console.log(json_string5)
  $http({
      method:'POST',
      url: 'http://127.0.0.1:3000/userid/'+$window.localStorage.getItem('username'),
      data: json_string5,
      headers:{'Content-Type':'application/json'}
    }).then(function (response){
      console.log(response.data);
      var ind = $scope.robot.findIndex(x => x.uid==string_1)
      //console.log(ind)
      //console.log($scope.robot)
      $scope.robot[ind].message=response.data.message;//updating the status of bot in robot array
      //console.log($scope.robot)
      
    });
};


$scope.logout = function() {
//logout and clean username
  	  console.log('done')
      
      $window.localStorage.removeItem('username')
      //console.log($window.localStorage.getItem('username'))
      window.location.href="http://127.0.0.1:3000";

    };

});



}());



//$scope.products=$window.localStorage.getItem('productId');
//console.log($scope.products);
//var myStringArray = ["Hello","World"];
//var arrayLength = $scope.products.length;
//console.log(arrayLength)
//for (var i = 0; i < arrayLength; i++) {
  //  alert(myStringArray[i]);
    //Do something
//}

//get function
//on the basis of username get all the relevant devices(lock"__" & bot"__")
//arr=res.data.json
//for loop
//arr[i]
//if element == lock
//var newItemNo = $scope.doorlock.length+1;//first send request to server and verify uid, then push item
//$scope.doorlock.push({'uid':'-'+ valfromserver})
//else element == robot
//var newItemNo = $scope.robot.length+1;//first send request to server and verify uid, then push item
//$scope.robot.push({'uid':'-'+ valfromserver})
//end loop
//console.log($scope.products[index].uid)
      //$scope.robot.push({'uid':'-'+$scope.products[index].uid,'message':response.data.message})
      //console.log($scope.robot.message)
      //$scope.robot.message=response.data.message;
      //$window.location.href='./index.html'    // just  refreshing the page to load the current status message of the devices after the button press
     // $scope.message = response.data.message;
     // $scope.robot.splice(ind,ind,{'uid':'-'+$scope.products[index].uid,'message':response.data.message})
     //$window.localStorage.removeItem('productId')