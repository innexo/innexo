"use strict"

var calcDate = curDate();

function isFilled(value){
  return ((value !== "") && (value !== null));
}

function checkValidRange(which, minField, maxField, type){
  if (isFilled(minField.value) && isFilled(maxField.value)) {
    if (minField.value > maxField.value) {
      switch (which) {
        case "minField":
          maxField.value = minField.value;
          break;

        case "maxField":
          minField.value = maxField.value;
          break;
      }
    }
    if (type == "date"){
      if ((maxField.value > calcDate) || (minField.value > calcDate)) {
        maxField.value = calcDate;
        minField.value = calcDate;
      }
      if (minField.value == maxField.value) {
        checkValidRange("maxField", minTimeField, maxTimeField, "time");
      }
    }
  }
}

function norm(num) {
  if (String(num).length == 1) {
    return ("0" + num);
  }
  return (num);
}

function curDate() {
  var date =  new Date();
  var yrs = date.getFullYear();
  var mth = norm(date.getMonth() + 1);
  var day = norm(date.getDate());
  return (yrs + "-" + mth + "-" + day);
}

function onQueryClick() {
var encounterId = undefined; //TODO add query box
var userId = parseInt(document.getElementById("ID-input").value, 10);
var userName = document.getElementById("name-input").value;
var locationId = undefined;//document.getElementById('locationId').value;
var type = undefined;
var minDate = new Date(document.getElementById("min-date").value+"T"+document.getElementById("min-time").value+":00");
var maxDate = new Date(document.getElementById("max-date").value+"T"+document.getElementById("max-time").value+":00");
var count = 100;
submitQuery(encounterId, userId, userName, locationId, type, minDate, maxDate, count);
}

function normTimestamp(time){
  var date = new Date(time);
  var yrs = date.getFullYear();
  var mth = norm(date.getMonth() + 1);
  var day = norm(date.getDate());
  var hrs = norm(date.getHours());
  var min = norm(date.getMinutes());
  return(mth+"/"+day+"/"+yrs+" "+hrs+":"+min);
}

function addQueryEntry(encounter) {
  var table = document.getElementById('result-table');
  var signInOrSignOutText = encounter.type == 'in' ?
              '<i class="fa fa-sign-in text-red"></i> Signed-In' :
              '<i class="fa fa-sign-out text-blue"></i> Signed-Out';
  if(table.rows.length < 1) {
    clearResultTable();
  }
  table.insertRow(1).innerHTML=
    
    ('<tr>' +
    '<td>' + encounter.user.name+ '</td>' +
    '<td>' + signInOrSignOutText + '</td>' +
    '<td>' + encounter.location.name + '</td>' +
    '<td>' + normTimestamp(encounter.time) + '</td>' +
    '</tr>');
}

function clearResultTable() {
  document.getElementById('result-table').innerHTML =
            '<tr class="dark-gray">'+
              '<td>Name</td>'+
              '<td>In/Out</td>'+
              '<td>Location</td>'+
              '<td>Time</td>'+
            '</tr>';
}

//gets new data from server and inserts it at the beginning
function submitQuery(encounterId, userId, userName, locationId, type, minDate, maxDate, count) {
  var url = thisUrl() + '/encounter/?apiKey=' + Cookies.getJSON('apiKey').key +
    (isNaN(encounterId) ?       '' : '&encounterId='+encounterId) +
    (isNaN(userId) ?            '' : '&userId='+userId) +
    (!isValidString(userName) ? '' : '&userName='+userName) +
    (isNaN(locationId) ?        '' : '&locationId='+locationId) +
    (!isValidString(type) ?     '' : '&type='+encodeURIComponent(type)) +
    (isNaN(minDate.getTime()) ? '' : '&minDate='+minDate.getTime()) +
    (isNaN(maxDate.getTime()) ? '' : '&maxDate='+maxDate.getTime()) +
    (isNaN(count) ?             '' : '&count='+count);
  console.log('making request to: ' + url);
  request(url,
    function(xhr){
      var encounters = JSON.parse(xhr.responseText);
      clearResultTable();
      for(var i = 0; i < encounters.length; i++) {
        addQueryEntry(encounters[i]);
      }
    },
    function(xhr)
    {
      console.log(xhr);
    }
  );
}

// make sure they're signed in every 10 seconds
setInterval(function(){
  ensureSignedIn();
}, 10000);
ensureSignedIn();
