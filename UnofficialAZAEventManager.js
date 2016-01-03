const Github = require("github-api");
const $ = require('jquery');
const fs = require('fs');

var github, user, repos, AppRepo;

$("#github-login-form").submit(function() {
	$("#login-err").text("");
	$("#login-success").text("");

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
			saveUserToFile(username, password);
			this.repos = repos;
			$("#login-successful").text("Successfully logged into " + username);
			$("#github-login-container .flippable").addClass("flipped");
			vert_align();
		}
	});

	return false;	// prevents reload
});

function getUserRepos(user, callback) {
	user.repos("all", function(err, repos) {
		if (err)
			callback("login_err", null);
		else callback(false, repos);
	});
}

function getRepo(url) {
	for (var i = 0; i < repos.length; i++)
		if (repos[i].clone_url == url)
			return repos[i];
	return null;
}

function getUserRepo(user, url, callback) {
	user.repos("all", function(err, repos) {
		if (err)
			callback("login_err", null);
		else {
			for (var i = 0; i < repos.length; i++)
				if (repos[i].clone_url == url) {
					callback(false, repos);
					return;
				}
			callback("repo_not_found", null);
		}
	});
}

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	vert_align();
	loadUserFromFile();
});

function vert_align() {
	$('.vert-align').each(function() {
		$(this).css('margin-top', ($(this).parent().height() - $(this).height()) / 2 + "px");
	});
}

function saveUserToFile(username, password, app_url) {
	var userDetails = {};
	userDetails.username = username;
	userDetails.password = password;
	if (app_url)
		userDetails.url = app_url;

	writeToFile("login-info.txt", JSON.stringify(userDetails), console.log());
}

function loadUserFromFile() {
	loadFromFile("login-info.txt", function(err, data) {
		if (!err && data.length > 0) {
			var userDetails = JSON.parse(data);
			loginToGithub(userDetails.username, userDetails.password);

			if (userDetails.url)
				getUserRepo(user, userDetails.url, function(err, repo) {
					if (err) {
						if (err == "login_err")
							$("#login-err").text("Login details changed");
					}
					else {
						AppRepo = repo;
						$("#login-successful").text("Successfully logged in to " + userDetails.username);
						$("#github-login-container .flippable").addClass("flipped");
						vert_align();
					}
				});
			else getUserRepos(user, function(err, repos) {
				if (err) {
					if (err == "login_err")
						$("#login-err").text("Login details changed");
				}
				else {
					this.repos = repos;
					$("#login-successful").text("Successfully logged into " + userDetails.username);
					$("#github-login-container .flippable").addClass("flipped");
					vert_align();
				}
			});
		}
	});
}

function loginToGithub(username, password) {
	github = new Github({
	  username: username,
	  password: password,
	  auth: "basic"
	});
	user = github.getUser();
}

$("#github-logout").click(function() {
	github = user = repos = null;
	$("#github-login-container .flippable").removeClass("flipped");
	writeToFile("login-info.txt", "");
});

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