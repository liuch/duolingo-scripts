// ==UserScript==
// @name           DuoDiscussionTime
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://forum.duolingo.com/*
// @version        0.2.1
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
		var date_el = footer_el.querySelector(".iif_C");
		if (date_el) {
			// post
			if (date_el.classList.contains("duo-discussion-time-date"))
				return;
		} else {
			// comments
			var t = footer_el.childNodes[1];
			if (t && t.tagName == "SPAN") {
				date_el = t;
			}
		}
		if (date_el) {
			date_el.setAttribute("title", date.toLocaleString());
			date_el.className += " duo-discussion-time-date";
		}
	}

	function update_all_comments() {
		var metas = document.querySelectorAll("meta[itemprop=dateCreated]");
		var m;
		for (var i = 0; i < metas.length; ++i) {
			m = metas[i];
			if (m.parentElement)
				update_comment(m.parentElement, new Date(m.getAttribute("content")));
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
