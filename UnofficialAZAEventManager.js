const Github = require("github-api");
const $ = require('jquery');
const fs = require('fs');
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

	writeToFile("login-info.txt", JSON.stringify(userDetails), console.log());
}

function loadUserFromFile() {
	loadFromFile("login-info.txt", function(err, data) {
		if (err)
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
		else;
	});
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
	writeToFile("login-info.txt", "");
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

function writeToFile(relative_path, content, callback) {
	fs.writeFile(__dirname + "/" + relative_path, content, function (err) {
		if (callback)
			callback(err);
	});
}

function loadFromFile(relative_path, callback) {
	fs.readFile(__dirname + "/" + relative_path, "utf8", function(err, data) {
		callback(err, data);
	});
}

$(window).resize(function() {
	var browser_dimensions = {};
	browser_dimensions.width = $(window).width();
	browser_dimensions.height = $(window).height();

	writeToFile("browser-dimensions.txt", JSON.stringify(browser_dimensions));
});

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