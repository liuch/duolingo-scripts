// ==UserScript==
// @name           DuoMarkupCleaner
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://forum.duolingo.com/*
// @version        0.1.1
// @grant          none
// @description    This script removes excessive user markup on the forum (currently only color text).
// @description:ru Этот скрипт удаляет чрезмерную разметку пользователей на форуме (пока только цветной текст).
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_markupcleaner.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_markupcleaner.user.js
// @author         FieryCat aka liuch
// ==/UserScript==

// @license        MIT License

function inject(f) { //Inject the script into the document
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duomarkupcleaner');
	script.textContent = '(' + f.toString() + ')()';
	document.head.appendChild(script);
}
inject(f);


function f() {
	"use strict";

	var MAX_COLOR_PERCENT = 0.3;
	var first = true;

	var observe = {
		observer: null,
		root_el: null,
		p_func: null,

		set: function(func) {
			this.root_el = document.getElementsByTagName("body")[0];
			if (this.root_el) {
				this.p_func = func;
				this.observer = new MutationObserver(function(mutations) {
					if (observe.p_func) {
						observe.stop();
						observe.p_func()
						observe.start();
					}
				});
			}
		},

		start: function() {
			this.observer.observe(this.root_el, { childList: true, subtree: true });
		},

		stop: function() {
			this.observer.disconnect();
		}
	};

	function switch_attr(el, n1, n2) {
		el.setAttribute(n2, el.getAttribute(n1));
		el.removeAttribute(n1);
	}

	function warn_text(count, cleared) {
		return "! DuoMarkupCleaner: " + (cleared && "Cleared" || "Found") + " " + count + " color item" + (count > 1 && "s" || "") + ".";
	}

	function toggle_attr(content, warn) {
		var t_res = content.classList.toggle("dmc-cleaned");
		var a1 = "color", a2 = "dmc_color";
		if (!t_res)
			a2 = [a1, a1 = a2][0];
		var cnt = 0;
		content.querySelectorAll("font[" + a1 + "]").forEach(function(e) {
			switch_attr(e, a1, a2);
			++cnt;
		});
		warn.children[0].textContent = warn_text(cnt, t_res);
		return t_res;
	}

	function make_warn_element() {
		var i = document.createElement("p");
		i.setAttribute("style", "margin:0;");
		i.setAttribute("class", "dmc-warn");
		var ii = document.createElement("small");
		ii.setAttribute("title", "Click to toggle");
		ii.setAttribute("style", "color:gray");
		i.appendChild(ii);
		return i;
	}

	function scan_element(el) {
		var c_len = 0;
		var c_arr = el.querySelectorAll("font[color]");
		if (c_arr.length > 0) {
			var cnt = 0;
			c_arr.forEach(function(e) {
				c_len += e.textContent.length;
				++cnt;
			});
			var w_el = make_warn_element();
			el.appendChild(w_el);
			var t_len = el.textContent.length;
			if (t_len > 0 && c_len / t_len > MAX_COLOR_PERCENT)
				toggle_attr(el, w_el);
			else
				w_el.children[0].textContent = warn_text(cnt, false);
		}
		el.classList.add("dmc-handled");
	}

	function scan_dom() {
		var cl = document.querySelectorAll("div[itemprop=text]:not(.dmc-handled");
		if (cl.length > 0) {
			cl.forEach(function(e) {
				scan_element(e);
			});
			if (first) {
				first = false;
				var el = cl[0].closest("section[itemtype]");
				if (el) {
					el.addEventListener("click", function(event) {
						var tg = event.target.parentElement;
						if (tg.classList.contains("dmc-warn")) {
							toggle_attr(tg.closest("div[itemprop=text]"), tg);
						}
					});
				}
			}
		}
	}

	setTimeout(function() {
		scan_dom();
		observe.set(scan_dom);
		observe.start();
	}, 100);
}

