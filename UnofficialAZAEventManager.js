const Github = require("github-api");
const $ = require('jquery');
const pd = require('pretty-data').pd;
const Cryptr = require("cryptr");
const cryptr = new Cryptr("the-ofek-foundation");
const html = require("html");
const cssbeautify = require("cssbeautify");
const JSZip = require("jszip");

const event_attributes = ["date", "name", "description", "time", "location_name", "bring", "planners", "location"];
const gh_legals = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '.'];

var github = user = username = password = repos = repo_name = FeedRepo = FeedRepoInfo = logged_in = owner = false;
var override_event = false;
var fr, file; // for reading contacts csv

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
	return github.getRepo(owner, repo_name);
}

function create_repo(org, options, cb) {
	if (org)
		github._request('POST', '/orgs/' + org + '/repos', options, cb);
	else github._request('POST', '/user/repos', options, cb);
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

function getFile(file, callback) {
	FeedRepo.read('master', file, function (err, contents) {
		callback(err, contents);
	});
}

function getFeedEvents(feed) {
	var items = feed.getElementsByTagName("item");
	var events = {};

	for (var i = 0; i < items.length; i++) {
		var event_details = getEventDetails(items[i].getElementsByTagName("description")[0].childNodes[1].data.replace(/></g, ">  <"));
		events[event_details.name] = event_details;
	}

	return events;
}

function updateHTMLFeed(events) {
	var containing_div = $("<div></div>").addClass('css-events-list');

	var zero_events = true;
	for (var event_name in events) {
		var event = events[event_name];
		zero_events = false;
		var item = $("<div></div>").addClass('event');

		var date_p = $("<p></p>").addClass('event-date');
		date_p.append($("<u></u>").text(prettyDate(event.date)));
		item.append(date_p);

		var title_p = $("<p></p>").addClass('event-title');
		title_p.append($("<b></b>").text(event.name));
		item.append(title_p);

		var details_div = $("<div></div>").addClass('event-details');
		var description = $("<p></p>").addClass('event-description').text(" " + event.description).prepend($("<strong></strong>").text("Description:"));
		details_div.append(description)
		var meet;
		if (event.location_name && event.location_name !== ' ')
			meet = $("<p></p>").addClass('event-meet').html(" " + event.location_name + ((event.location || event.location !== ' ') ? (' (<a target="_blank" href="https://maps.google.com/?q=' + event.location + "\">" + event.location + "</a>)"):"") + " at " + event.time).prepend($("<strong></strong>").text("Meet:"));
		else meet = $("<p></p>").addClass('event-meet').text(" at " + event.time).prepend($("<strong></strong>").text("Meet"));
		details_div.append(meet);
		if (event.bring && event.bring !== ' ') {
			var bring = $("<p></p>").addClass('event-bring').text(" " + event.bring).prepend($("<strong></strong>").text("Bring:"));
			details_div.append(bring);
		}
		if (event.planners && event.planners !== ' ') {
			var planned_by = $("<p></p>").addClass('planned_by').text(" " + event.planners).prepend($("<strong></strong>").text("Planned by:"));
			details_div.append(planned_by);
		}
		item.append(details_div);

		containing_div.append(item);
	}
	if (zero_events)
		containing_div.append($("<p></p>").addClass('no-events').text("No events posted."));

	containing_div.append($('<link rel="stylesheet" type="text/css"></link>').attr("href", "styles.css"));

	var father = $("<div></div>").append(containing_div);

	var pretty = html.prettyPrint(father.html(), {indent_size: 2});
	FeedRepo.write("gh-pages", "index.html", pretty, "Update Event Feed HTML", function(write_err) {
		if (write_err)
			popupError("Error creating html", write_err);
	});
}

function update_event_list_table() {
	var online_list = "https://" + FeedRepoInfo.owner.login + ".github.io/" + FeedRepoInfo.name + "/";
	var ref = $("<a></a>").attr("href", online_list).attr("target", "_blank").text(online_list);
	$("#view-feed-online").children().remove();
	$("#view-feed-online").text("View feed online: ").append(ref);
	getFeed(function (err, contents) {
		var feed;
		$("#event-list-table-div").children().remove();
		$("#event-list-table-div").text("");
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			$("#event-list-table-div").text("No events posted.");
			updateHTMLFeed({});
			return;
		}
		var events = getFeedEvents(feed);
		updateHTMLFeed(events);

		var zero_events = true;
		var table = $("<table></table>");
		for (var event_name in events) {
			zero_events = false;
			var row = $("<tr></tr>");
			var cols = new Array(2);
			cols[0] = $("<td></td>").text(event_name + " - " + dateMinimize(events[event_name].date));
			var delete_button = $("<button></button>").data("event-name", event_name).text("Delete").click(function () {
				delete_event($(this).data("event-name"));
			});
			var edit_button = $("<button></button>").text("Edit").data("event-details", JSON.stringify(events[event_name])).click(function() {
				edit_event(JSON.parse($(this).data("event-details")));
			});
			cols[1] = $("<td></td>").append(delete_button).append(edit_button);

			for (var i = 0; i < cols.length; i++)
				row.append(cols[i]);
			table.append(row);
		}
		if (zero_events)
			$("#event-list-table-div").text("No events posted.");
		else $("#event-list-table-div").append(table);
	});
}

function delete_event(name) {
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

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)).replace(/></g, ">  <"), "Update Event Feed", function(write_err) {
			if (write_err)
				popupError("File already deleted", write_err);
			else update_event_list_table();
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
	$("#write-event-form input[type=\"submit\"]").val("Edit event");
	$("#write-event-status").text("");
}

function generate_chapter_pack(csv_contents) {
	var zip = new JSZip();
	zip.file("ContactList.csv", csv_contents);
	zip.file("EventFeed.txt", "https://raw.githubusercontent.com/" + FeedRepoInfo.owner.login + "/" + FeedRepoInfo.name + "/master/rss-feed.txt");
	var content = zip.generate({type:"string"});

	saveZip(content, "Chapter Pack - " + FeedRepoInfo.owner.login);
}

function vert_align() {
	$('.vert-align').each(function() {
		$(this).css('margin-top', ($(this).parent().height() - $(this).height()) / 2 + "px");
	});
}

function saveUserToFile() {
	var userDetails = {};
	userDetails.username = username;
	userDetails.owner = owner;
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
		owner = userDetails.owner;

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
							$("input[name=\"owner-name\"]").val(owner);
						}
						else FeedRepoInfo = contents;
						loginSuccess();
					});
				}
				else {
					$("input[name=\"owner-name\"]").val(owner);
					loginSuccess();
				}
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
	github = user = username = password = repos = repo_name = FeedRepo = FeedRepoInfo = logged_in = owner = false;
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
	$("#generate-repos-span").text("");
	switch_page("#setup");
}

function loginSuccess() {
	logged_in = true;
	$("#log-tab a").text('Logged in as ' + username);
	$("#logout-dropdown").css("width", $("#log-tab").width() - paddings($("#logout-dropdown")) + "px");
	toggleLogDropdown($("#login-dropdown"), false);
	$(".login-alert").hide();
	$("#create-repo").css("opacity", 1).css("margin-top", "0px");
	$("#logged-in-div").animate({
		opacity: 1,
		"margin-top": 0
	}, 1000);
	if (FeedRepo)
		fullLoginSuccess();
	else $("#create-repo").show();
}

function fullLoginSuccess() {
	$("#readme-ref").attr("href", "https://github.com/" + FeedRepoInfo.owner.login + "/" + FeedRepoInfo.name + "/tree/gh-pages");
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
		$("#strange-error").text(JSON.stringify(log));
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

function paddings(elem) {
	return parseInt(elem.css("padding-left")) + parseInt(elem.css("padding-right"));
}

/** Here starts index.js **/

$("#github-login-form").submit(function() {
	$("#login-err").text("");

	var username = $("input[name=\"username\"]").val();
	owner = username;
	var password = $("input[name=\"password\"]").val();
	loginToGithub(username, password);

	getUserRepos(user, function(err, repos) {
		if (err) {
			if (err == "login_err")
				$("#login-err").text("Invalid login details");
		}
		else {
			$("input[name=\"owner-name\"]").val(owner);
			loginSuccess();
			saveUserToFile();
			this.repos = repos;
		}
	});

	return false;	// prevents reload
});

$("#repo-name-form").submit(function() {
	repo_name = gh_legalize($("input[name=\"rss-repo\"]").val());

	$("#generate-repos-span").text(" Generating...");
	$("#login-err").text("");
	owner = $("input[name=\"owner-name\"]").val();
	var org = $("input[name=\"org-check\"]").prop('checked') ? owner:false;

	create_repo(org, {"name": repo_name}, function(err, res) {
		if (err) {
			if (err.error === 422)
				$("#login-err").text("Repo already exists!");
			else if (err.error === 403)
				popupError("Check your permission to access this repo");
			else if (err.error === 404)
				popupError("Organization not found", err);
			else	popupError("Error creating repo, contact developer", err);
			$("#generate-repos-span").text(" Error");
		}
		else {
			FeedRepo = getRepo(repo_name);
			saveUserToFile();
			FeedRepo.show(function (show_err, contents) {
				if (show_err) {
					if (show_err.error === 404)
						popupError("Could not find repo, may use illegal characters");
					else popupError("Unexpected show error, contact developer", show_err);
					$("#generate-repos-span").text(" Error");
				}
				else {
					FeedRepoInfo = contents;

					FeedRepo.write("master", "rss-feed.txt", "No events posted yet.", "Created Event Feed", function(create_err) {
						if (create_err) {
							popupError("Error creating file rss-feed.txt, contact developer", create_err);
							$("#generate-repos-span").text(" Error");
						}
						else generate_gh_pages(function () {
							$("#create-repo").animate({
								opacity: 0,
								"margin-top": "-10px"
							}, 1000, function () {
								$(this).hide();
								fullLoginSuccess();
							});
						});
					});
				}
			});
		}
	});

	return false;
});

function generate_gh_pages(callback) {
	FeedRepo.branch("gh-pages", function(branch_err) {
		if (branch_err) {
			popupError("Error creating gh-pages branch, contact developer", branch_err);
			callback();
			return;
		}
		else FeedRepo.remove("gh-pages", "rss-feed.txt", function (rem_err) {
			if (rem_err)
				console.error("remove err ", rem_err);
			FeedRepo.write("gh-pages", "styles.css", cssbeautify(cssContents(), {indent: '  ', autosemicolon: true}), "Create styles", function (css_err) {
				if (css_err)
					if (css_err.error == 409)
						popupError("Conflict when creating styles.css, contact developer", css_err);
					else console.error("css err ", css_err);
				FeedRepo.write("gh-pages", "README.md", ghReadmeContents(), "Create gh readme", function (readme_gh_err) {
					if (readme_gh_err)
						console.error("readme gh err ", readme_gh_err);
					callback();
				});
			});
		});
	});
}

$("#repo-exists").keypress(function (e) {
	if (e.which === 13) // enter key
		$("#repo-exists-btn").click();
});

$("#repo-exists-btn").click(function () {
	repo_name = $("#repo-exists").val();
	owner = $("input[name=\"owner-name\"]").val();
	FeedRepo = getRepo(repo_name);
	$("#login-err").text("");
	FeedRepo.show(function (err, contents) {
		if (err)
			if (err.error == 404)
				popupError("Repo not found");
			else popupError("Repo error, contact developer", err);
		else if (!contents.permissions.pull || !contents.permissions.push)
			popupError("Check your permission to access this repo!");
		else {
			saveUserToFile();
			$("#create-repo").animate({
				opacity: 0,
				"margin-top": "-10px"
			}, 1000, function () {
				$(this).hide();
				fullLoginSuccess();
			});
			FeedRepoInfo = contents;
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

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)).replace(/></g, ">  <"), "Update Event Feed", function(write_err) {
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
				resetEventDescription();
				update_event_list_table();
				switch_page("#manage-events");
			}
		});
	});

	return false;
});

$("#chapter-pack-form").submit(function () {
	getFileContents('contact-csv', function (contents) {
		generate_chapter_pack(contents);
	});

	return false;
});

$("#cancel-edit-btn").click(function() {
	$("#cancel-edit-btn").hide();
	$("#write-event-form input[type=\"submit\"]").val("Add event");
	override_event = false;
	resetEventDescription();
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
				var val = $("input[name=\"event-" + event_attributes[i] + "\"]").val();
				content += val ? val:" ";
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

function resetEventDescription() {
	$("#write-event-form input").val("");
	$("#write-event-form textarea").val("");

	$("#write-event-form input[name=\"event-date\"]").val(new Date().toDateInputValue());
	$("#write-event-form input[name=\"event-time\"]").val("18:00");
	$("#write-event-form input[type=\"submit\"").val("Add Event");
	$("#cancel-edit-btn").val("Cancel edit");
}

$("#archive-oldies").click(function () {
	$("#num-archived").text("Archiving...");
	getFeed(function (err, contents) {
		var feed;
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			update_event_list_table();
			$("#num-archived").text("0 events archived");
			console.error("No events listed!");
			return;
		}
		var items = feed.getElementsByTagName("item");
		var archive_string = "";
		var num_archived = 0;
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		for (var i = 0; i < items.length; i++) {
			var event = getEventDetails(items[i].getElementsByTagName("description")[0].childNodes[1].data);
			if (stringToDate(event.date) < yesterday) {
				archive_string += archiveFormat(event) + "\n";
				items[i].parentNode.removeChild(items[i]);
				num_archived++;
			}
		}

		FeedRepo.write("master", "rss-feed.txt", pd.xml(XMLToString(feed)).replace(/></g, ">  <"), "Update Event Feed", function(write_err) {
			if (write_err)
				popupError("Files already deleted/archived", write_err);
			else update_event_list_table();
		});

		getFile("archive.csv", function (archive_err, archive_contents) {
			if (!archive_contents)
				archive_contents = "";
			FeedRepo.write("master", "archive.csv", archive_contents + archive_string, "Archive " + new Date().toString(), function (archiving_err) {
				if (archiving_err)
					popupError("Error archiving, contact developer", archiving_err);
				if (num_archived === 1)
					$("#num-archived").text("1 event archived");
				else $("#num-archived").text(num_archived + " events archived");
			});
		});
	});
});

function getFileContents (id, callback)	{
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      popupError('The File APIs are not fully supported in this browser.');
      return false;
    }

    input = document.getElementById(id);
    if (!input)
		popupError("Cannot find input element, try reloading page");
    else if (!input.files)
      popupError("This browser doesn't seem to support the `files` property of file inputs.");
    else if (!input.files[0])
      popupError("Please select a file first");
    else {
		file = input.files[0];
		fr = new FileReader();
		fr.onload = function() { callback(fr.result); }
		fr.readAsText(file);
    }
}

$("input[name=\"rss-repo\"]").keyup(function () {
	legalize_input($(this));
});

$("input[name=\"owner-name\"]").keyup(function () {
	legalize_input($(this));
});

$("#repo-exists").keyup(function () {
	legalize_input($(this));
});

function legalize_input(input) {
	var val = gh_legalize(input.val());

	if (val !== input.val())
		input.val(val);
}

function gh_legalize(val) {
	for (var i = 0; i < val.length; i++)
		if (gh_legals.indexOf(val.charAt(i)) === -1)
			val = val.substring(0, i) + '-' + val.substring(i + 1);

	return val;
}

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	$("#login-dropdown").css("min-width", $("#log-tab").width() - paddings($("#login-dropdown")) + "px");
	loadUserFromFile();
	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
	resetEventDescription();
});

$("#github-logout").click(logoutOfGithub);
