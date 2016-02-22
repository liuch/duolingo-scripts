// ==UserScript==
// @name           Duo-Blog
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.3.3
// @grant          none
// @description    This script allows you to make notes into your activity stream.
// @description:ru Этот скрипт позволит вам создавать заметки в своей ленте.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_blog.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_blog.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duoblog');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	var trs = {
		"Write a note" : {
			"ru" : "Оставить запись",
			"uk" : "Залишити запис"
		},
		"Post" : {
			"ru" : "Отправить",
			"uk" : "Опублікувати"
		}
	};
	function tr(t) {
		if (duo.user !== undefined && duo.user.attributes.ui_language !== undefined && trs[t] !== undefined && trs[t][duo.user.attributes.ui_language] != undefined)
			return trs[t][duo.user.attributes.ui_language];
		return t;
	}

	function show_form() {
			var el = $("#stream-container .activity-stream");
			if (el.length) {
				if (!el.find("#stream-post").length) {
					var s = '<li class="stream-item">';
					s += '<a href="#" class="avatar avatar-medium"><span class="icon-comment-medium" /></a>';
					s += '<span class="stream-item-type default"></span><ul class="stream-item-comment-list" style="margin-top: -10px;"><li><div class="post-activity stream-item-comment-new"><div class="col-input"><textarea id="stream-post" style="" class="post textarea-white textarea-block textarea-autogrow" placeholder="' + tr('Write a note') + '" dir="auto"></textarea></div><div class="col-btn"><button id="stream-post-btn" class="btn btn-green" disabled="disabled">' + tr('Post') + '</button></div></div></li></ul></li>';
					el.prepend(s);
				}
			}
	}

	var reg_list = [ new RegExp("^/activity/([0-9]+)\\?"), new RegExp("^/translation_tiers/([0-9]+)\\?") ];

	function start(e, r, o) {
		if (!duo || !duo.user)
			return;
		if (o.url == "/diagnostics/js_error")
			return;

		var a = null;
		reg_list.forEach(function(x) {
			if (!a)
				a = x.exec(o.url);
		});
		if (a && parseInt(a[1]) == duo.user.id && document.location.pathname.substr(1) == duo.user.attributes.username)
			show_form();
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}
