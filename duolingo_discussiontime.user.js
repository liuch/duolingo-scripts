// ==UserScript==
// @name           DuoDiscussionTime
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.1
// @grant          none
// @description    The script shows the exact time when a comment was created.
// @description:ru Скрипт показывает точное время создания комментария.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_discussiontime.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_discussiontime.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duodiscussiontime');
	script.textContent = '(' + f.toString() + ')()';
	document.head.appendChild(script);
}
inject(f);

function f() {

	var loc_reg = new RegExp("^/comment/");

	function update_comment(footer_el, date) {
		var date_el = footer_el.find(".showing-date");
		if (date_el.length) {
			if (date_el.hasClass("duo-discussion-time-date"))
				return;
		} else {
			var t = footer_el.contents().eq(1);
			if (t[0].nodeName == "#text") {
				var s = footer_el.contents().eq(1)[0].textContent;
				t.remove();
				date_el = $('<span class="showing-date"/>');
				date_el.text(s);
				footer_el.append(date_el);
			}
		}
		date_el.attr("data-toggle", "tooltip").attr("data-original-title", date.toLocaleString());
		date_el.addClass("duo-discussion-time-date");
	}

	function update_all_comments() {
		var metas = $("meta[itemprop=dateCreated]");
		var m;
		for (var i = 0; i < metas.length; ++i) {
			m = metas.eq(i);
			update_comment(m.parent(), new Date(m.attr("content")));
		}
	}

	function try_update() {
		if (!loc_reg.exec(document.location.pathname))
			return;
		update_all_comments();
	}

	var observer = null;
	var root_el  = null;

	function start_observe() {
		observer.observe(root_el, { childList: true, subtree: true });
	}

	function stop_observe() {
		observer.disconnect();
	}

	function set_observe() {
		root_el = document.getElementsByTagName("body")[0];
		if (root_el) {
			observer = new MutationObserver(function(mutations) {
				stop_observe();
				try_update();
				start_observe();
			});
			start_observe();
		}
	}

	setTimeout(set_observe, 100);
}
