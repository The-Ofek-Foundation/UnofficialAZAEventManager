const Github = require("github-api");
const $ = require('jquery');

var github, user, URArepo;

$("#github-login-form").submit(function() {
	$("#login-err").text("");
	$("#login-success").text("");
	github = new Github({
	  username: $("input[name=\"username\"]").val(),
	  password: $("input[name=\"password\"]").val(),
	  auth: "basic"
	});
	user = github.getUser();
	getUnofficialRamonAppRepo(user, function(repo) {
		URA = repo;
		$("#github-login-container .flippable").addClass("flipped");
	});

	return false;	// prevents reload
});

function getUnofficialRamonAppRepo(user, callback) {
	user.repos("all", function(err, repos) {
		if (err)
			$("#login-err").text("Invalid login details");
		else for (var i = 0; i < repos.length; i++)
			if (repos[i].id = "42672465") {
				callback(repos[i]);
				return;
			}
		$("#login-err").text("Become a collaborator for Ramon App");
	});
}

$(document).ready(function() {
	$("#github-login-container").height($("#github-login-container .flippable figure").outerHeight(false));
	$("#github-login-container .flippable figure").css("width", "100%").css("height", "100%");
	vert_align();
});

function vert_align() {
	$('.vert-align').each(function() {
		$(this).css('margin-top', ($(this).parent().height() - $(this).height()) / 2 + "px");
	});
}