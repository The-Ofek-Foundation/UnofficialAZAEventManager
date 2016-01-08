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
				$("#login-err").text("Invalid login details");
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
	loadUserFromFile();
	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
});

$("#github-logout").click(logoutOfGithub);
