var app = angular.module("catthings_app");

app.controller('CheckInController', ['$scope', '$http', '$location', '$rootScope', 'inventoryList', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'thingsAPI', 'checkinList', '$q', '$window', CheckInController]);
function CheckInController($scope, $http, $location, $rootScope, inventoryList, DTOptionsBuilder, DTColumnDefBuilder, thingsAPI, checkinList, $q, $window){
  $scope.checkin=[];
  $scope.person={};
  $scope.searchQuery = '';
  $scope.emptyNameError = true;
  $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('sDom', 'rtip');
  var dti;
  var dtInstanceCallback = dtInstanceCallback;

  $scope.dtColumns = [
    DTColumnDefBuilder.newColumnDef(0).withOption('searchable', false),
    DTColumnDefBuilder.newColumnDef(1),
    DTColumnDefBuilder.newColumnDef(2).withOption('searchable', false),
    DTColumnDefBuilder.newColumnDef(3).withOption('searchable', false)
  ]

  $scope.dtInstanceCallback = function(dtInstance){
    dti = dtInstance;
  };

  $scope.searchTable = function(){
    if($scope.searchQuery == null){
      dti.DataTable.search("").draw();
    }
    else{
      dti.DataTable.search($scope.searchQuery);
      dti.DataTable.search($scope.searchQuery).draw();
    }
  };

  //Get latest inventory data from database
  thingsAPI.getView().then(function (response) {
      inventoryList.setInventory(response.data);
      $scope.stuff=inventoryList.getInventory();
  });

  function check(){
    if($scope.checkin.length == 0){
      $scope.checkinNotEmpty = false;
      $scope.checkinEmpty = true;
    }
    else{
      $scope.checkinNotEmpty = true;
      $scope.checkinEmpty = false;
    }
  };
  check();

  //Checkin- Add to checkin
  $scope.addToCheckin = function(item){
    if(item.checkin == true){ //Checked
      //Make copy of the item to add to checkin
      var checkinItem = angular.copy(item);
      checkinItem.uncheckin = false;
      checkinList.addToCheckin(checkinItem);
    }
    else{ //Unchecked
      checkinList.removeFromCheckin(item);
    }
  }

  //Remove selected items from checkin
  $scope.removeSelected = function() {
    $scope.checkin = checkinList.removeSelected();
    check();
  }

  //Check name
  $scope.checkPerson = function(){
    if(angular.isUndefined($scope.person.name)){
      $scope.emptyNameError = true;
    }
    else{
      if($scope.person.name.length == 0){
        $scope.emptyNameError = true;
      }
      else{
        $scope.emptyNameError = false;
      }
    }
  }

  //Check Quantity
  $scope.checkCheckin = function(){
    if($scope.emptyNameError == true){
      if(angular.isUndefined($scope.person.name)){
        return true;
      }
    }
    for(var i = 0; i < $scope.checkin.length; i++){
      if($scope.checkin[i].selectedQuantity == null){ //Not all items have selected quantities
        return true;
      }
      if($scope.checkin[i].selectedQuantity == 0){ //Quantity entered is 0
        $scope.checkin[i].zeroQuantity = true;
        $scope.checkin[i].negativeQuantity = false;
        return true;
      }
      if($scope.checkin[i].selectedQuantity < 0){ //Negative Quantity
        $scope.checkin[i].zeroQuantity = false;
        $scope.checkin[i].negativeQuantity = true;
        return true;
      }
      //All good
      $scope.checkin[i].negativeQuantity = false;
      $scope.checkin[i].zeroQuantity = false;
    }
    return false;
  }

  //Check In
  $scope.confirm = function(){
    var promises = [];
    for(var i = 0; i < $scope.checkin.length; i++){
      promises.push(thingsAPI.checkin($scope.checkin[i].item_id, $scope.person, $scope.checkin[i].selectedQuantity));
    }

    $q.all(promises).then(function(results){
      var failed = [];
      for(var j = 0; j < results.length; j++){
        console.log(results[j]);
        if(results[j].success == false){
          console.log("Unable to check in " + inventoryList.getItemName(results[j].item_id));
          failed.push(inventoryList.getItemName(results[j].item_id));
        }
      }
      //Display any error messages
      if(failed.length > 0){
        $window.alert("Unable to check in the following item(s):\n" + failed);
      }
      else{
        $window.alert("All items successfully checked in!");
      }
      //Update inventory with new quantities
      thingsAPI.getView().then(function(response) {
        inventoryList.setInventory(response.data);
        $scope.stuff=inventoryList.getInventory();
        $scope.checkin.length = 0; //Bizare way to clear array
        $scope.checkinEmpty = true;
        $scope.checkinNotEmpty = false;
      });
    });
  }

  //Broadcast for when items are added to Checkin
  $scope.$on("CheckinAdd", function(event, toCheckin){
    $scope.checkin = toCheckin;
    check();
  });

  //Broadcast for when item is removed from checkin in Inventory list
  $scope.$on("RemoveCheckin", function(event, toCheckin){
    $scope.checkin = toCheckin;
    check();
  });

  //Uncheck items in inventory table that have been removed from checkin
  $scope.$on("CheckinUncheck", function(event, toUncheck){
    for(var i = 0; i < toUncheck.length; i++){
      for(var j = 0; j < $scope.stuff.length; j++){
        if ($scope.stuff[j].item_id == toUncheck[i]){
          $scope.stuff[j].checkin = false;
        }
      }
    }
  });
}