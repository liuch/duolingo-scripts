// ==UserScript==
// @name           DuoThemeSwitcher
// @namespace      https://github.com/liuch/duolingo-scripts
// @version        0.1.0
// @description    This script adds an menu item to the account menu for easy theme switching.
// @description:ru Этот скрипт добавляет пункт меню в главное меню аккаунта для удобного переключения тем.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_themeswitcher.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_themeswitcher.user.js
// @author         FieryCat
// @match          https://www.duolingo.com/*
// @grant          none
// ==/UserScript==

(function() {
	'use strict';

	var current_theme = null;

	function switch_to(theme_name) {
		current_theme = theme_name;
		localStorage["duo.current_theme"] = theme_name;
		window.duo.isJuicy = (theme_name == "juicy");
		document.getElementsByTagName("html")[0].setAttribute("data-juicy", window.duo.isJuicy);
		if (window.location.pathname == "/") {
			document.querySelector("a[data-test='user-profile']").click();
		}
		else {
			document.querySelector("a[data-test='home-nav']").click();
		}
		window.history.back();
	}

	function append_menu_item() {
		var smi = document.querySelector("li._31ObI>a[data-test='sound-settings'][href='/settings']._3sWvR");
		if (smi) {
			smi = smi.parentNode;
		}
		if (smi && smi.nextSibling) {
			var el1 = document.createElement("li");
			el1.setAttribute("class", "_31ObI");
			var el2 = document.createElement("a");
			el2.setAttribute("href", "javascript:;");
			el2.setAttribute("class", "_3sWvR");
			el2.appendChild(document.createTextNode("Other theme"));
			el2.onclick = function() { switch_to((current_theme == "dry") && "juicy" || "dry"); };
			el1.appendChild(el2);
			smi.parentNode.insertBefore(el1, smi.nextSibling);
		}
	}

	if (window.duo.isJuicy !== undefined) {
		current_theme = window.duo.isJuicy && "juicy" || "dry";
		if (!localStorage["duo.current_theme"]) {
			localStorage["duo.current_theme"] = current_theme;
		}
		else if (localStorage["duo.current_theme"] != current_theme) {
			switch_to(localStorage["duo.current_theme"]);
		}
		setTimeout(append_menu_item, 500);
	}
})();

