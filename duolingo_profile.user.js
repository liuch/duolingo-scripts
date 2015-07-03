// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.1
// @grant          none
// @description    This script displays additional information in the users profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профиле пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duo-profile');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	function start() {
		if (!duo || !duo.user || !duo.templates || !duo.templates.profile)
			return;

		console.log("--- *DuoProfile ---");

		var l = duo.templates.profile.length
		duo.templates.profile = duo.templates.profile.replace("{{username}}</h1><h2 ", "{{username}}</h1></h2>{{#created}}<p class=\"gray\">{{#_i}}Registered:{{/_i}} {{created}}</p>{{/created}}<h2 ");
		if (l == duo.templates.profile) {
			console.log("--- !DuoProfile ---");
			return;
		}

		// duo.ProfileView inject
		duo.ProfileView = (function(v){return v.extend({
			template  : duo.templates.profile
		});})(duo.ProfileView);

		// UI translations
		if (duo.ui_translations["Registered:"] === undefined) {
			if (duo.user.attributes.ui_language == "ru")
				duo.ui_translations["Registered:"] = "Зарегистрирован(а):";
			else if (duo.user.attributes.ui_language == "uk")
				duo.ui_translations["Registered:"] = "Зареєстрований(а):";
		}

		console.log("--- /DuoProfile ---");
	}

	$(document).ready(function() {
		start();
	});
}

