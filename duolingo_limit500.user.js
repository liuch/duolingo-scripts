// ==UserScript==
// @name           DuoLimit500
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.2.3
// @grant          none
// @description    This script warns you when you exceed the limit on the length of the activity stream message.
// @description:ru Этот скрипт предупредит вас, когда вы превысите лимит длины сообщения при отправке в ленте.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_limit500.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_limit500.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duolimit500');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	var updateCounter = function() {
		var n = $.trim($("#stream-post").val()).length;
		if (n <= 500) {
			$("#stream-post-btn").removeClass("btn-red").addClass("btn-green");
			$("#msg-chars-cnt").css("color", "");
		} else {
			$("#stream-post-btn,").removeClass("btn-green").addClass("btn-red");
			$("#msg-chars-cnt").css("color", "red");
		}
		$("#msg-chars-cnt").text("" + n + "/500");
	};

	var onPost = function() {
		$("#msg-chars-cnt").text("0/500");
		$("#stream-post-btn").removeClass("btn-red").addClass("btn-green");
	};

	function start(e, r, o) {
		if (!duo)
			return;
		if (o.url == "/diagnostics/js_error")
			return;

		var x = new RegExp("^/activity/[0-9]+\\?");
		if (x.exec(o.url) && $("#msg-chars-cnt").length == 0) {
			var el = $("#stream-post").parent().parent().parent();
			if (el.length) {
				el.append('<span id="msg-chars-cnt" style="margin-left:3px;font-size:90%">0/500</span>');
				$("#stream-post").bind("keyup", updateCounter).bind("input", updateCounter);
				$("#stream-post-btn").bind("click", onPost);
			}
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}

