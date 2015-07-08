// ==UserScript==
// @name           DuoLimit500
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.1
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
	var started = !1;
	function start() {
		if (started || !duo || !duo.templates || !duo.templates.events || !duo.ProfileView || !duo.EventsView)
			return;

		console.log("--- *Duo500 ---");
		// Here is replacing the events template
		var l = duo.templates.events.length;
		duo.templates.events = duo.templates.events.replace("</div></div></li>", '</div></div><span id="msg-chars-cnt" style="margin-left:3px;font-size:90%">0/500</span></li>');
		if (l == duo.templates.events.length) {
			console.log("--- !Duo500 ---");
			return;
		}

		// EventsView inject
		duo.EventsView = (function(v){return v.extend({
			template  : duo.templates.events
		});})(duo.EventsView);

		// ProfileView inject
		var newEnablePosting = function() {
			var n = $.trim(this.$(".post-activity .post").val()).length;
			if (n <= 500)
				this.$("#stream-post-btn").removeClass("btn-red").addClass("btn-green");
			else
				this.$("#stream-post-btn").removeClass("btn-green").addClass("btn-red");
			$("#msg-chars-cnt").text("" + n + "/500");
			if (this.oldEnablePosting)
				this.oldEnablePosting();
		};
		duo.ProfileView = (function(v){return v.extend({
			oldEnablePosting : v.prototype.enablePosting,
			enablePosting    : newEnablePosting
		});})(duo.ProfileView);

		started = !0;
		console.log("--- /Duo500 ---");
	}

	start();
	$(document).ready(function() {
		start();
	});
}
