const Github = require("github-api");
const $ = require('jquery');
const pd = require('pretty-data').pd;
const Cryptr = require("cryptr");
const cryptr = new Cryptr("the-ofek-foundation");
const event_attributes = ["date", "name", "description", "time", "location_name", "bring", "planners", "location"];

var github = user = username = password = repos = repo_name = FeedRepo = logged_in = false;
var override_event = false;

$(document).ready(function() {
	$("#login-dropdown").css("top", $("#navbar-top").height() - $("#login-dropdown").height() + "px").width($("#login-dropdown input").width());
	$("#logout-dropdown").css("top", $("#navbar-top").height() - $("#logout-dropdown").height() + "px").width($("#logout-dropdown button").width());

	$("#navbar-top > li a").click(function(e) {
		if (!$(this).hasClass('active')) {
			if ($(this).attr("disabled")) {
				e.preventDefault();
				return;
			}
			switch_page($(this).attr("href"));
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

function getFeed(callback) {
	FeedRepo.read('master', 'rss-feed.txt', function (err, contents) {
		if (err)
			if (err == "not found") {
				console.error(err);
				contents = "No events posted.";
			}
			else popupError("Error reading rss-feed.txt, contact developer", err);
		callback(err, contents);
	});
}

function getFeedEvents(feed) {
	var items = feed.getElementsByTagName("item");
	var events = {};

	for (var i = 0; i < items.length; i++) {
		var event_details = getEventDetails(items[i].getElementsByTagName("description")[0].childNodes[1].data);
		events[event_details.name] = event_details;
	}

	return events;
}

function update_event_list_table() {
	getFeed(function (err, contents) {
		var feed;
		$("#event-list-table-div").children().remove();
		$("#event-list-table-div").text("");
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			$("#event-list-table-div").text(contents);
			return;
		}
		var events = getFeedEvents(feed);
		var table = $("<table></table>").addClass("left-align");
		for (var event_name in events) {
			var row = $("<tr></tr>");
			var cols = new Array(3);
			cols[0] = $("<td></td>").text(event_name);
			var delete_button = $("<button></button>").data("event-name", event_name).text("Delete").click(function () {
				delete_event($(this).data("event-name"));
			});
			cols[1] = $("<td></td>").append(delete_button);
			var edit_button = $("<button></button>").text("Edit").data("event-details", JSON.stringify(events[event_name])).click(function() {
				edit_event(JSON.parse($(this).data("event-details")));
			});
			cols[2] = $("<td></td>").append(edit_button);

			for (var i = 0; i < cols.length; i++)
				row.append(cols[i]);
			table.append(row);
		}
		$("#event-list-table-div").append(table);
	});
}

function delete_event(name, callback) {
	getFeed(function (err, contents) {
		var feed;
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			popupError("rss-feed.txt changed");
			update_event_list_table();
			return;
		}
		var items = feed.getElementsByTagName("item");

		for (var i = 0; i < items.length; i++)
			if (getEventDetails(items[i].getElementsByTagName("description")[0].childNodes[1].data).name === name) {
				items[i].parentNode.removeChild(items[i]);
				break;
			}

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)), "Update Event Feed", function(write_err) {
			if (write_err)
				popupError("File already deleted", write_err);
			else {
				update_event_list_table();
				callback();
			}
		});
	});
}

function edit_event(event) {
	override_event = event.name;
	for (var i = 0; i < event_attributes.length; i++)
		switch (event_attributes[i]) {
			case "date":
				$("input[name=\"event-" + event_attributes[i] + "\"]").val(dateUnformat(event[event_attributes[i]]));
				break;
			case "time":
				$("input[name=\"event-" + event_attributes[i] + "\"]").val(timeUnformat(event[event_attributes[i]]));
				break;
			case "description":
				$("textarea[name=\"event-" + event_attributes[i] + "\"]").val(event[event_attributes[i]]);
				break;
			default:
				$("input[name=\"event-" + event_attributes[i] + "\"]").val(event[event_attributes[i]]);
		}
	switch_page("#add-events");
	$("#cancel-edit-btn").show();
	$("#write-event-status").text("");
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
	if (!data);
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
	$(".login-alert").show();
	$("#logged-in-div").css("opacity", 0).css("margin-top", "-10px");
	$("#create-repo").hide();
	$("#write-event-status").text("");
	$(".navbar > li a").attr("disabled", true);
	$("a[href=\"#setup\"]").removeAttr("disabled");
	$(".login-only").hide();
	switch_page("#setup");
}

function loginSuccess() {
	logged_in = true;
	$("#log-tab a").text('Logged in as ' + username);
	toggleLogDropdown($("#login-dropdown"), false);
	$(".login-alert").hide();
	$("#logged-in-div").animate({
		opacity: 1,
		"margin-top": 0
	}, 1000);
	if (FeedRepo)
		fullLoginSuccess();
	else $("#create-repo").show();
}

function fullLoginSuccess() {
	$(".navbar > li a").removeAttr('disabled');
	$(".login-only").show();
	update_event_list_table();
	switch_page(window.location.hash);
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

function switch_page(id) {
	if ($("#navbar-top > li a[href=\"" + id + "\"]").length === 0)
		return;
	$("#navbar-top li a").removeClass('active');
	$("a[href=\"" + id + "\"]").addClass("active");
	$(".page").removeClass("active");
	$(".page" + id).addClass('active');
	window.location.hash = id;
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
					fullLoginSuccess();
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
				fullLoginSuccess();
			});
		}
	});
});

$("#write-event-form").submit(function () {
	$("#write-event-status").text("");
	getFeed(function (err, contents) {
		$("#login-err").text("");
		var feed;
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			feed = StringToXML(pd.xml('<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel></channel></rss>'));
		}

		var events = getFeedEvents(feed);
		if (events[$("input[name=\"event-name\"]").val()] && $("input[name=\"event-name\"]").val() !== override_event) {
			$("#login-err").text("Event with name already exists!");
			update_event_list_table();
			return;
		}

		if (override_event) {
			var items = feed.getElementsByTagName("item");

			for (var i = 0; i < items.length; i++)
				if (getEventDetails(items[i].getElementsByTagName("description")[0].childNodes[1].data).name === override_event) {
					items[i].getElementsByTagName("description")[0].childNodes[1].data = getEventDescriptionForm();
					break;
				}
		}
		else {
			var new_event = feed.createElement("item");
			var description = getEventDescriptionXML(feed);
			new_event.appendChild(description);
			feed.getElementsByTagName("channel")[0].appendChild(new_event);
		}

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)), "Update Event Feed", function(write_err) {
			if (write_err)
				popupError("Error writing to rss-feed.txt", write_err);
			else {
				if (err)
					$("#write-event-status").text("Successfully created new file rss-feed.txt and added event");
				else if (override_event)
					$("#write-event-status").text("Successfully edited event");
				else $("#write-event-status").text("Successfully added new event");
				$("#cancel-edit-btn").hide();
				override_event = false;
				clearEventDescription();
				update_event_list_table();
			}
		});
	});

	return false;
});

$("#cancel-edit-btn").click(function() {
	$("#cancel-edit-btn").hide();
	override_event = false;
	clearEventDescription();
});

function getEventDescriptionXML(feed) {
	var description = feed.createElement("description");

	var content = "<![CDATA[ " + getEventDescriptionForm() + "]]>";
	var contnode = feed.createTextNode(content);

	description.appendChild(contnode);

	return description;
}

function getEventDescriptionForm() {
	var br = " <br/> ";
	var content = br;

	for (var i = 0; i < event_attributes.length; i++) {
		switch (event_attributes[i]) {
			case "date":
				content += dateFormat($("input[name=\"event-" + event_attributes[i] + "\"]").val());
				break;
			case "time":
				content += timeFormat($("input[name=\"event-" + event_attributes[i] + "\"]").val());
				break;
			case "description":
				content += $("textarea[name=\"event-" + event_attributes[i] + "\"]").val();
				break;
			default:
				content += $("input[name=\"event-" + event_attributes[i] + "\"]").val();
		}
		content += br;
	}

	return content;
}

function getEventDetails(description) {
	var ev = {};
	for (var i = 0; i < event_attributes.length; i++) {
		description = description.substring(description.indexOf(">") + 1);
		var attribute = description.substring(1, description.indexOf("<") - 1);
		ev[event_attributes[i]] = attribute;
	}
	return ev;
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
	loadUserFromFile();
	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
});

$("#github-logout").click(logoutOfGithub);