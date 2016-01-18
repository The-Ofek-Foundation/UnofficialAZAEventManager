function ghReadmeContents() {
	var website_link = "https://" + FeedRepoInfo.owner.login + ".github.io/" + FeedRepoInfo.name + "/";
	var contents = "[online website]:" + website_link + " \"the online website\"\n";
	contents += "[css file]:https://github.com/" + FeedRepoInfo.owner.login + "/" + FeedRepoInfo.name + "/blob/gh-pages/styles.css \"the css file\"\n";

	contents += "# Welcome to your RSS Feed gh-pages branch!\n";
	contents += "### What is this branch?\n";
	contents += "To put it simply, this branch allows us to host an [online website] with your own RSS feed, and update it automatically!  \n";
	contents += "If you want to change the styling of the website&mdash;no problem! Just head over to the [css file] and modify it!  \n";
	contents += "Note that this website might take a few minutes to update after every change to your RSS feed\n\n";

	contents += "### How can I use this branch?\n";
	contents += "Once you have styled the event feed from the [css file] to your liking,  \n";
	contents += "you can include your RSS feed inside your own website by adding the following tag:\n\n";

	contents += "```html\n";
	contents += "<iframe src=\"" + website_link + "\" id=\"rss-feed-frame\"></iframe>\n";
	contents += "```\n\n";

	contents += "into your html, and then by changing the element's width and height accordingly";

	return contents;
}

function readmeContents() {
	return "# Welcome to your website";
}

function cssContents() {
	return '.css-events-list{text-align:center;font-size:1.6em}.css-events-list p{margin-top:0;margin-bottom:.5em}.event-date{font-size:1.8em;font-style:italic}.event-title{font-size:1.7em}.event-details p{margin-bottom:.25em}';
}

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
	return (new XMLSerializer()).serializeToString(oXML).replace(/&amp/g, '&;').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/></g, ">  <");
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

function str2bytes (str) {
	var bytes = new Uint8Array(str.length);
	for (var i=0; i<str.length; i++)
		bytes[i] = str.charCodeAt(i);
	return bytes;
}

function saveZip(content, file_name) {
	if (file_name.indexOf(".zip") === -1)
		file_name += ".zip";
	var blob = new Blob([str2bytes(content)], {type: "application/zip"});
	saveAs(blob, file_name);
}