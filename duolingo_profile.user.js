// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        1.2.3
// @grant          none
// @description    This script displays additional information in the users' profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профиле пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @run-at         document-start
// ==/UserScript==

// @license        MIT License

function inject(f) { //Inject the script into the document
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duo-profile');
	script.textContent = '(' + f.toString() + ')()';
	document.head.appendChild(script);
}

(function start() {
	var tries_left = 10;
	var try_inject = function() { // Workaround to avoid an error "TypeError: document.head is null"
		if (document.head && document.body) {
			inject(f);
			tries_left = 0;
		}
		else {
			tries_left -= 1;
			setTimeout(try_inject, 100);
		}
	};
	try_inject();
})();

function f() {
	var observe = {
		observer: null,
		root_el: null,
		p_func: null,
		active: 0,

		set: function(func) {
			this.root_el = document.getElementsByTagName("body")[0];
			if (this.root_el) {
				this.active = 0;
				this.p_func = func;
				this.observer = new MutationObserver(function(mutations) {
					if (observe.p_func) {
						observe.stop();
						observe.p_func()
						observe.start();
					}
				});
			}
		},

		start: function() {
			if (this.active === 0)
				this.observer.observe(this.root_el, { childList: true, subtree: true });
			this.active++;
		},

		stop: function() {
			this.active--;
			if (this.active === 0)
				this.observer.disconnect();
		}
	};

	var p_reg = new RegExp("^/(profile/)?([a-zA-Z0-9._-]+)$");
	var u_dat = {};
	var ui_version = 0;
	var containers = [];

	var style1 = "width:26px;height:30px;background-size:35px;background-position:50%;background-repeat:no-repeat;float:none;display:inline-block;vertical-align:middle;";
	var style2 = "vertical-align:middle;margin-left:0.5em;";
	var style3 = "width:26px;height:30px;background-size:30px;background-position:100%;background-repeat:no-repeat;float:none;display:inline-block;vertical-align:middle;";

	var trs = {
		"Registered:" : {
			"ru" : "Зарегистрирован(а):",
			"uk" : "Зареєстрований(а):"
		},
		"Streak" : {
			"ru" : "Ударный режим"
		},
		"Storage" : {
			"ru" : "Склад"
		},
		"Links:" : {
			"ru" : "Ссылки:"
		},
		"Permanent" : {
			"ru" : "Постоянная"
		},
		"Level" : {
			"ru" : "уровень"
		},
		"Crowns" : {
			"ru" : "Короны"
		},
		"Next level" : {
			"ru" : "Следующий уровень"
		},
		"From language" : {
			"ru" : "Базовый язык"
		}
	};

	function tr(t) {
		if (typeof(duo) == "object" && typeof(duo.uiLanguage) == "string" && trs[t] && trs[t][duo.uiLanguage])
			return trs[t][duo.uiLanguage];
		return t;
	}

	var css_rules = {
		".dp-tooltip": "position:relative;",
		".dp-tooltip-content": "visibility:hidden; position:absolute; padding:5px; top:105%; left:10%; width:80%; border-radius:14px; border:2px solid #888; color:#000; background:#fbefac; z-index:1; opacity: 0; transition:opacity 1s;",
		".dp-tooltip:hover .dp-tooltip-content:not(:hover)": "visibility:visible; opacity:1;",
		".dp-tooltip-content::after": 'content:""; position:absolute; top:-4px; bottom:auto; right:auto; left:53px; border-width:0 4px 4px; border-style:solid; border-color:#fbefac transparent; display:block; width:0;',
		".dp-tooltip-content::before": 'content:""; position:absolute; top:-7px; bottom:auto; right:auto; left:51px; border-width:0 6px 6px; border-style:solid; border-color:#888 transparent; display:block; width:0;'
	};

	function create_style_sheet() {
		var style = document.createElement("style");
		style.appendChild(document.createTextNode("")); // Webkit hack
		document.head.appendChild(style);
		return style.sheet;
	}

	function add_css_rule(sheet, selector, rules) {
		if ("addRule" in sheet) {
			sheet.addRule(selector, rules);
		}
		else if ("insertRule" in sheet) {
			sheet.insertRule(selector + "{" + rules + "}");
		}
	}

	// ----- Widget -----

	function Widget() {
		this._value = null;
		this._element = null;
		this.on_change = null;
	}

	Widget.is_equal = function(a, b) {
		if (a && b && typeof(a) === "object" && typeof(b) === "object") {
			for (var prop in a) {
				if (!Widget.is_equal(a[prop], b[prop])) {
					return false;
				}
			}
			return true;
		}
		return (a === b);
	}

	Widget.prototype.set_value = function(val) {
		if (!Widget.is_equal(val, this._value)) {
			this._value = val && (typeof(val) == "object") && Object.assign({}, val) || val;
			if (this._element)
				this._update_element();
			if (typeof(this.on_change) == "function")
				this.on_change(this);
		}
	}

	Widget.prototype.reset = function() {
		this.set_value(null);
	}

	Widget.prototype.is_null = function() {
		return this._value === null;
	}

	Widget.prototype.element = function() {
		if (!this._element) {
			this._create_element();
			this._update_element();
		}
		return this._element;
	}

	// ----- CreatedWidget -----

	function CreatedWidget() {
		Widget.apply(this);
		this.tag = "created";
	}

	CreatedWidget.prototype = Object.create(Widget.prototype);
	CreatedWidget.prototype.constructor = CreatedWidget;

	CreatedWidget.prototype._create_element = function() {
		this._element = document.createElement("p");
		this._element.setAttribute("id", "dp-created-info");
		this._element.setAttribute("style", "color:gray;");
	}

	CreatedWidget.prototype._update_element = function() {
		var str = tr("Registered:") + " " + (this._value || "-");
		if (this._element.childNodes.length) {
			this._element.childNodes[0].nodeValue = str;
		}
		else {
			this._element.appendChild(document.createTextNode(str));
		}
	}

	// ----- LinksWidget -----

	function LinksWidget() {
		Widget.apply(this);
		this.tag = "user";
	}

	LinksWidget.prototype = Object.create(Widget.prototype);
	LinksWidget.prototype.constructor = LinksWidget;

	LinksWidget.prototype._gen_link_element = function(href, ancor) {
		var el = document.createElement("a");
		el.setAttribute("style", "color:gray;margin-left:1em;");
		el.setAttribute("href", href);
		el.appendChild(document.createTextNode("\u{1F517} " + ancor));
		return el;
	}

	LinksWidget.prototype._create_element = function() {
		this._element = document.createElement("div");
		this._element.setAttribute("id", "dp-links");
		this._element.setAttribute("style", "margin-top:1em;");
		var el = document.createElement("span");
		el.setAttribute("style", "color:gray;");
		el.appendChild(document.createTextNode(tr("Links:")));
		this._element.appendChild(el);
	}

	LinksWidget.prototype._update_element = function() {
		var el = this._element.children[0];
		while (el.children.length > 0)
			el.removeChild(el.children[0]);
		if (this._value && (this._value.id || this._value.name.length)) {
			if (this._value.name.length)
				el.appendChild(this._gen_link_element("https://duome.eu/" + this._value.name, "Duome.eu"));
			if (this._value.id)
				el.appendChild(this._gen_link_element("https://www.duolingo.com/users/" + this._value.id + "/redirect", tr("Permanent")));
		}
		else {
			var el2 = document.createElement("span");
			el2.setAttribute("style", "color:gray;margin-left:1em;");
			el2.appendChild(document.createTextNode("-"));
			el.appendChild(el2);
		}
	}

	// ----- StreakWidget -----

	function StreakWidget() {
		Widget.apply(this);
		this.tag = "streak";
	}

	StreakWidget.prototype = Object.create(Widget.prototype);
	StreakWidget.prototype.constructor = StreakWidget;

	StreakWidget.prototype._create_element = function() {
		this._element = document.createElement("div");
		var el = document.createElement("span");
		el.setAttribute("class", "_2D777");
		el.setAttribute("style", style3);
		this._element.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("style", style2);
		el.setAttribute("id", "dp_streak");
		var el2 = document.createElement("strong");
		el2.appendChild(document.createTextNode("?"));
		el.appendChild(el2);
		el.appendChild(document.createTextNode(" " + tr("days")));
		this._element.appendChild(el);
	}

	StreakWidget.prototype._update_element = function() {
		var num = "?"
		var class_str = "_2D777";
		if (this._value) {
			if (this._value.today)
				class_str = "_26StQ";
			if (typeof(this._value.number) == "number")
				num = this._value.number
		}
		this._element.children[0].setAttribute("class", class_str);
		this._element.children[1].children[0].childNodes[0].nodeValue = num;
	}

	// ----- FreezeWidget -----

	function FreezeWidget() {
		Widget.apply(this);
		this.tag = "freeze";
	}

	FreezeWidget.prototype = Object.create(Widget.prototype);
	FreezeWidget.prototype.constructor = FreezeWidget;

	FreezeWidget.prototype.is_null = function() {
		return (!this._value || this._value.length == 0);
	}

	FreezeWidget.prototype._create_element = function() {
		this._element = document.createElement("div");
		var el = document.createElement("span");
		el.setAttribute("class", "wwWR9");
		el.setAttribute("style", style1);
		this._element.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("style", style2);
		this._element.appendChild(el);
	}

	FreezeWidget.prototype._update_element = function() {
		var freeze_str = (this._value && this._value.length > 0) && (new Date(this._value.replace(" ", "T"))).toLocaleDateString() || "?";
		if (this._element.children[1].childNodes.length > 0)
			this._element.children[1].childNodes[0].nodeValue = freeze_str;
		else
			this._element.children[1].appendChild(document.createTextNode(freeze_str));
	}

	// ----- LingotsWidget -----

	function LingotsWidget() {
		Widget.apply(this);
		this.tag = "lingots";
	}

	LingotsWidget.prototype = Object.create(Widget.prototype);
	LingotsWidget.prototype.constructor = LingotsWidget;

	LingotsWidget.prototype._create_element = function() {
		this._element = document.createElement("div");
		var el = document.createElement("span");
		el.setAttribute("class", "_3vtRi _1QdrW _1rEAJ RFe0A");
		el.setAttribute("style", "margin:0;");
		this._element.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("style", style2);
		var el2 = document.createElement("strong");
		el2.appendChild(document.createTextNode("?"));
		el.appendChild(el2);
		this._element.appendChild(el);
	}

	LingotsWidget.prototype._update_element = function() {
		var lingots = this._value === null && "?" || this._value;
		this._element.children[1].children[0].childNodes[0].nodeValue = lingots;
	}

	// ----- CourseWidget -----

	function CourseWidget(tag, element) {
		Widget.apply(this);
		this.tag = tag;
		this._element = element;
	}

	CourseWidget.prototype = Object.create(Widget.prototype);
	CourseWidget.prototype.constructor = CourseWidget;

	CourseWidget.title_element = function(el) {
		return el.querySelector("div:nth-child(2)>div");
	}

	CourseWidget.element_language = function(el) {
		var e = CourseWidget.title_element(el);
		if (e && e.firstChild) {
			return e.firstChild.nodeValue;
		}
	}

	CourseWidget.element_xp = function(el) {
		var ex_el = el.querySelector("div:nth-child(2)>div:nth-child(2)");
		if (ex_el && ex_el.lastChild) {
			var xp_m = ex_el.lastChild.nodeValue.match(/(\d+)/);
			if (xp_m) {
				return Number(xp_m[1]);
			}
		}
	}

	CourseWidget.get_xp_level = function(xp) {
		var xp_level_cutoffs = [
			60, 120, 200, 300, 450, 750, 1125, 1650, 2250, 3e3, 3900, 4900,
			6e3, 7500, 9e3, 10500, 12e3, 13500, 15e3, 17e3, 19e3, 22500, 26e3, 3e4
		];
		var level = xp_level_cutoffs.length - 1;
		while (xp < xp_level_cutoffs[level]) {
			level = level - 5;
			if (level < 0) {
				break;
			}
		}
		while (level < xp_level_cutoffs.length) {
			if (xp < xp_level_cutoffs[level]) {
				break;
			}
			level += 1;
		}
		var nl = xp_level_cutoffs[level] || 0;
		if (nl > 0) {
			nl -= xp;
		}
		return { value: level + 1, next_level: nl };
	}

	CourseWidget.prototype._update_element = function() {
		var t_el = CourseWidget.title_element(this._element);
		if (this._value) {
			this._level = CourseWidget.get_xp_level(this._value[0].xp);
			if (t_el && t_el.childNodes.length === 1) {
				t_el.appendChild(document.createTextNode(" - " + tr("Level") + " " + this._level.value));
			}
			if (this._value[0].current) {
				this._element.setAttribute("style", "background-color:linen;");
			}
			else {
				this._element.removeAttribute("style");
			}
			var tooltip = this._make_tooltip_element();
			this._element.appendChild(tooltip);
			this._element.classList.add("dp-tooltip");
		}
		else {
			if (t_el) {
				while (t_el.childNodes.length > 1) {
					t_el.removeChild(t_el.lastChild);
				}
			}
			this._element.removeAttribute("style");
			this._remove_tooltip_element();
		}
	}

	CourseWidget.prototype._make_tooltip_element = function() {
		var tte = document.createElement("div");
		tte.setAttribute("class", "dp-tooltip-content");
		tte.appendChild(this._make_tooltip_string(tr("Crowns"), this._value[0].crowns));
		tte.appendChild(this._make_tooltip_string(tr("Next level"), this._level.next_level + " XP"));
		tte.appendChild(this._make_tooltip_string(tr("From language"), this._value[0].from));
		return tte;
	}

	CourseWidget.prototype._remove_tooltip_element = function() {
		var tte = this._element.querySelector(".dp-tooltip-content");
		if (tte) {
			tte.remove();
		}
	}

	CourseWidget.prototype._make_tooltip_string = function(text, value) {
		var te = document.createElement("span");
		te.appendChild(document.createTextNode(text + ": "));
		var st = document.createElement("strong");
		st.appendChild(document.createTextNode(value));
		te.setAttribute("style", "display:block;");
		te.appendChild(st);
		return te;
	}

	// ----- BlockingWidget -----

	function BlockingWidget() {
		Widget.apply(this);
		this.tag = "block";
	}

	BlockingWidget.prototype = Object.create(Widget.prototype);
	BlockingWidget.prototype.constructor = BlockingWidget;

	BlockingWidget.prototype._create_element = function() {
		this._element = document.createElement("ul");
		this._element.setAttribute("style", "border-top:2px solid #dadada;display:table;width:100%;margin-top:30px;");
		this._element.appendChild(this._create_li("Blocking"));
		this._element.appendChild(this._create_li("Blockers"));
	}

	BlockingWidget.prototype._update_element = function() {
		if (this._value) {
			this._set_li_value(0, this._value.blocking);
			this._set_li_value(1, this._value.blockers);
		}
		else {
			this._set_li_value(0, null);
			this._set_li_value(1, null);
		}
	}

	BlockingWidget.prototype._create_li = function(text) {
		var li_el = document.createElement("li");
		li_el.setAttribute("style", "display:table-cell;padding:12px 10px 0 0;");
		var sp_el = document.createElement("span");
		sp_el.appendChild(document.createTextNode(tr(text) + ": "));
		li_el.appendChild(sp_el);
		sp_el = document.createElement("span");
		sp_el.appendChild(document.createTextNode("?"));
		li_el.appendChild(sp_el);
		return li_el;
	}

	BlockingWidget.prototype._set_li_value = function(idx, val) {
		var new_val;
		if (val === null)
			new_val = "?";
		else
			new_val = (val === -1) && "n/a" || val;
		this._element.children[idx].children[1].childNodes[0].nodeValue = new_val;
	}

	// ----- AchievementItem -----

	function AchievementItem(id) {
		this._id = id;
		this._tier = 0;
		this._element = null;
	}

	AchievementItem._picture_class = {
		streak:      "_2wzQU",
		completion:  "_16Aal",
		social:      "_23nCr",
		xp:          "_3dC1N",
		gold_skills: "UN9bj",
		spending:    "_3bUu2",
		time:        "_2mfXg",
		perfect:     "_1D0uS"
	};

	AchievementItem._star_num_classes = [
		[ "_35-xP dw2F4", "_1vlZ7 _35-xP dw2F4" ],
		[ "ZKmUJ dw2F4", "_3OP3B ZKmUJ dw2F4" ],
		[ "tD042 dw2F4", "CIzSZ tD042 dw2F4" ]
	];

	AchievementItem._star_on_classes = [ "_2cOts", "_28huv", "_3UINz" ];

	AchievementItem.is_correct = function(id) {
		return AchievementItem._picture_class[id] !== undefined;
	}

	AchievementItem.prototype.set_value = function(val) {
		if (this._tier !== val) {
			this._tier = val;
			if (this._element)
				this._update_element();
		}
	}

	AchievementItem.prototype.element = function() {
		if (!this._element) {
			this._create_element();
			this._update_element();
		}
		return this._element;
	}

	AchievementItem.prototype._create_element = function() {
		this._element = document.createElement("div");
		this._element.setAttribute("class", "VHE7v");
		this._element.setAttribute("style", "marging-bottom:10px;");
		var el = document.createElement("div");
		el.setAttribute("class", "_3xN15 " + AchievementItem._picture_class[this._id]);
		this._element.appendChild(el);
		this._update_element();
	}

	AchievementItem.prototype._update_element = function() {
		var el = this._element.children[0];
		if (el.children.length == 0) {
			this._add_stars(el);
		}
		for (var i = 0; i < el.children.length; ++i) {
			this._turn_star(el.children[i], i, this._tier > i);
		}
	}

	AchievementItem.prototype._add_stars = function(par) {
		for (var i = 0; i < 3; ++i) {
			par.appendChild(this._create_star_element(i));
		}
	}

	AchievementItem.prototype._create_star_element = function(num) {
		var main_el = document.createElement("div");
		var el = document.createElement("div");
		el.setAttribute("class", AchievementItem._star_num_classes[num][0]);
		main_el.appendChild(el);
		el = document.createElement("div");
		el.setAttribute("class", AchievementItem._star_num_classes[num][1]);
		main_el.appendChild(el);
		return main_el;
	}

	AchievementItem.prototype._turn_star = function(el, num, on) {
		var on_str = on ? AchievementItem._star_on_classes[num] + " " : "";
		for (var i = 0; i < el.children.length; ++i) {
			el.children[i].setAttribute("class", on_str + AchievementItem._star_num_classes[num][i]);
		}
	}

	// ----- AchievementsWidget -----

	function AchievementsWidget() {
		Widget.apply(this);
		this.tag = "achievements";
		this._items = {};
	}

	AchievementsWidget.prototype = Object.create(Widget.prototype);
	AchievementsWidget.prototype.constructor = AchievementsWidget;

	AchievementsWidget.prototype._create_element = function() {
		this._element = document.createElement("div");
		this._element.setAttribute("class", "QZc9N");
		this._update_element();
	}

	AchievementsWidget.prototype._update_element = function() {
		if (this._value) {
			for (var i = 0; ; ++i) {
				var val = this._value[i];
				if (val === undefined)
					break;
				if (AchievementItem.is_correct(val.name)) {
					var item = this._items[val.name];
					if (!item) {
						item = new AchievementItem(val.name);
						this._items[val.name] = item;
					}
					item.set_value(val.tier);
					if (!this._element.contains(item.element()))
						this._element.appendChild(item.element());
				}
//				else
//					console.warn("DuoProfile: Unknown achievement '" + val.name + "'");
			}
		}
		else {
			for (var id in this._items)
				this._items[id].set_value(0);
		}
	}

	// ----------

	// ----- WidgetContainer -----

	function WidgetContainer() {
		this._widgets = [];
	}

	WidgetContainer.prototype.set_data = function(d) {
		this._widgets.forEach(function(wid) {
			var v = d[wid.tag];
			if (v !== undefined)
				wid.set_value(v);
			else
				wid.reset();
		});
		this._update();
	}

	WidgetContainer.prototype.reset = function() {
		this._widgets.forEach(function(wid) {
			wid.reset();
		});
		this._update();
	}

	// ----- TopContainer -----

	function TopContainer() {
		WidgetContainer.apply(this);
		this._widgets.push(new CreatedWidget());
		this._widgets.push(new LinksWidget());
	}

	TopContainer.prototype = Object.create(WidgetContainer.prototype);
	TopContainer.prototype.constructor = TopContainer;

	TopContainer.prototype._update = function() {
		var el = document.querySelector("h1[data-test='profile-username']");
		if (el) {
			if (!document.getElementById("dp-created-info")) {
				el.parentNode.insertBefore(this._widgets[0].element(), el.nextSibling);
			}
			if (!document.getElementById("dp-links")) {
				el.parentNode.appendChild(this._widgets[1].element());
			}
		}
	}

	// ----- RightContainer -----

	function RightContainer() {
		WidgetContainer.apply(this);
		this._version = -1;

		this._widgets.push(new StreakWidget());

		var freeze = new FreezeWidget();
		freeze.on_change = function(wid) {
			var el;
			if (wid.is_null()) {
				el = wid.element();
				if (el.parentElement)
					el.parentElement.removeChild(el);
			}
			else {
				el = document.getElementById("dp_streak");
				if (el) {
					var next = el.nextSibling;
					if (next)
						el.parentElement.insertBefore(wid.element(), next);
					else
						el.parentElement.appendChild(wid.element());
				}
			}
		};
		this._widgets.push(freeze);

		this._widgets.push(new LingotsWidget());
	}

	RightContainer.prototype = Object.create(WidgetContainer.prototype);
	RightContainer.prototype.constructor = RightContainer;

	RightContainer.prototype._update = function() {
		var el;
		if (!this._element || this._version != ui_version) {
			this._version = ui_version;
			this._element = null;
			if (ui_version > 0)
				this._create_element();
		}

		if (this._element && !document.body.contains(this._element)) {
			if (ui_version == 2) {
				el = document.querySelector("._2_lzu>.a5SW0>h2");
				if (el) {
					el.parentNode.insertBefore(this._element, el);
				}
			}
			else if (ui_version == 3) {
				el = document.querySelector("#root>div>div.LFfrA._3MLiB>div>div._2_lzu");
				if (el) {
					el.insertBefore(this._element, el.children[0]);
				}
			}
		}
	}

	RightContainer.prototype._create_element = function() {
		this._element = document.createElement("div");
		if (ui_version == 3) {
			this._element.setAttribute("class", "a5SW0");
		}

		var el = document.createElement("h2");
		el.setAttribute("style", "margin-bottom:10px;");
		el.appendChild(document.createTextNode(tr("Streak")));
		this._element.appendChild(el);
		this._element.appendChild(this._widgets[0].element());
		if (!this._widgets[1].is_null())
			this._element.appendChild(this._widgets[1].element());

		this._append_spacer();

		el = document.createElement("h2");
		el.setAttribute("style", "margin-bottom:10px;");
		el.appendChild(document.createTextNode(tr("Storage")));
		this._element.appendChild(el);
		this._element.appendChild(this._widgets[2].element());

		if (ui_version == 2)
			this._append_spacer();
	}

	RightContainer.prototype._append_spacer = function() {
		var el = document.createElement("div");
		el.setAttribute("style", "height:15px;");
		this._element.appendChild(el);
	}

	// ----- CoursesContainer -----

	function CoursesContainer() {
		this._courses = null;
		WidgetContainer.apply(this);
	}

	CoursesContainer.prototype = Object.create(WidgetContainer.prototype);
	CoursesContainer.prototype.constructor = CoursesContainer;

	CoursesContainer.prototype.set_data = function(d) {
		this._courses = {};
		this._xp_map = {};
		this._tl_map = {};
		if (d.courses) {
			// Fill data
			for (var i = 0; i < d.courses.list.length; ++i) {
				var c = d.courses.list[i];
				var l = {
					xp: c.xp,
					id: c.id,
					title: c.title,
					crowns: c.crowns,
					from: c.fromLanguage,
					target: c.learningLanguage
				};
				if (l.id === d.courses.id) {
					l.current = true;
				}
				this._xp_map[l.xp] = (this._xp_map[l.xp] || 0) + 1;
				if (!this._courses[l.target]) {
					this._courses[l.target] = [];
					this._tl_map[l.title] = l.target;
				}
				this._courses[l.target].push(l);
			}
			// Sort data
			for (var lg in this._courses) {
				this._courses[lg].sort(function(a, b) {
					return b.xp - a.xp;
				});
			}
			// --
			this._courses.count = d.courses.list.length;
		}
		this._update();
	}

	CoursesContainer.prototype.reset = function() {
		this._courses = {};
		this._update_widgets();
		this._widgets = null;
	}

	CoursesContainer.prototype._update = function() {
		if (!this._widgets && this._courses && this._courses.count > 0) {
			this._make_widgets();
		}
		this._update_widgets();
	}

	CoursesContainer.prototype._make_widgets = function() {
		this._widgets = [];
		var ul = document.querySelector("div._2_lzu>div.a5SW0>div>ul._3XOcR._3EfBd._3jZBz");
		if (ul) {
			ul.querySelectorAll("li").forEach(function(el) {
				var wid = null;
				for (var i = 1, lg = CourseWidget.element_language(el); lg && i <= 2; ++i) {
					if (this._courses[lg]) {
						wid = new CourseWidget(lg, el);
						break;
					}
					lg = this._tl_map[lg];
				}
				if (!wid) {
					var xp = CourseWidget.element_xp(el);
					if (this._xp_map[xp] === 1) {
						for (lg in this._courses) {
							if (xp === this._courses[lg][0].xp) {
								wid = new CourseWidget(lg, el);
								break;
							}
						}
					}
				}
				if (wid) {
					this._widgets.push(wid);
				}
			}, this);
			ul.setAttribute("style", "overflow:auto; min-height:200px;");
		}
	}

	CoursesContainer.prototype._update_widgets = function() {
		if (this._widgets) {
			this._widgets.forEach(function(wid) {
				var v = this._courses[wid.tag];
				if (v !== undefined) {
					wid.set_value(v);
				}
				else {
					wid.reset();
				}
			}, this);
		}
	}

	// ----- BlockingContainer -----

	function BlockingContainer() {
		WidgetContainer.apply(this);
		this._widgets.push(new BlockingWidget());
	}

	BlockingContainer.prototype = Object.create(WidgetContainer.prototype);
	BlockingContainer.prototype.constructor = BlockingContainer;

	BlockingContainer.prototype._update = function() {
		var el = document.querySelector("div.LFfrA._3MLiB div div._2_lzu div.a5SW0 ul._1JZEb._1AM95");
		if (el) {
			if (!this._element)
				this._create_element();
			if (!document.body.contains(this._element))
				el.parentElement.appendChild(this._element);
		}
	}

	BlockingContainer.prototype._create_element = function() {
		this._element = document.createElement("div");
		this._element.appendChild(this._widgets[0].element());
	}

	// ----- AchievementsContainer -----

	function AchievementsContainer() {
		WidgetContainer.apply(this);
		this._widgets.push(new AchievementsWidget());
	}

	AchievementsContainer.prototype = Object.create(WidgetContainer.prototype);
	AchievementsContainer.prototype.constructor = AchievementsContainer;

	AchievementsContainer.prototype._update = function() {
		if ((ui_version == 2 && !document.querySelector("div>div._2hEQd._1E3L7>div._2RO1n>div>div._3K6_E>h2"))
				|| (ui_version == 3 && !document.querySelector("div>div._2hEQd._1E3L7>div._2RO1n>div._3HO1J>div._34Iqz>h2"))) {
			if (!this._element)
				this._create_element();
			if (!document.body.contains(this._element)) {
				var el = document.querySelector("._3MT-S>div>._1E3L7>._2RO1n");
				if (el)
					el.appendChild(this._element);
			}
		}
		else if (this._element && document.body.contains(this._element))
			this._element.parentElement.removeChild(this._element);
	}

	AchievementsContainer.prototype._create_element = function() {
		this._element = document.createElement("div");
		var el = document.createElement("hr");
		el.setAttribute("class", "_2rgts");
		this._element.appendChild(el);
		el = document.createElement("h1");
		el.setAttribute("class", "_1Cjfg");
		el.appendChild(document.createTextNode(tr("Achievements")));
		this._element.appendChild(el);
		this._element.appendChild(this._widgets[0].element());
	}

	// ----------

	containers.push(new TopContainer());
	containers.push(new RightContainer());
	containers.push(new CoursesContainer());
	containers.push(new BlockingContainer());
	containers.push(new AchievementsContainer());

	function getUserName() {
		var res = p_reg.exec(document.location.pathname);
		return res && res[2] || null;
	}

	function getProfileVersion() {
		if (document.querySelector("._2RO1n>._2MEyI>._2IGH->h1[data-test='profile-username']"))
			return 2;
		if (document.querySelector("div._2RO1n>div>div._23Nhe>div.xjBiS>h1[data-test='profile-username']"))
			return 3;
		return 0;
	}

	function reset_profile_view() {
		containers.forEach(function(c) {
			c.reset();
		});
	}

	function update_profile_view() {
		containers.forEach(function(c) {
			c.set_data(u_dat);
		});
	}

	function clear_data() {
		u_dat.state        = 0; // 0 - ready, 1 - pending, -1 - error;
		u_dat.version      = 0;
		u_dat.user         = { id: 0, name: "" };
		u_dat.created      = "";
		u_dat.streak       = { today: false, number: null };
		u_dat.freeze       = "";
		u_dat.lingots      = null;
		u_dat.block        = { blockers: null, blocking: null };
		u_dat.achievements = [];
		u_dat.courses      = { list: [], id: null };
	}

	var headers = {
		"Content-Type": "application/json; charset=UTF-8"
	};

	function get_user_data(uname, version, callback) {
		u_dat.state = 1;
		u_dat.user.name = uname;
		window.fetch("https://www.duolingo.com/users/" + uname, {
			method: "GET",
			headers: headers,
			credentials: "include"
		}).then(function(resp) {
			if (resp.status !== 200)
				throw new Error("Failed to fetch the user data");
			return resp.json();
		}).then(function(d) {
			u_dat.version        = version;
			u_dat.user.id        = d.id || 0;
			u_dat.user.name      = d.username && d.username.trim() || "";
			u_dat.version        = version;
			u_dat.created        = d.created && d.created.trim() || "";
			u_dat.streak.number  = d.site_streak || 0;
			u_dat.streak.today   = d.streak_extended_today || false;
			u_dat.freeze         = d.inventory && d.inventory.streak_freeze || "";
			u_dat.lingots        = d.rupees || 0;
			u_dat.block.blockers = !d.blockers && -1 || d.blockers.length;
			u_dat.block.blocking = !d.blocking && -1 || d.blocking.length;
			return window.fetch("https://www.duolingo.com/2017-06-30/users/" + u_dat.user.id + "?fields=_achievements,blockedUserIds,courses,currentCourseId", {
				method: "GET",
				headers: headers,
				credentials: "include"
			});
		}).then(function(resp) {
			if (resp.status !== 200)
				throw new Error("Failed to fetch the user's achivements");
			return resp.json();
		}).then(function(d) {
			u_dat.achievements   = d && d._achievements || [];
			u_dat.block.blocking = !d.blockedUserIds && -1 || d.blockedUserIds.length;
			u_dat.courses.id     = d.currentCourseId || null;
			u_dat.courses.list   = d.courses || [];
		}).catch(function(err) {
				u_dat.state = -1;
				console.warn(err.message);
		}).then(function(d) {
			observe.stop();
			u_dat.state = 0;
			callback();
			observe.start();
		});
	}

	function try_update() {
		ui_version = getProfileVersion();
		if (ui_version !== 0) {
			var uname = getUserName();
			if (uname) {
				if (uname != u_dat.user.name) {
					clear_data();
					u_dat.user.name = uname;
					reset_profile_view();
					get_user_data(uname, ui_version, update_profile_view);
				}
				else {
					update_profile_view();
				}
			}
    }
	}

	clear_data();
	setTimeout(function() {
		var sheet = create_style_sheet();
		for (var selector in css_rules) {
			add_css_rule(sheet, selector, css_rules[selector]);
		}
		try_update();
		observe.set(try_update);
		observe.start();
	}, 100);
}

