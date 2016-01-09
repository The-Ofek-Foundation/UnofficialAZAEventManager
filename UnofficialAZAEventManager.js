const Github = require("github-api");
const $ = require('jquery');
const pd = require('pretty-data').pd;
const Cryptr = require("cryptr");
const cryptr = new Cryptr("the-ofek-foundation");

var github = user = username = password = repos = repo_name = FeedRepo = logged_in = false;

$(document).ready(function() {
	$("body").css("margin-top", $("#navbar-top").height() + "px");
	$("#login-dropdown").css("top", $("#navbar-top").height() - $("#login-dropdown").height() + "px").width($("#login-dropdown input").width());
	$("#logout-dropdown").css("top", $("#navbar-top").height() - $("#logout-dropdown").height() + "px").width($("#logout-dropdown button").width());

	$("#navbar-top > li a").click(function() {
		if (!$(this).hasClass('active')) {
			$("#navbar-top li a").removeClass('active');
			$(this).addClass("active");
		}
	});

	$("#navbar-top ul li a").click(function() {
		if (!$(this).hasClass('active')) {
			$("#navbar-top ul li a").removeClass('active');
			$(this).addClass("active");
		}
	});

	$("a[href=\"#login\"]").click(function() {
		if (logged_in)
			toggleLogDropdown($("#logout-dropdown"), !$("#logout-dropdown").data("extended"));
		else	toggleLogDropdown($("#login-dropdown"), !$("#login-dropdown").data("extended"));
	});

	vert_align();
});

function toggleLogDropdown(dropdown, extend) {
	if (extend) {
		dropdown.data("extended", true);
		dropdown.animate({
			opacity: 1,
			top: $("#navbar-top").height() + "px"
		}, "1000");
	}
	else {
		dropdown.data("extended", false);
		dropdown.animate({
			opacity: 0,
			top: $("#navbar-top").height() - dropdown.height() + "px"
		}, "1000");
	}
}

function getUserRepos(user, callback) {
	user.repos("all", function(err, repos) {
		if (err) {
			if (err.error == 401)
				callback("login_err", null);
			else popupError("Strange login error, contact developer", err);
		}
		else callback(false, repos);
	});
}

function getRepo(repo_name) {
	return github.getRepo(username, repo_name);
}

function vert_align() {
	$('.vert-align').each(function() {
		$(this).css('margin-top', ($(this).parent().height() - $(this).height()) / 2 + "px");
	});
}

function saveUserToFile() {
	var userDetails = {};
	userDetails.username = username;
	userDetails.password = password;
	if (FeedRepo && repo_name)
		userDetails.repo_name = repo_name;

	setCookie("login-info", JSON.stringify(userDetails), 21);
}

function loadUserFromFile() {
	var data = getCookie("login-info");
	if (!userDetails)
		console.error("Could not open login-info.txt " + err);
	else if (data.length > 0) {
		var userDetails = JSON.parse(data);
		loginToGithub(userDetails.username, cryptr.decrypt(userDetails.password));
		repo_name = userDetails.repo_name;

		getUserRepos(user, function(err, repos) {
			if (err) {
				if (err == "login_err")
					$("#login-err").text("Login details changed");
			}
			else {
				if (repo_name) {
					FeedRepo = getRepo(repo_name);
					FeedRepo.show(function (err, contents) {
						if (err) {
							if (err.error == 404)
								popupError("Repo not found");
							else popupError("Repo error, contact developer", err);
							FeedRepo = false;
							saveUserToFile();
						}
						loginSuccess();
					});
				}
				else loginSuccess();
			}
		});
	}
}

function loginToGithub(username, password) {
	github = new Github({
	  username: username,
	  password: password,
	  auth: "basic"
	});
	user = github.getUser();
	this.username = username;
	this.password = cryptr.encrypt(password);
}

function logoutOfGithub() {
	github = user = username = password = repos = repo_name = FeedRepo = logged_in = false;
	setCookie("login-info", "", 0);
	toggleLogDropdown($("#logout-dropdown"), false);
	$("#log-tab a").text('Login');
	$("#login-alert").show();
	$("#logged-in-div").css("opacity", 0).css("margin-top", "-10px");
	$("#write-event").hide();
	$("#create-repo").hide();
	$("#write-event-status").text("");
}

function loginSuccess() {
	logged_in = true;
	$("#log-tab a").text('Logged in as ' + username);
	toggleLogDropdown($("#login-dropdown"), false);
	$("#login-alert").hide();
	$("#logged-in-div").animate({
		opacity: 1,
		"margin-top": 0
	}, 1000);
	if (FeedRepo)
		$("#write-event").show();
	else $("#create-repo").show();
}

function popupError(err_message, log) {
	$("#screen-dim").show();
	$("#error-popup-text").text(err_message);
	$("#error-popup").show();
	if (log) {
		$("#strange-error").show();
		console.error(log);
		$("#strange-error").text(log);
	}
	else $("#strange-error").hide();
	$("#screen-dim").animate({opacity: 0.8}, "1000");
	$("#error-popup").animate({opacity: 1}, "1000");
}

$("#close-error-popup-btn").click(function () {
	$("#screen-dim").animate({opacity: 0}, "500", function() {
		$(this).hide();
	});
	$("#error-popup").animate({opacity: 0}, "500", function() {
		$(this).hide();
	});
});

function timeFormat(time) {
	var first = parseInt(time.substring(0, time.indexOf(':')));
	var second = time.substring(time.indexOf(':'));

	if (first > 12)
		return (first - 12) + second + " PM";
	return first + second + " AM";
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



/** Here starts index.html **/

$("#github-login-form").submit(function() {
	$("#login-err").text("");

	var username = $("input[name=\"username\"]").val();
	var password = $("input[name=\"password\"]").val();
	loginToGithub(username, password);

	getUserRepos(user, function(err, repos) {
		if (err) {
			if (err == "login_err")
				$("#login-err").text("Invalid login details");
		}
		else {
			loginSuccess();
			saveUserToFile();
			this.repos = repos;
		}
	});

	return false;	// prevents reload
});

$("#repo-name-form").submit(function() {
	repo_name = $("input[name=\"rss-repo\"]").val();

	user.createRepo({"name": repo_name}, function(err, res) {
		if (err)
			if (err.error == 422)
				$("#login-err").text("Repo already exists!");
			else popupError("Error creating repo, contact developer", err);
		else {
			FeedRepo = getRepo(repo_name);
			saveUserToFile();
			FeedRepo.write("master", "rss-feed.txt", "No events posted yet.", "Created Event Feed", function(create_err) {
				if (create_err)
					popupError("Error creating file rss-feed.txt", create_err);
				else {
					$("#create-repo").animate({
						opacity: 0,
						"margin-top": "-10px"
					}, 1000, function () {
						$(this).hide();
					});
					$("#write-event").css('margin-top', "-10px").css('opacity', 0).show();
					$("#write-event").animate({
						opacity: 1,
						"margin-top": "0px"
					}, 1000);
				}
			});
		}
	});

	return false;
});

$("#repo-exists-btn").click(function () {
	repo_name = $("#repo-exists").val();
	FeedRepo = getRepo(repo_name);
	$("#login-err").text("");
	FeedRepo.show(function (err, contents) {
		if (err)
			if (err.error == 404)
				popupError("Repo not found");
			else popupError("Repo error, contact developer", err);
		else {
			saveUserToFile();
			$("#create-repo").animate({
				opacity: 0,
				"margin-top": "-10px"
			}, 1000, function () {
				$(this).hide();
			});
			$("#write-event").css('margin-top', "-10px").css('opacity', 0).show();
			$("#write-event").animate({
				opacity: 1,
				"margin-top": "0px"
			}, 1000);
		}
	});
});

$("#write-event-form").submit(function () {
	$("#write-event-status").text("");
	FeedRepo.read('master', 'rss-feed.txt', function (err, contents) {
		if (err)
			if (err == "not found") {
				console.error(err);
				contents = "bozo alert";
			}
			else popupError("Error reading rss-feed.txt, contact developer", err);
		var feed;
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			feed = StringToXML(pd.xml('<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel></channel></rss>'));
		}
		var new_event = feed.createElement("item");
		var description = getEventDescriptionXML(feed);
		new_event.appendChild(description);
		feed.childNodes[0].childNodes[1].appendChild(new_event);

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)), "Update Event Feed", function(write_err) {
			if (write_err)
				popupError("Error writing to rss-feed.txt", write_err);
			else {
				if (err)
					$("#write-event-status").text("Successfully created new file rss-feed.txt and added event");
				else $("#write-event-status").text("Successfully added new event");
				clearEventDescription();
			}
		});
	});

	return false;
});

function getEventDescriptionXML(feed) {
	var br = " <br /> ";
	var description = feed.createElement("description");
	var content = "<![CDATA[ " + br;

	content += dateFormat($("input[name=\"event-date\"]").val()) + br;
	content += $("input[name=\"event-name\"]").val() + br;
	content += $("textarea[name=\"event-description\"]").val() + br;
	content += timeFormat($("input[name=\"event-time\"]").val()) + br;
	content += $("input[name=\"event-loc-name\"]").val() + br;
	content += $("input[name=\"event-bring\"]").val() + br;
	content += $("input[name=\"event-planners\"]").val() + br;
	content += $("input[name=\"event-loc\"]").val() + br;

	content += "]]>";
	var contnode = feed.createTextNode(content);

	description.appendChild(contnode);

	return description;
}

function clearEventDescription() {
	$("#write-event-form input").val("");
	$("#write-event-form textarea").val("");

	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
	$("input[name=\"event-time\"]").val("18:00");
	$("input[type=\"submit\"").val("Add Event");
}

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	// loadUserFromFile();
	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
});

$("#github-logout").click(logoutOfGithub);