// ==UserScript==
// @name           DuoDirectLinks
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.2.9
// @grant          none
// @description    This script adds the direct links for discussion comments, translation sentences, and activity stream events
// @description:ru Этот скрипт добавляет прямые ссылки на комментария в форумах, на предложения в переводах и на события в ленте
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
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	var trs = {
		"Direct link" : {
			"ru" : "Прямая ссылка",
			"uk" : "Пряме посилання"
		}
	}
	function tr(t) {
		if (duo.user !== undefined && duo.user.attributes.ui_language !== undefined && trs[t] !== undefined && trs[t][duo.user.attributes.ui_language] != undefined)
			return trs[t][duo.user.attributes.ui_language];
		return t;
	}

	function makeEventLink(j) {
		if (j["id"] !== undefined) {
			var h = $("#comment-box-" + j.id).parents(".stream-item").children(".stream-item-header");
			if (h.length && !h.find(".icon-link").length)
				h.prepend('<a class="left" style="margin-right:5px;" href="/event/' + j.id + '"><span class="icon icon-link" /></a>');
		}
	}

	function makeCommentLink(id, j) {
		var n_id = j.id;
		var el = $("#nested-comment-" + n_id).children("span").children("header");
		if (el.length && !el.find(".icon-link").length) {
			var l = "/comment/" + id + "$comment_id=" + n_id;
			el.prepend('<a style="margin-right:5px;" href="' + l + '"><span class="icon icon-link" /></a>');
		}
	}
	var processNestedComments = function(id, j) {
		if (j["comments"] !== undefined && j.comments.length) {
			for (var i in j.comments) {
				makeCommentLink(id, j.comments[i]);
				processNestedComments(id, j.comments[i]);
			}
		}
	};

	function start(e, r, o) {
		if (!duo)
			return;

		// Activity links
		var x = new RegExp("^/(activity|stream|events)/[0-9]+(\\?|/like$)");
		var a = x.exec(o.url);
		if (!a && o.url == "/post")
			a = [o.url, o.url.substr(1)];
		if (a) {
			var j = $.parseJSON(r.responseText);
			if (j) {
				if (a[1] == "events" || a[1] == "post") {
					makeEventLink(j);
				} else if (j["events"] !== undefined) {
					for (var i = 0; i < j.events.length; ++i)
						makeEventLink(j.events[i]);
				}
			}
			return;
		}

		// Translation links
		x = new RegExp("^/wiki_translation_sentence/[a-z0-9]+/[a-z0-9]+/(get_sentence|get_revisions|[a-z0-9]+/rate)");
		if (!x.exec(o.url))
			x = new RegExp("^/wiki_translations/report_translator_cheating/[0-9]+$");
		if (x.exec(o.url)) {
			x = new RegExp("^/translation/([a-z0-9]+)($|\\$)");
			var id = x.exec(document.location.pathname);
			if (id) {
				id = id[1];
				var el = $(".document-sentence-sidebar :visible").find(".report-translator-cheating-wrapper");
				if (el.length && !el.find(".icon-link").length) {
					var idx = el.parent().parent().parent().attr("id").replace("sentence-sidebar-", "");
					el.append('<a class="right" href="/translation/' + id + '$index=' + idx + '"><span class="icon icon-link" style="margin-right:5px;" />' + tr('Direct link') + '</a>');
				}
			}
			return;
		}

		// Discussion links
		x = new RegExp("^/comments/[0-9]+($|\\?|/reply|/upvote|/downvote|/love)");
		a = x.exec(o.url);
		if (a) {
			x = new RegExp("^/comment/([0-9]+)($|\\$)");
			var id = x.exec(document.location.pathname);
			if (id) {
				id = id[1];
				var j = $.parseJSON(r.responseText);
				if (j) {
					if (a[1] == "/upvote" || a[1] == "/downvote")
						makeCommentLink(id, j);
					else {
						if (a[1] == "/reply")
							makeCommentLink(id, j);
						else if (o.type == "PUT" || a[1] == "/love")
							j = {comments: [j]};
						processNestedComments(id, j);
					}
				}
			}
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}

