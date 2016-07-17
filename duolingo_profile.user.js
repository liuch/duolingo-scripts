// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.3.1
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
		},
		"Storage" : {
			"ru" : "Склад"
		}
	}
	function tr(t) {
		if (duo.user !== undefined && duo.user.attributes.ui_language !== undefined && trs[t] !== undefined && trs[t][duo.user.attributes.ui_language] != undefined)
			return trs[t][duo.user.attributes.ui_language];
		return t;
	}

	var attrs = { id: 0, created: "", freeze: "", lingots: 0, st_today: false };
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
			attrs.freeze   = j.inventory && j.inventory.streak_freeze || "";
			attrs.lingots  = j.rupees || 0;
			attrs.st_today = j.streak_extended_today || false;
		} else {
			n = t_reg.exec(o.url);
			if (!n)
				return;
			if (n[1] != attrs.id) {
				if (n[1] != duo.user.id)
					return;
				attrs.id       = duo.user.id;
				attrs.created  = duo.user.attributes.created || "n/a";
				attrs.freeze   = duo.user.attributes.inventory && duo.user.attributes.inventory.streak_freeze || "";
				attrs.lingots  = duo.user.attributes.rupees || 0;
				attrs.st_today = duo.user.attributes.streak_extended_today || false;
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
		el = $(".box-achievements > .sidebar-stats").eq(0);
		if (el.length) {
			t = el.find("li > .icon-checkmark-small").eq(0);
			if (attrs.st_today) {
				if (!t.length) {
					t = $('<span class="icon icon-checkmark-small" style="margin:12px 0 0 -15px;"></span>');
					el.find("li > .icon-streak-small-normal").eq(0).after(t);
				}
			} else if (t.length) {
				t.remove();
			}
			if (attrs.freeze.length && !el.find("#freeze-status").length) {
				t = $('<span id="freeze-status" style="display:block;"><span class="store-icon" style="margin-right:5px;width:18px;height:25px;vertical-align:middle;background-position:-80px -6px;background-size:180px auto;" /></span>');
				t.append($('<span />').text((new Date(attrs.freeze.replace(" ", "T"))).toLocaleDateString()));
				el.find("li > .icon-streak-small-normal").eq(0).parent().append(t);
			}
			if (!el.find("#storage-block").length) {
				t = $('<ul id="storage-block" class="sidebar-stats"><li><h3>' + tr("Storage") + '</h3><span class="icon icon-lingot-micro" /></li></ul>');
				t.find("li > .icon-lingot-micro").eq(0).parent().append($('<span style="font-weight:bold;color:#3c3c3c;" />').text(attrs.lingots));
				el.after(t);
			}
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}

