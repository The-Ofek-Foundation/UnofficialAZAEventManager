const Github = require("github-api");
const $ = require('jquery');
const fs = require('fs');

var github = user = repos = FeedRepo = logged_in = false;

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

function vert_align() {
	$('.vert-align').each(function() {
		$(this).css('margin-top', ($(this).parent().height() - $(this).height()) / 2 + "px");
	});
}

function saveUserToFile(username, password) {
	var userDetails = {};
	userDetails.username = username;
	userDetails.password = password;
	if (FeedRepo)
		userDetails.url = FeedRepo.clone_url;

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
						loginSuccess(userDetails.username);
						FeedRepo = repo;
					}
				});
			else getUserRepos(user, function(err, repos) {
				if (err) {
					if (err == "login_err")
						$("#login-err").text("Login details changed");
				}
				else {
					loginSuccess(userDetails.username);
					this.repos = repos;
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

function logoutOfGithub() {
	github = user = repos = FeedRepo = logged_in = false;
	writeToFile("login-info.txt", "");
	toggleLogDropdown($("#logout-dropdown"), false);
	$("#log-tab a").text('Login');
	$("#login-alert").show();
}

function loginSuccess(username) {
	logged_in = true;
	$("#log-tab a").text('Logged in as ' + username);
	toggleLogDropdown($("#login-dropdown"), false);
	$("#login-alert").hide();
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

