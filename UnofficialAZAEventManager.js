const Github = require("github-api");
const $ = require('jquery');
const fs = require('fs');

var github, user, URArepo;

$("#github-login-form").submit(function() {
	$("#login-err").text("");
	$("#login-success").text("");
	var username = $("input[name=\"username\"]").val();
	var password = $("input[name=\"password\"]").val();

	loginToGithub(username, password);

	getUnofficialRamonAppRepo(user, function(err, repo) {
		if (err)
			if (err == "login_err")
				$("#login-err").text("Invalid login details");
			else if (err == "repo_not_found")
				$("#login-err").text("Become a collaborator for Ramon App");
			else console.log("BOZO ALERT");
		else {
			saveUserToFile(username, password);
			URA = repo;
			vert_align();
			$("#github-login-container .flippable").addClass("flipped");
		}
	});

	return false;	// prevents reload
});

function getUnofficialRamonAppRepo(user, callback) {
	user.repos("all", function(err, repos) {
		if (err)
			callback("login_err", null);
		else for (var i = 0; i < repos.length; i++)
			if (repos[i].id = "42672465") {
				callback(false, repos[i]);
				return;
			}
		callback("repo_not_found", null);
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

function attempt_login_from_file() {
	var contents = readTextFile();
}

function saveUserToFile(username, password) {
	var userDetails = {};
	userDetails.username = username;
	userDetails.password = password;

	fs.writeFile(__dirname + "/login-info.txt", JSON.stringify(userDetails), function (err) {
		if (err)
			console.log(err);
	});
}

function loadUserFromFile() {
	fs.readFile(__dirname + "/login-info.txt", "utf8", function(err, data) {
		if (!err) {
			var userDetails = JSON.parse(data);
			loginToGithub(userDetails.username, userDetails.password);

			getUnofficialRamonAppRepo(user, function(err, repo) {
				if (err)
					if (err == "login_err")
						$("#login-err").text("Login details changed");
					else if (err == "repo_not_found")
						$("#login-err").text("Check your Ramon App permissions");
					else console.log("BOZO ALERT");
				else {
					URA = repo;
					$("#login-successful").text("Successfully logged in to " + userDetails.username);
					vert_align();
					$("#github-login-container .flippable").addClass("flipped");
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