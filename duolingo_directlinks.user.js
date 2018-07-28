// ==UserScript==
// @name           DuoDirectLinks
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://forum.duolingo.com/*
// @version        0.4.2
// @grant          none
// @description    This script adds the direct links for discussion comments
// @description:ru Этот скрипт добавляет прямые ссылки на комментария в форумах
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_directlinks.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_directlinks.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duodirectlinks');
	script.textContent = '(' + f.toString() + ')()';
	document.head.appendChild(script);
}
inject(f);

function f() {

	var loc_reg = new RegExp("^/comment/([0-9]+)");
	var cid_reg = new RegExp("[$&]comment_id(=|%3D)([0-9]+)");

	function create_link_element(url) {
		var s = document.createElement("span");
		s.className = "cCL9P";
		s.setAttribute("style", "background-position:-730px -71px;width:12px;height:12px;cursor:pointer;")
		var a = document.createElement("a");
		a.setAttribute("style", "float:left;margin-right:0.5em;");
		a.setAttribute("href", url);
		a.appendChild(s);
		return a;
	}

	function add_marker(c) {
		var m = document.createElement("div");
		m.setAttribute("style", "width:0;height:0;border-top:10px solid red;border-right: 10px solid transparent;float:left;");
		c.insertBefore(m, c.firstChild);
	}

	function update_post(id) {
		var el = document.querySelector("section._3RKCq>div>div>div>div._3eQwU");
		if (el) {
			if (el.firstChild.nodeName == "H1") {
				var title = el.firstChild.textContent.trim().replace("[", "\\[").replace("]", "\\]");
				var url = document.location.protocol + "//" + document.location.host;
				var l = create_link_element("");
				l.setAttribute("style", l.getAttribute("style") + "margin-top:0.5em;");
				el.insertBefore(l, el.firstChild);
				var t = document.createElement("input");
				t.setAttribute("type", "text");
				t.setAttribute("style", "width:100%;height:50%;");
				t.setAttribute("readonly", "readonly");
				t.hidden = true;
				t.value = "[" + title + "](" + url.replace("(", "\\(").replace(")", "\\)") + "/comment/" + id + ")";
				el.insertBefore(t, el.children[2]);
				l.onclick = function() {
					t.hidden = !t.hidden;
					if (!t.hidden) {
						t.focus();
						t.select();
					}
					return false;
				};
			}
		}
	}

	function update_comment(c, t_id, m_id) {
		var c_id = c.getAttribute("id");
		var h = c.querySelector("div.PvLN8>div._38HQY");
		if (h) {
			h.insertBefore(create_link_element("/comment/" + t_id + "$comment_id=" + c_id), h.firstChild);
		}
		if (c_id == m_id)
			add_marker(c);
	}

	function update_all_comments(thread_id) {
		var comments = document.querySelectorAll("div.uMmEI>div[id]:not(.duo-direct-link),div._28es7>div[id]:not(.duo-direct-link)");
		if (comments.length) {
			var res = cid_reg.exec(document.location.pathname);
			var comment_id = res && res[2];
			var c;
			for (var i = 0; i < comments.length; ++i) {
				c = comments[i];
				update_comment(c, thread_id, comment_id);
				c.className += " duo-direct-link"
			}
		}
	}

	function try_update() {
		var r = loc_reg.exec(document.location.pathname);
		if (!r)
			return;
		var id = r[1];
		update_post(id);
		update_all_comments(id);
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
