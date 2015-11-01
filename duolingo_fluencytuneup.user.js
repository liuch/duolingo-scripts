// ==UserScript==
// @name           DuoFluencyTuneup
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.0.1
// @grant          none
// @description    Fluency score tune up
// @description:ru Настройка отображения fluency score
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_fluencytuneup.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_fluencytuneup.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duofluencytuneup');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	var fluency_score = null;
	var digits = 2;
	if (duo && duo.getCookie) {
		digits = duo.getCookie().fluency_tuneup_digits;
		if (typeof digits == "string" && digits.match("^-?[0-9]+$")) {
			digits = parseInt(digits);
			if (digits > 5)
				digits = 5;
		} else
			digits = 2;
	}

	var factor = digits > 0 ? Math.pow(10, digits) : 0;

	var fix_displaying = function() {
		if (!fluency_score || !factor)
			return;
		var shs = $(".fluency-score-shield-silver");
		if (shs.length) {
			shs.empty();
			fs = Math.round(fluency_score * 100 * factor);
			shs.text(Math.floor(fs / factor));
			shs.append('<span class="fluency-score-percent">%</span>');
			fs = fs - Math.floor(fs / factor) * factor;
			shs.append('<span class="fluency-fraction" style="font-size:50%;display:block;margin-top:0.2em;" title="' + (fluency_score * 100) + '">.' + fs + '</span>');
		}
	};

	var fluency_f = function(fs) {
		var res = 0;
		if (digits >= 0) {
			res = Math.floor(fs*100);
			if (digits) {
				fluency_score = fs;
				setTimeout(fix_displaying, 200);
			}
		}
		return res;
	};

	duo.formatFluencyScore = fluency_f;
}
