
function myInitGoogle1(){
	// Load the latest version of the Google Data JavaScript Client
	google.load('gdata', '2.x');
	// Call function once the client has loaded
	google.setOnLoadCallback(myInitGoogle1a);
}

function myInitGoogle1a() {
  google.gdata.client.init(myHandleGoogleError);
  myInitGoogle2();
}

function myHandleGoogleError(e) {
	var msg = e.cause ? e.cause.statusText : e.message;
	  if (e instanceof Error) {
    /* alert with the error line number, file and message */
    alert('Error at line ' + e.lineNumber +
          ' in ' + e.fileName + '\n' +
          'Message: ' + e.message);
    /* if available, output HTTP error code and status text */
    if (e.cause) {
      var status = e.cause.status;
      var statusText = e.cause.statusText;
      alert('Root cause: HTTP error ' + status + ' with status text of: ' + 
            statusText);
    }
  } else {
    alert(e.toString());
  }
}

function myGetPublicFeedURL(emailAddress){
	var res = 'https://www.google.com/calendar/feeds/' + emailAddress + '/public/full';
	return(res);			
}

function myGetScope(){
	//return("https://www.google.com/calendar/feeds/default/private/full");
	return("https://www.google.com/calendar/feeds");
}

function myGetToken(){
	return(google.accounts.user.checkLogin(myGetScope()));
}

function myLoggedInP(){
	return(myGetToken() != "");
}

function myLogIn() {
  var token = google.accounts.user.login(myGetScope());
}

function myLogOut(){
	google.accounts.user.logout();
}

function now(){
	return(new Date);
}

function myGetDate(offset){
	var res = now();
	res.setDate(res.getDate()+offset);
	return(res);
}

function loadCalendar(calendarUrl, onload) {
  var service;
  //service = new google.gdata.calendar.CalendarService('gdata-js-client-samples-simple');
  service = new google.gdata.calendar.CalendarService('cl');
  var query = new google.gdata.calendar.CalendarEventQuery(calendarUrl);
  var minDate = myGetDate(-7);
  var maxDate = myGetDate(1000);  
  query.setOrderBy('starttime');
  query.setSortOrder('ascending');
  query.setSingleEvents(true);
  query.setMaxResults(10);
  query.setFutureEvents(false);
  query.setMinimumStartTime(new google.gdata.DateTime(minDate));
  query.setMaximumStartTime(new google.gdata.DateTime(maxDate));
  service.getEventsFeed(query, onload, myHandleGoogleError);
}

function myGetPrivateFeedURL(emailAddress){
	var res = 'https://www.google.com/calendar/feeds/' + emailAddress + '/private/full';
	res = 'https://www.google.com/calendar/feeds/default/private/full';
	return(res);	
} 

function padNumber(num) {
  if (num <= 9) {
    return "0" + num;
  }
  return num;
}

function myParseEntryDescription(text){
	
}

function myParseCalendarFeed(feedRoot){
	var i;
	var res = structNew();
	var entries = feedRoot.feed.getEntries();
	var s;
	var entry;
	var times;
	var entryLinkHref;
	var dummy;
	res.calendarTitle = feedRoot.feed.title.$t;
	res.events = arrayNew(1);
	var u;
	for(i=0; i<entries.length; i++){
		entry = entries[i];
		s = structNew();
		s.id = entry.getId().getValue();
		s.index = i;
		//s.completedP = false;
		s.title = entry.getTitle().getText();
		s.descriptionRaw = entry.getContent().getText();
		s.metaData = extractMetaData(s.descriptionRaw);
		//s.hidden = entry.getHidden();
		s.entry = entry;
		if (entry.getHtmlLink() == null) {
			s.entryLinkHref = "";
		}
		else{
			s.entryLinkHref = entry.getHtmlLink().getHref();
		}
		times = entry.getTimes();
		if (times.length == 0) {
			s.startDateTime = null;
			s.endDateTime = null;
			//s.startJSDate = null;
			//s.dateString = '???';
		}
		else{
      		s.startDateTime = times[0].getStartTime();  //returns "uf" object
			s.endDateTime = times[0].getEndTime();      //returns "uf" object
      		/*s.startJSDate = s.startDateTime.getDate();
			s.dateString = (s.startJSDate.getMonth() + 1) + "/" + s.startJSDate.getDate();
			if (!s.startDateTime.isDateOnly()) {
			  s.dateString += " " + s.startJSDate.getHours() + ":" + 
				  padNumber(s.startJSDate.getMinutes());
			}*/
    	}
		dummy = arrayAppend(res.events, s);
	}
	return(res);
}

function myDateFormat(dateTime, appendTimeP){
	var res = (dateTime.getMonth() + 1) + "/" + dateTime.getDate() + '/' + dateTime.getFullYear();
	if(appendTimeP){
		res = res + ' ' + myTimeFormat(dateTime);
	}
	return(res);
}

function myTimeFormat(dateTime){
	var h = dateTime.getHours();
	var tt;
	if(h >= 13){
		h = h - 12;
		tt = 'pm';
	}
	else{
		tt = 'am';
	}
	res = h + ":" + padNumber(dateTime.getMinutes()) + tt;
	//res = dateTime.toLocaleTimeString();
	return(res);
}

function myParseGoogleDateTime(dateTime){
	var res = structNew();
	res.date = dateTime.getDate();
	res.dateString = myDateFormat(res.date, !dateTime.isDateOnly());
	//res.tls = res.date.toLocaleString();
	return(res);
}

function myFormatGoogleDateTime(uf){
	return(myParseGoogleDateTime(uf).dateString);
}

function myUpdateMyEntry(e) {
  //e.getTitle().setText("zzzz");
  e.updateEntry(handleMyUpdatedEntry, myHandleGoogleError);
}

function handleMyUpdatedEntry(updatedEntryRoot) {
 // alert("Entry updated. The new title is: " + updatedEntryRoot.entry.getTitle().getText());
}

function zzzdeleteMyEntry(updatedEntryRoot) {
  updatedEntryRoot.entry.deleteEntry(handleMyDeletedEntry, handleError);
}

function extractDescription(descriptionRaw){
	var u = findAndSplit(descriptionRaw, "{", false);
	return(u.left);
}

function extractMetaData(descriptionRaw){
	var u = findAndSplit(descriptionRaw, "{", false);
	var res;
	if(u.mid == ''){
		res = structNew();
		res.completedP = false;
	}
	else{
		res = JSON.parse(u.mid + u.right);
	}
	//alert("res=" + res);
	return(res);
}

function myGetDescription(s){
	ss=s;
	var res = extractDescription(s.descriptionRaw);
	//alert(res);
	//res = res + String.fromCharCode(7);
	res = res + ' ' + JSON.stringify(s.metaData);
	//alert(res);
	return(res);
}
