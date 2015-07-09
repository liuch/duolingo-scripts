// ==UserScript==
// @name           DuoDirectLinks
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.1
// @grant          none
// @description    This script adds the direct links for discussion comments and translation sentences
// @description:ru Этот скрипт добавляет прямые ссылки на комментария в форумах и предложения в переводах
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
	function start() {
		if (!duo || !duo.templates || duo.templates["wiki-document-sentence-sidebar"] === undefined || !duo.WikiDocumentSentenceSidebarView)
			return;

		console.log("--- *DuoLinks ---");

		// Translation link
		var lk = '<a class="right" href="/translation/{{translation_id}}$index={{index}}"><span class="icon icon-link" style="margin-right:5px;" />{{#_i}}Direct link{{/_i}}</a>';
		duo.templates["wiki-document-sentence-sidebar"] = duo.templates["wiki-document-sentence-sidebar"].replace(
			'</a></span>{{^latest_translation_from_self}}{{^reported_cheating}}<a class="report-translator-cheating left',
			'</a></span>' + lk + '{{^latest_translation_from_self}}{{^reported_cheating}}<a class="report-translator-cheating left');

		duo.WikiDocumentSentenceSidebarView = (function(v){return v.extend({
			template : duo.templates["wiki-document-sentence-sidebar"]
		});})(duo.WikiDocumentSentenceSidebarView);

		// *** UI translations
		if (duo.ui_translations["Direct link"] === undefined) {
			if (duo.user.attributes.ui_language == "ru")
				duo.ui_translations["Direct link"] = "Прямая ссылка";
			else if (duo.user.attributes.ui_language == "uk")
				duo.ui_translations["Direct link"] = "Пряме посилання";
		}

		console.log("--- /DuoLinks ---");
	}

	$(document).ready(function() {
		start();
	});
}

