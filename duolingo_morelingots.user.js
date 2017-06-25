// ==UserScript==
// @name           DuoMoreLingots
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.6
// @grant          none
// @description    This script allows you to give more than one lingot in two clicks.
// @description:ru Этот скрипт позволяет давать больше одного лингота за раз.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_morelingots.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_morelingots.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duogivelingots');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);


function f($) {

	var cache = { id: 0, el: null, top_el: null };

	function find_love_el(id, root, path) {
		if (root)
			return $(".discussion-main " + path).eq(-1);
		return $("#body-" + id).siblings(".footer").find(path);;
	}

	var update_comment = function(id, love, root) {
		var el = cache.el;
		if (id != cache.id || !el) {
			el = find_love_el(id, root, ".love-number");
			if (!el.length) {
				el = find_love_el(id, root, ".give-love");
				if (!el.length)
					return;
				if (root)
					el.after($('<span><span class="icon icon-lingot-small" /><span class="love-number">0</span></span>'));
				else
					el.after($('<span class="icon icon-lingot-micro" /><span class="love-number">0</span>'));
				el = find_love_el(id, root, ".love-number");
			}
			cache.id = id;
			cache.el = el;
		}
		el.text(love);
		if (!cache.top_el)
			cache.top_el = $("#topbar").find("#num_lingots");
		if (duo.user.attributes.rupees > 0) {
			--duo.user.attributes.rupees;
			cache.top_el.text(" " + duo.user.attributes.rupees);
		}
	};

	var send_one = function(id, root) {
		if (duo.user.attributes.rupees > 0)
			$.post("/comments/" + id + "/love", function(d) {"love" in d && update_comment(id, d.love, root);});
	};

	function set_interval_limited(id, root, n, t) {
		if(n <= 0) {
			cache.el = null;
			return;
		}
		setTimeout(function() {send_one(id, root); set_interval_limited(id, root, n-1, t);}, t);
	}

	var lover = function(id, root) {
		var love = parseInt(prompt("How many lingots would you like to give away?", "1"));
		if (love > 0 && (love <= 10 || confirm("Are you sure want to give " + love + " lingots away?")))
			set_interval_limited(id, root, love, 200);
		return false;
	};

	var new_give_lingots = function() {
		var el = this.parentElement;
		if (el) {
			var id = null;
			var root = false;
			if (el.tagName == "SPAN") {
				id = document.location.pathname.match(/^\/comment\/([0-9]+)($|\$)/)[1];
				root = true;
			} else if (el.tagName == "DIV") {
				var i = 4;
				while (el) {
					if (!--i) {
						if (el.id)
							id = el.id.match(/^comment-([0-9]+)/)[1];
						break;
					}
					el = el.parentElement;
				}
			}
			if (id)
				lover(id, root);
		}
		return false;
	};

	var main_reg = null;

	function ajax_complete(e, r, o) {
		if (!duo || !duo.user)
			return;
		if (o.url == "/diagnostics/js_error")
			return;

		if (!main_reg)
			main_reg = new RegExp("^(https://duolingo-forum-prod.duolingo.com)?/comments/[0-9]+($|\\?|/reply|/upvote|/downvote|/love)");
		var a = main_reg.exec(o.url);
		if (a) {
			$("#app").undelegate(".give-love", "click");
			$("#app").delegate(".give-love", "click", new_give_lingots);
			$(".discussion-comments-list-item").undelegate(".give-love", "click");
			$(".discussion-comments-list-item").delegate(".give-love", "click", new_give_lingots);
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		ajax_complete(e, r, o);
	});
}
