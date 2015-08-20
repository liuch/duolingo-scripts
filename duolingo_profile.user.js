// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.2.3
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
	var trs = {
		"Registered:" : {
			"ru" : "Зарегистрирован(а):",
			"uk" : "Зареєстрований(а):"
		}
	}
	function tr(t) {
		if (duo.user !== undefined && duo.user.attributes.ui_language !== undefined && trs[t] !== undefined && trs[t][duo.user.attributes.ui_language] != undefined)
			return trs[t][duo.user.attributes.ui_language];
		return t;
	}

	var attrs = { id: 0, created: "" };
	var u_reg = new RegExp("^/users/(.+)\\?");
	var p_reg = new RegExp("^/([^$]+)($|\\$)");
	var t_reg = new RegExp("^/translation_tiers/([0-9]+)\\?");

	function start(e, r, o) {
		if (!duo || !duo.user)
			return;
		if (o.url == "/diagnostics/js_error")
			return;

		var n = u_reg.exec(o.url);
		if (n) {
			var s = p_reg.exec(document.location.pathname);
			if (!s || s[1] != n[1])
				return;
			var j = $.parseJSON(r.responseText);
			attrs.id       = j.id || 0;
			attrs.created  = j.created || "n/a";
		} else {
			n = t_reg.exec(o.url);
			if (!n)
				return;
			if (n[1] != attrs.id) {
				if (n[1] != duo.user.id)
					return;
				attrs.id       = duo.user.id;
				attrs.created  = duo.user.attributes.created || "n/a";
			}
		}

		var el = $(".profile-header").find(".profile-header-username");
		var t;
		if (el.length) {
			if (attrs.id) {
				t = tr('Registered:') + ' ' + $.trim(attrs.created);
				if ($("#created-info").length)
					$("#created-info").text(t);
				else
					$('<p id="created-info" class="gray" />').text(t).insertAfter(el);
			}
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}

