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
			loginSuccess(username);
			saveUserToFile(username, password);
			this.repos = repos;
		}
	});

	return false;	// prevents reload
});

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	loadUserFromFile();
});

$("#github-logout").click(logoutOfGithub);
