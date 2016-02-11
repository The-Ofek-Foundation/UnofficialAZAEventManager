function ghReadmeContents() {
	var website_link = "https://" + owner + ".github.io/" + FeedRepoInfo.name + "/";
	var contents = "[online website]:" + website_link + " \"the online website\"\n";
	contents += "[css file]:https://github.com/" + owner + "/" + FeedRepoInfo.name + "/blob/gh-pages/styles.css \"the css file\"\n";

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
	var website_link = "https://" + owner + ".github.io/" + FeedRepoInfo.name + "/";
	var contents = "";

	contents += "# Welcome to your personal event feed repository!\n";
	contents += "### How is this repository generated?\n";
	contents += "This repository is *automatically generated* when you use the [event manager online app]. **Never edit this repository directly, always use the online app!** This repository is very *specifically formatted* to be readable from both the online app and the [downloadable AZA mobile app][gplay aza app]&mdash;editing it directly could cause annoying and bothersome problems problems so just don't.\n";
	contents += "### How can I edit this repository?\n";
	contents += "As previously stated, **never edit this repository directly.** Use the [online app][event manager online app] to manage your events, and it will automatically update this repository for you correctly. Please note that updates to events can take up to several minutes to show in the [online website], and several more minutes to appear in your mobile apps. *Don't freak out if you can't see your newest updates in the mobile app five seconds after you updated it online.*\n\n";

	contents += "You can add new events in the [add new events page] in the website, and edit, delete, and archive events in the [manage events page]. Archiving works by moving all events that are more than one day old from your rss feed and into your [archive file]. The archive file is a csv file, openable by Microsoft Excel and by Google Sheets (and most other spreadsheet editors), and stores all your events that you ever archived. **By archiving old events instead of deleting them, you create a timeline of all your events instead of deleting them forever.** Avoid deleting events when possible.\n";
	contents += "### How can I create a chapter pack?\n";
	contents += "Creating a chapter pack is very simple, and can be done with a few basic steps:\n\n";

	contents += "1. **Create a contact list csv file**\n";
	contents += "    \n";
	contents += "    This may seem complicated, but it really isn't. Simply use your favorite spreadsheet-editing software (such as Microsoft Excel and Google Sheets) to create your contact list, and then export your files as .csv files.\n";
	contents += "    The format for these spreadsheets should be as follows:  \n";
	contents += "    \n";
	contents += "    Name | School | Graduation Year | Address (surrounded by quotes) | Latitude | Longitude | Email | Phone number\n";
	contents += "    :----: | :------: | :---------------: | :------------------------------: | :--------: | :---------: | :-----: | :------------:\n";
	contents += "    <br />\n";
	contents += "    You ***don't*** need to add the **Longitude and Latitude**, they will automatically be added when generating the Chapter Pack using the [online website][chapter pack generation page]. **Put the google maps address to make sure it finds the contact's house.** An example csv file that you input could be:\n";
	contents += "    \n";
	contents += "     |  |   |  |  |  |  | | \n";
	contents += "    :----: | :------: | :---------------: | :------------------------------: | :--------: | :---------: | :-----: | :------------:\n";
	contents += "    Ofek Gila | Monta Vista High School | 2017 | \"4387 Bubb Rd, Cupertino, California\" | | | ofekgila@outlook.com | 555555555\n";
	contents += "    James Smith | Coke Monster High | 2018 | \"James Smith Way Hawaii town\" | | | james.smith404@gmail.com | 555555555\n";
	contents += "    <br />\n";
	contents += "    View a more complete documentation for csv files [here][csv documentation].\n";
	contents += "2. **Generate your chapter pack from the mobile app**\n";
	contents += "    \n";
	contents += "    This step is easy&mdash;simply head over to the [chapter pack generation page], upload your csv file that you created from step 1, and hit the `Generate and download` button to download the app. **Be sure to include the words \"Chapter Pack\" in the name of the generated zip file for it to be recognized by the mobile app.** The generation may take a while depending on how many longitudes and latitudes it needs to fill in. For this reason, saving previously generated contact lists (generated contact lists can be found inside of the Chapter Pack zip file), and simply appending to them could save you time when generating chapter packs in the future.\n";
	contents += "    <br /><br />\n";
	contents += "3. **You're ready to go!**\n";
	contents += "    \n";
	contents += "    You're ready to start distributing your Chapter Pack to your chapter, and they will be able to load if from their [AZA app][gplay aza app]! Note they may need to go to \"Settings\" -> \"Load Chapter Pack\".\n\n";
	contents += "### How can I include the RSS feed in my chapter's website?\n";
	contents += "Great question! Simply go over to your [gh pages branch] and read the instructions!\n\n";
	contents += "<br />";
	contents += "For more information about this repository or the web app, contact ofekgila@outlook.com\n\n";

	contents += "[event manager online app]:https://the-ofek-foundation.github.io/UnofficialAZAEventManager/ \"event manager web app\"\n";
	contents += "[gplay aza app]:https://play.google.com/store/apps/details?id=org.ramonaza.unofficialazaapp&hl=en \"aza mobile app on google play\"\n";
	contents += "[online website]:" + website_link + " \"the online website\"\n";
	contents += "[add new events page]:https://the-ofek-foundation.github.io/UnofficialAZAEventManager/#add-events \"add new events page\"\n";
	contents += "[manage events page]:https://the-ofek-foundation.github.io/UnofficialAZAEventManager/#manage-events \"manage events page\"\n";
	contents += "[archive file]:https://github.com/" + owner + "/" + FeedRepoInfo.name + "/blob/master/archive.csv \"archive\"\n";
	contents += "[csv documentation]:https://github.com/ischeinkman/UnofficialAZAApp/wiki/Chapter-Packs#contactlistcsv \"csv file documentation\"\n";
	contents += "[chapter pack generation page]:https://the-ofek-foundation.github.io/UnofficialAZAEventManager/#chapter-pack \"chapter pack generation page\"\n";
	contents += "[gh pages branch]:https://github.com/" + owner + "/" + FeedRepoInfo.name + "/tree/gh-pages \"gh-pages branch\"\n";

	return contents;
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

function remove_children(elem) {
	for (var child = elem.firstChild; child; child = elem.firstChild)
		elem.removeChild(child);
}