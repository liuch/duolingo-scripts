// ==UserScript==
// @name           DuoFluencyTuneup
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.1.3
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

	var menu_data = [
		/*{ val: -1, text: "Disable fluency" },*/ { val: 0 }, { val: 1 }, { val: 2 }, { val: 3 }, { val: 4 }, { val: 5 }
	];

	var fluency_split = function(f, d) {
		var factor = Math.pow(10, d);
		var res = {};
		var i = (d ? Math.round(f * 100 * factor) : Math.floor(f * 100)) / factor;
		res.left  = "" + Math.floor(i);
		res.right = i.toFixed(d).replace(/^[0-9]+/, "");
		return res;
	};

	function fluency_str(f_s) {
		var res = f_s.left;
		if (f_s.right)
			res += f_s.right;
		return res;
	}

	function update_shield() {
		var shs = $(".fluency-score-shield-silver");
		if (shs.length) {
			shs.empty();
			var d = fluency_split(fluency_score, digits);
			shs.text(d.left);
			shs.append('<span class="fluency-score-percent">%</span>');
			if (digits > 0)
				shs.append('<span class="fluency-fraction" style="font-size:50%;display:block;margin-top:0.2em;" title="' + (fluency_score * 100) + '">' + d.right + '</span>');
		}
	}

	var fluency_switch = function(d) {
		var i = d.data.val;
		if (duo && duo.setCookie) {
			digits = i;
			duo.setCookie("fluency_tuneup_digits", i);
			update_shield();
		}
	};

	function make_menu() {
		var b = $(".fluency-container").eq(0).parent().children("h2").eq(0);
		if (b.length && !b.find("#fluency-settings").length) {
			var g = $('<span id="fluency-settings" data-toggle="tooltip" title="DuoFluencyTuneup" class="icon icon-gear-small right"><ul class="dropdown-menu hidden" style="position:relative;"></ul></span>');
			b.append(g);
			var menu = g.find(".dropdown-menu");
			g.click(function(){menu.toggle();});
			menu_data.forEach(function(d) {
					var t = (d.text) ? d.text : fluency_str(fluency_split(fluency_score, d.val));
					var item = $('<li><a href="javascript:;">' + t + '</a></li>');
					item.click({val: d.val}, fluency_switch);
					menu.append(item);
				});
		}
	}

	var fix_displaying = function() {
		if (fluency_score && digits >= 0) {
			make_menu();
			if (digits > 0)
				update_shield();
		}
	};

	var fluency_f = function(fs) {
		var res = 0;
		if (digits >= 0) {
			res = Math.floor(fs*100);
			fluency_score = fs;
			setTimeout(fix_displaying, 200);
		}
		return res;
	};

	duo.formatFluencyScore = fluency_f;
}
