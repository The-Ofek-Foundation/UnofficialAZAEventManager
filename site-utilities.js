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

	return getDay(date) + ", " + getMonth(date) + " " + date.getDate() + " " + getYear(date);
}

function archiveFormat(event) {
	return archiveDate(event.date) + "," + event.name + "," + event.planners + "," + event.description + "," + event.location_name;
}

function getDay(date) {
	switch (date.getDay()) {
		case 0:
			return "Sunday";
		case 1:
			return "Monday";
		case 2:
			return "Tuesday";
		case 3:
			return "Wednesday";
		case 4:
			return "Thursday";
		case 5:
			return "Friday";
		case 6:
			return "Saturday";
		default:
			return "BOZO day";
	}
}

function getMonth(date) {
	switch (date.getMonth()) {
		case 0:
			return "January";
		case 1:
			return "February";
		case 2:
			return "March";
		case 3:
			return "April";
		case 4:
			return "May";
		case 5:
			return "June";
		case 6:
			return "July";
		case 7:
			return "August";
		case 8:
			return "September";
		case 9:
			return "October";
		case 10:
			return "November";
		case 11:
			return "December";
		default:
			return "Bozo month";
	}
}

function getDate(date) {
	switch (date.getDate()) {
		case 1: case 21: case 31:
			return date.getDate() + "st";
		case 2: case 22:
			return date.getDate() + "nd";
		case 3: case 23:
			return date.getDate() + "rd";
		default:
			return date.getDate() + "th";
	}
}

function getYear(date) {
	return date.getFullYear();
}

function dateUnformat(dateString) {
	dateString = dateString.substring(dateString.indexOf(" ") + 1); // remove day of week

	var month = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	var day = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	return new Date(dateString + "," + month + "," + day).toDateInputValue();
}

function stringToDate(dateString) {
	dateString = dateString.substring(dateString.indexOf(" ") + 1); // remove day of week

	var month = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	var day = dateString.substring(0, dateString.indexOf(" "));
	dateString = dateString.substring(dateString.indexOf(" ") + 1);

	return new Date(dateString + "," + month + "," + day);
}

function dateMinimize(dateString) {
	var date = stringToDate(dateString);

	return getMonth(date) + " " + getDate(date);
}

function archiveDate(dateString) {
	var date = stringToDate(dateString);

	return getMonth(date) + " " + getDate(date) + " " + getYear(date);
}

function prettyDate(dateString) {
	var date = stringToDate(dateString);

	return getDay(date) + ", " + getMonth(date) + " " + getDate(date);
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