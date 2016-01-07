$("#github-login-form").submit(function() {
	$("#login-err").text("");

	var username = $("input[name=\"username\"]").val();
	var password = $("input[name=\"password\"]").val();
	loginToGithub(username, password);

	getUserRepos(user, function(err, repos) {
		if (err) {
			if (err == "login_err")
				$("#login-err").text("Invalid login details");
			// else if (err == "repo_not_found")
			// 	$("#login-err").text("Become a collaborator for Ramon App");
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
		FeedRepo = getRepo(repo_name);
		saveUserToFile();
		FeedRepo.write("master", "rss-feed.txt", "No events posted yet.", "Created Event Feed", function(err) {
			if (err)
				console.log(err);
			else {
				$("#logged-in-div").animate({
					opacity: 0,
					"margin-top": "-10px"
				}, 1000);
			}
		});
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
				$("#login-err").text("Repo not found");
			else console.log(err);
		else {
			saveUserToFile();
			$("#logged-in-div").animate({
				opacity: 0,
				"margin-top": "-10px"
			}, 1000);
		}
	});
});
var feed;
$("#write-event-form").submit(function () {
	FeedRepo.read('master', 'rss-feed.txt', function (err, contents) {
		// var feed;
		try {
			$.parseXML(contents);
			feed = StringToXML(contents);
		}
		catch (err) {
			feed = StringToXML('<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel></channel></rss>');
		}
		var new_event = feed.createElement("item");
		var description = getEventDescriptionXML(feed);
		new_event.appendChild(description);
		feed.childNodes[0].childNodes[0].appendChild(new_event);

		FeedRepo.write("master", "rss-feed.txt", XMLToString(feed), "Update Event Feed", function(err) {
			if (err)
				console.log(err);
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

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	loadUserFromFile();
	$("input[name=\"event-date\"]").val(new Date().toDateInputValue());
});

$("#github-logout").click(logoutOfGithub);
