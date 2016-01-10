function timeFormat(time) {
	var first = parseInt(time.substring(0, time.indexOf(':')));
	var second = time.substring(time.indexOf(':'));

	if (first > 12)
		return (first - 12) + second + " PM";
	return first + second + " AM";
}

function timeUnformat(time) {
	var first = parseInt(time.substring(0, time.indexOf(':')));
	var second = time.substring(time.indexOf(':'), time.indexOf(' '));
	if (time.indexOf("PM") !== -1)
		first += 12;
	if (first < 10)
		return "0" + first + second;
	return first + second;
}

function dateFormat(d) {
	var date = new Date(d.replace(/-/g, ','));
	var dateString = "";

	switch (date.getDay()) {
		case 0:
			dateString += "Sunday"; break;
		case 1:
			dateString += "Monday"; break;
		case 2:
			dateString += "Tuesday"; break;
		case 3:
			dateString += "Wednesday"; break;
		case 4:
			dateString += "Thursday"; break;
		case 5:
			dateString += "Friday"; break;
		case 6:
			dateString += "Saturday"; break;
	}

	dateString += ", ";

	switch (date.getMonth()) {
		case 0:
			dateString += "January"; break;
		case 1:
			dateString += "February"; break;
		case 2:
			dateString += "March"; break;
		case 3:
			dateString += "April"; break;
		case 4:
			dateString += "May"; break;
		case 5:
			dateString += "June"; break;
		case 6:
			dateString += "July"; break;
		case 7:
			dateString += "August"; break;
		case 8:
			dateString += "September"; break;
		case 9:
			dateString += "October"; break;
		case 10:
			dateString += "November"; break;
		case 11:
			dateString += "December"; break;
	}

	dateString += " " + date.getDate();

	switch (date.getDate()) {
		case 1: case 21: case 31:
			dateString += "st"; break;
		case 2: case 22:
			dateString += "nd"; break;
		case 3: case 23:
			dateString += "rd"; break;
		default:
			dateString += "th";
	}

	dateString += " " + date.getFullYear();

	return dateString;
}

function dateUnformat(dateString) {
	dateString = dateString.substring(dateString.indexOf(" ") + 1); // remove day of week

	var month = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	var day = dateString.substring(0, dateString.indexOf(" ") - 2);
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	return new Date(dateString + "," + month + "," + day).toDateInputValue();
}

function dateMinimize(dateString) {
	dateString = dateString.substring(dateString.indexOf(" ") + 1); // remove day of week

	var month = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	var day = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	return month + " " + day;
}

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function StringToXML(oString) {
	return (new DOMParser()).parseFromString(oString, "text/xml");
}

function XMLToString(oXML) {
	return (new XMLSerializer()).serializeToString(oXML).replace(/&amp/g, '&;').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&apos;/g, '\'');
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}