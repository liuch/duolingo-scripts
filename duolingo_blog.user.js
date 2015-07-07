// ==UserScript==
// @name           Duo-Blog
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.2.3
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
	function allowPostNotes() {
		if (!duo || !duo.templates || !duo.templates.events || !duo.EventsView || !duo.StreamView)
			return;

		console.log("--- *Duo-Blog ---");
		// Here is replacing the events template
		var l = duo.templates.events.length;
		duo.templates.events = duo.templates.events.replace(new RegExp("^(.*){{\\^current_user_profile}}(.*){{/current_user_profile}}(.*)$",'g'), "$1{{^deny_note}}$2{{/deny_note}}$3");
		if (l == duo.templates.events.length) {
			console.log("--- !Duo-Blog ---");
			return;
		}
		duo.templates.events = duo.templates.events.replace("{{#_i}}Write to {{username}}{{/_i}}", "{{^current_user_profile}}{{#_i}}Write to {{username}}{{/_i}}{{/current_user_profile}}{{#current_user_profile}}{{#_i}}Write a note{{/_i}}{{/current_user_profile}}");

		// EventsView inject
		duo.EventsView = (function(v){return v.extend({
			template  : duo.templates.events
		});})(duo.EventsView);

		// StreamView inject
		var newStreamUpdActFunc = function() {
			if (duo.user)
				duo.user.set({deny_note:!0},{silent:!0});
			if (this.oldUpdateActivity)
				this.oldUpdateActivity();
		};
		duo.StreamView = (function(v){return v.extend({
			oldUpdateActivity : v.prototype.updateActivity,
			updateActivity    : newStreamUpdActFunc
		});})(duo.StreamView);

		// *** Direct event links
		var ta = {"stream-post":"StreamPostEventView", "comment-event":"CommentEventView", "level-event":"LevelEventView", "follow-event":"FollowEventView",
							"welcome-event":"WelcomeEventView", "lesson-event":"LessonEventView", "translation-event":"TranslationEventView", "test-event":"TestEventView",
							"unlock-event":"UnlockEventView", "translator-promotion-event":"TranslatorPromotionEventView"};
		var lk = '<a class="left" style="margin-right:5px;" href="/event/{{id}}"><span class="icon icon-link" /></a>';
		var fail_tmpl = function(n) {
			console.log("--- !Duo-Blog: " + n);
		};
		var repl_tmpl = function(tn) {
			var s = duo.templates[tn].replace(new RegExp('^(.*<header class="stream-item-header">)({{#own}})?<span class="left">(.*)$','g'), '$1' + lk + '$2<span>$3');
			if (s.length != duo.templates[tn].length) {
				duo.templates[tn] = s;
			} else {
				fail_tmpl(tn);
			}
			return s;
		};
		for (n in ta) {
			if (duo[ta[n]] !== undefined && duo.templates[n] !== undefined)
			{
				duo[ta[n]] = (function(v){return v.extend({
					template : repl_tmpl(n)
				});})(duo[ta[n]]);
			} else {
				fail_tmpl(ta[n]);
			}
		}

		// *** UI translations
		if (duo.ui_translations["Write a note"] === undefined) {
			if (duo.user.attributes.ui_language == "ru")
				duo.ui_translations["Write a note"] = "Оставить запись";
			else if (duo.user.attributes.ui_language == "uk")
				duo.ui_translations["Write a note"] = "Залишити запис";
		}

		if ($("#stream-nav").hasClass("active") && duo.streamRouter)
			duo.streamRouter.stream(); // !!! dirty hack !!!
		console.log("--- /Duo-Blog ---");
	}
	$(document).ready(function() {
		allowPostNotes();
	});
}

