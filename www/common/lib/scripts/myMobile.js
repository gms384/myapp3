// Mobile scripts
// Greg Saunders
//
// created 3/2/2012

// Bootstrapping
function ipadP(){
	return(navigator.userAgent.indexOf('iPad') != -1);
}

function iphoneP(){
	return(navigator.userAgent.indexOf('iPhone') != -1);
}

function iosP(){
	return(ipadP() || iphoneP());
}

// Basics
function myRound(x){
	return(Math.round(x*10)/10);
}

function getConstant(name, dummyParamDoNotDefine){
	switch(name){
		case "undefined":
			//return(undefined);  -- this breaks IE Mac 5.1!
			return(dummyParamDoNotDefine);
			break;
		default:  throwError("case fell through:  " + name);
	}
}

function isDefined(param){
    if(param === null){  //need this to distinguish null from undefined
		return(true);
	}
	return(param != getConstant("undefined"));
}

function getDefaultParam(param, defaultValue){
	if(isDefined(param)){
		return(param);
	}
	else{
		return(defaultValue);
	}
}


// Debugging
function formatThing(obj){
  var prop, newLabel;
  var label = "s";
  var res = "";
  if(typeof(obj)=='object'){
	  for (var prop in obj){
		 newLabel = label + "." + prop;
		 res = res + newLabel + " = " + obj[prop] + "\r";
	  }
  }
  else{
	  res = obj;
  }
  return(res);
}

function myAlert(msg){
	console.log(msg);
	//navigator.notification.alert???
	alert(msg);
}

function myDebug(obj){
	myAlert(formatThing(obj));
}

function throwError(msg){
	myAlert(msg);
}

function onBodyLoad(){
	if(iosP()){
		document.addEventListener("deviceready", onDeviceReady, false);
	}
	else{
		onDeviceReady();
	}
}

// basics
function lcase(str){
	return(str.toLowerCase());
}

function structNew(){
	return(new Object);
}

function structInsert(structure, key, value){
	structure[key] = value;
	return(structure);
}

function arrayNew(dim){
	return(new Array);
}

function arrayLen(a){
	return(a.length);
}

function arrayAppend(a, item){
	a[a.length] = item;
	return(null);
}

function onErrorGeneric(msg){
	if(typeof(msg)=='string'){
		throwError('Error: ' + msg);
	}
	else{
		myDebug(msg);
	}
}

function parseJsonQuery(jsonQueryObject){
	var obj = jsonQueryObject;
	var i;
	var res = arrayNew(1);
	var a;
	var j;
	var s;
	var key;
	for(i=1; i<= arrayLen(obj.DATA); i++){
		a = obj.DATA[i-1];
		s = structNew();
		for(j=1; j<=arrayLen(a); j++){
			key = lcase(obj.COLUMNS[j-1]);
			dummy = structInsert(s, key, a[j-1]);
		}
		dummy = arrayAppend(res, s);
	}
	return(res);
}

// URL Params
function getURLparam(name){
	var params = parent.location.search;
	if(params == ""){
		return(null);
	}
	params = params.toLowerCase();
	params = params.substring(1);
	params = params.split("&");
	for(var i=0; i<params.length; i++){
		if(params[i].split("=")[0] == name.toLowerCase()){
			return(params[i].split("=")[1]);
		}
	}
	return(null);
}

function intVal(o){
	var res;
	if(isNaN(o) || o == null){
		res = 0;
	}
	else{
		res = parseInt(o)
	}
	return(res);
}

function selectedMenuItemValue(menu){
	return(menu.options[menu.selectedIndex].value)
}

function getObjectText(objName){
	var obj = findObject(objName);
	if(obj.type == 'text' || obj.type == 'textarea')
	  return(obj.value)
	else
	  return(obj.innerHTML);
}


// xui wrappers
function findObject(obj){
	if(typeof(obj)=='string'){
		return(document.getElementById(obj));
	}
	else{
		return(obj);
	}
}

function setObjectText(obj, text){
	x$('#'+obj).inner(text);
}


// ios wrappers
function myStartAccelerationMonitor(onSuccess){
	if(iosP()){
		var options = { frequency: 100 };
		var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onErrorGeneric, options);
	}
	else{
		var res = structNew();
		res.x = 0;
		res.y = 0;
		res.z = 0;
		res.timestamp = 0;
		onSuccess(res);
		//does not repeat
	}
}

function myStartGeoocationMonitor(onSuccess){
	if(iosP()){
		var options = { frequency: 3000 };
		var watchID = navigator.geolocation.watchPosition(onSuccess, onErrorGeneric, options);
	}
	else{
		var res = structNew();
		res.coords = structNew();
		res.coords.latitude = 0;
		res.coords.longitude = 0;
		res.coords.accuracy = 0;
		res.coords.altitudeAccuracy = 0;
		res.coords.heading = 0;
		res.coords.speed = 0;
		res.timestamp = 0;
		onSuccess(res);
		//does not repeat
	}
}

function myGetPicture(onSuccess, fileP){
	if(iosP()){
		//data_URL not recommended
		var destType;
		if(fileP){
			destType = Camera.DestinationType.FILE_URI;
		}
		else{
			destType = Camera.DestinationType.DATA_URL;
		}
		var options = { 
                        quality : 50, 
                        destinationType : destType, 
                        sourceType : Camera.PictureSourceType.CAMERA, 
                        allowEdit : false, 
                        encodingType: Camera.EncodingType.JPEG, 
                        targetWidth: 100, 
                        targetHeight: 100 
					  }; 
		navigator.camera.getPicture(onSuccess, onErrorGeneric, options); 
	}
}

function myUploadPhoto(imageURI, url) {
	var options = new FileUploadOptions();
	options.fileKey="file";
	options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
	options.mimeType="image/jpeg";
	var params = new Object();
	params.value1 = "test";
	params.value2 = "param";
	options.params = params;
	var ft = new FileTransfer();
	ft.upload(imageURI, url, win, onErrorGeneric, options);
}

function win(r) {
	console.log("Code = " + r.responseCode);
	console.log("Response = " + r.response);
	console.log("Sent = " + r.bytesSent);
}

function zzzzzfail(error){
	alert("An error has occurred: Code = " + error.code);
}



// http

// for cross-domain, make sure server has:
//<cfheader name="Access-Control-Allow-Origin" value="*">
//<cfheader name="Access-Control-Allow-Methods" value="POST,GET">
//<cfheader name="Access-Control-Allow-Credentials" value="true">

var gHttpRequest = false;
var gReceivePostHandler = null;

function createPost2011(url, receivePostHandler, data){
	gReceivePostHandler = getDefaultParam(receivePostHandler, null);
    data = getDefaultParam(data, "");
	if(! isDefined(window.XMLHttpRequest)){
		alert('Error:  your browser is not supported.');
		return(0);
	}
	gHttpRequest = new XMLHttpRequest();
	if (gHttpRequest.overrideMimeType) {
		gHttpRequest.overrideMimeType('text/html');
	}
	gHttpRequest.onreadystatechange = receivePost2011;
	if(data == ""){
 		gHttpRequest.open('GET', url, true);
		gHttpRequest.send();
	}
	else{
		gHttpRequest.open('POST', url, true);
		gHttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		gHttpRequest.send(data);
	}
}

function receivePost2011(){
	if (gHttpRequest.readyState == 4) {
	 if (gHttpRequest.status == 200) {
		var result = gHttpRequest.responseText;
		if(gReceivePostHandler == null){
			if(result != 0){
				alert('Error:  ' + result);
			}
		}
		else{
			gReceivePostHandler.call(this, result);
		}
	 } else {
		 myDebug(gHttpRequest.status);
		//alert('Error:  could not reach server to save changes');
	 }
  }
}

function findAndSplit(string, theSubstring, guaranteeP){
   guaranteeP = getDefaultParam(guaranteeP, true);
   var pos = string.indexOf(theSubstring);
   if(pos<0 && guaranteeP){
   	  throwError('string "' + string + '" does not contain substring "' + theSubstring + '"');
   }
   var res = structNew();
   if(pos<0){
       //res = new createStructure("left,mid,right", string, "", "");
	   res = structInsert(res, "left", string);
	   res = structInsert(res, "mid", "");
	   res = structInsert(res, "right", "");
   }
   else{		
	   //res = new createStructure("left,mid,right", string.substr(0, pos), theSubstring, string.substr(pos+len(theSubstring), len(string)));
	   res = structInsert(res, "left", string.substr(0, pos));
	   res = structInsert(res, "mid", theSubstring);
	   res = structInsert(res, "right", string.substr(pos+len(theSubstring), len(string)));	   
   }
   return(res);
}
