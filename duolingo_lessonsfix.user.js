// ==UserScript==
// @name           DuoLessonsFix
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.3
// @grant          none
// @description    This script pauses the timer between exercises in the timed practice.
// @description:ru Этот скрипт ставит таймер на паузу между заданиями в тренировке на время.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_lessonsfix.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_lessonsfix.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==


function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duolessonsfix');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {

	var orig_bind = null;
	var sess_obj  = null;
	var sess_used = false;

	var next_f = function() {
		if (sess_obj && sess_obj.next_original) {
			if (sess_obj.timer_view && sess_obj.timer_view.paused)
				sess_obj.timer_view.resume();
			sess_obj.next_original.apply(sess_obj, arguments);
		}
	};

	var hook = function() {
		var obj = arguments[1];
		if (typeof obj  == "object" && obj.timer_view) {
			var i = 0;
			if (!obj.next_original && obj.next) {
				obj.next_original = obj.next;
				obj.next = next_f;
				++i;
			}
			if (!sess_obj || !i)
				sess_obj = obj;
		}
		return orig_bind.apply(this, arguments);
	};

	var free_res = function() {
		sess_obj  = null;
		sess_used = false;
	};


	if (!orig_bind && _.bind) {
		orig_bind = _.bind;
		_.bind = hook;
	}

	function start(e, r, o) {
		if (!duo)
			return;
		if (o.url == "/diagnostics/js_error")
			return;

		if (document.location.pathname == "/practice" || document.location.pathname.substr(0, 7) == "/skill/") {
			if (sess_obj)
				sess_used = true;

			var x = new RegExp("^/session_element_solutions/(skill_)?practice/.*");
			if (x.exec(o.url)) {
				if (sess_obj && sess_obj.timer_view && !sess_obj.timer_view.paused) {
					sess_obj.timer_view.pause();
				}
			}
		} else if (sess_used)
			free_res();

	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}
