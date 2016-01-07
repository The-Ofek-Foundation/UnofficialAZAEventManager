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
	var file_name = $("input[name=\"rss-file\"]").val();
	if (file_name.indexOf(".") == -1)
		file_name += ".txt";

	user.createRepo({"name": repo_name}, function(err, res) {
		FeedRepo = getRepo(repo_name);
		saveUserToFile();
		FeedRepo.write("master", file_name, "CONTENTS", "Create RSS File", function(err) {
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

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	loadUserFromFile();
});

$("#github-logout").click(logoutOfGithub);
