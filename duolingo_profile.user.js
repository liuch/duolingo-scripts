// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @include        https://preview.duolingo.com/*
// @version        1.11.1
// @grant          none
// @description    This script displays additional information in the users' profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профилях пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @run-at         document-start
// ==/UserScript==

// @license        MIT License

(function start() {
	let enable_debug = false;

	let err;
	let warn;
	let info;
	let debug;
	{
		function wrapper(origin_func) {
			return function(...args) {
				return origin_func("DuoProfile:", ...args);
			}
		}
		err   = wrapper(console.error);
		warn  = wrapper(console.warn);
		info  = wrapper(console.info);
		debug = enable_debug && wrapper(console.debug) || function(){};
	}

	let observe    = null;
	let p_reg      = new RegExp("^/profile/([a-zA-Z0-9._-]+)$");
	let ui_version = 0;
	let containers = [];

	let style1 = "width:26px;height:30px;background-size:35px;background-position:50%;background-repeat:no-repeat;float:none;display:inline-block;vertical-align:middle;background-image:url(//d35aaqx5ub95lt.cloudfront.net/images/icons/streak-freeze.svg);";
	let style2 = "vertical-align:middle;margin-left:0.5em;";
	let style3 = "width:26px;height:30px;background-size:35px;background-position:50%;background-repeat:no-repeat;float:none;display:inline-block;vertical-align:middle;background-image:url(//d35aaqx5ub95lt.cloudfront.net/images/icons/streak-empty.svg);";
	let style4 = "width:53px;height:64px;margin:0 auto; background-repeat:no-repeat;";
	let style6 = "display:none;width:30px;margin-top:-5px;margin-bottom:-10px;margin-left:-3px;margin-right:-10px;";
	let style7 = "display:none;font-size:40%;font-weight:700;margin-left:15px;vertical-align:top;padding:2px 7px;text-transform:uppercase;border-radius:5px;color:#fff;background:#80e000 none repeat;";

	let trs = {
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
			"ru" : "ур."
		},
		"LEVEL" : {
			"ru" : "УРОВЕНЬ"
		},
		"Crowns" : {
			"ru" : "Короны"
		},
		"Next level" : {
			"ru" : "След. уровень"
		},
		"From language" : {
			"ru" : "Базовый язык"
		},
		"Achievements" : {
			"ru" : "Достижения"
		},
		"Wildfire" : {
			"ru" : "Энтузиаст"
		},
		"Sage" : {
			"ru" : "Мудрец"
		},
		"Scholar" : {
			"ru" : "Эрудит"
		},
		"Regal" : {
			"ru" : "Владыка"
		},
		"Champion" : {
			"ru" : "Триумфатор"
		},
		"Sharpshooter" : {
			"ru" : "Снайпер"
		},
		"Conqueror" : {
			"ru" : "Покоритель"
		},
		"Winner" : {
			"ru" : "Победитель"
		},
		"Legendary" : {
			"ru" : "Легенда"
		},
		"Strategist" : {
			"ru" : "Стратег"
		},
		"Friendly" : {
			"ru" : "Дружелюбный"
		},
		"Weekend Warrior" : {
			"ru" : "Воин выходного дня"
		},
		"Photogenic" : {
			"ru" : "Фотогеничный"
		},
		"league" : {
			"ru" : "лига"
		},
		"Bronze" : {
			"ru" : "Бронзовая"
		},
		"Silver" : {
			"ru" : "Серебряная"
		},
		"Gold" : {
			"ru" : "Золотая"
		},
		"Sapphire" : {
			"ru" : "Сапфировая"
		},
		"Ruby" : {
			"ru" : "Рубиновая"
		},
		"Emerald" : {
			"ru" : "Изумрудная"
		},
		"Amethyst" : {
			"ru" : "Аметистовая"
		},
		"Pearl" : {
			"ru" : "Жемчужная"
		},
		"Obsidian" : {
			"ru" : "Обсидиановая"
		},
		"Diamond" : {
			"ru" : "Брильянтовая"
		},
		"Unknown" : {
			"ru" : "Неизвестная"
		},
		"Total lingots" : {
			"ru" : "Всего линготов"
		},
		"Last exercise" : {
			"ru" : "Последнее занятие"
		},
		"Number of wins" : {
			"ru" : "Количество побед"
		},
		"Top 3 finishes" : {
			"ru" : "В тройке лидеров"
		},
		"Week streak" : {
			"ru" : "Недель подряд"
		},
	};

	let duo = null;

	function tr(t) {
		return duo && (typeof(duo.uiLanguage) === "string") && trs[t] && trs[t][duo.uiLanguage] || t;
	}

	let css_rules = {
		".dp-hidden": "display:none;",
		".dp-close-button": "width:35px; height:35px; background:white; border:2px solid #e5e5e5; border-radius:98px; cursor:pointer;",
		".dp-close-button:after": "transform:rotate(45deg);",
		".dp-close-button:before": "transform:rotate(-45deg);",
		".dp-close-button:after, .dp-close-button:before": "content:\"\"; position:absolute; width:3px; height:19px; top:6px; left:15px; border-radius:3px; background-color: #b0b0b0;",
		".dp-modal": "display:inline-block; position:relative; vertical-align:middle; padding:30px; border-radius:16px; background-color:white;",
		".dp-modal .dp-container": "padding:10px; text-align:left; white-space:normal;",
		".dp-modal-overlay": "position:fixed; top:0; left:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.65); text-align:center; white-space:nowrap; z-index:400;",
		".dp-modal-overlay:after": "display:inline-block; vertical-align:middle; width:0; height:100%; content:\"\";",
		".dp-modal .dp-close-button": "position:absolute; top:0; right:0; transform:translateX(50%) translateY(-50%);",
		".dp-modal .dp-close-button:hover": "background-color:#e5e5e5;",
		".dp-course-current": "background-color:linen;",
		".dp-course-extra": "max-height:0; overflow:hidden; transition: max-height 1s 0.5s;",
		".dp-course-item:hover .dp-course-extra": "max-height:5em;",
		".dp-league-data-item": "padding:0 6px; margin: 0 1px; border-radius:2px; font-size:14px; font-weight:600;",
		".dp-data-row": "display:flex; font-size:18px; color:#666; min-height:24px; padding:0 6px; border-bottom:1px dotted #ccc;",
		".dp-data-title": "margin:auto auto auto 0; padding: 0 6px 0 0;",
		".dp-data-value": "display:flex; min-width:2em; margin:auto 0; padding:0; justify-content:right;",
	};

// ---

	class InfoButton
	{
		constructor(params) {
			this._element = null;
			if (params) {
				this._on_click = params.on_click || null;
			}
		}

		element() {
			if (!this._element) {
				this._element = document.createElement("div");
				this._element.setAttribute("tabindex", 0);
				this._element.setAttribute("style", InfoButton._style);
				this._element.appendChild(document.createTextNode("i"));
				if (this._on_click) {
					this._element.addEventListener("click", this._on_click);
				}
			}
			return this._element;
		}
	}

	InfoButton._style = "display:inline-block; cursor:pointer; margin-left:6px; color:white; background-color:silver; width:18px; height:18px; border-radius:18px; text-align:center; font-size:16px; font-weight:800;";

// ---

	class ModalWindow
	{
		constructor(content) {
			this._element = null;
			this._content = content;
		}

		element() {
			if (!this._element) {
				let ovl = document.createElement("div");
				ovl.setAttribute("class", "dp-modal-overlay dp-hidden");
				//
				ovl.addEventListener("click", function(event) {
					if (event.target === ovl) {
						this.hide();
					}
				}.bind(this));

				let wnd = document.createElement("div");
				wnd.setAttribute("class", "dp-modal");
				ovl.appendChild(wnd);

				let cbt = document.createElement("div");
				cbt.setAttribute("class", "dp-close-button");
				cbt.addEventListener("click", function() {
					this.hide();
				}.bind(this));
				wnd.appendChild(cbt);

				let con = document.createElement("div");
				con.setAttribute("class", "dp-container");
				con.appendChild(this._content);
				wnd.appendChild(con);

				this._element = ovl;
				ModalWindow._setGlobalHandler();
			}
			return this._element;
		}

		show() {
			this.element();
			this._element.querySelector("div.dp-close-button").classList.add("active");
			this._element.classList.remove("dp-hidden");
			return new Promise(function(resolve, reject) {
				this._callback = resolve;
			}.bind(this));
		}

		hide() {
			if (this._element) {
				this._element.querySelector("div.dp-close-button").classList.remove("active");
				this._element.classList.add("dp-hidden");
			}
			this._callback && this._callback();
		}
	}

	ModalWindow._setGlobalHandler = function() {
		if (!ModalWindow._gHandler) {
			ModalWindow._gHandler = function(event) {
				if (event.code == "Escape" && !event.shiftKey && !event.ctrlKey && !event.altKey) {
					let cbt = document.querySelector(".dp-close-button.active");
					if (cbt) {
						cbt.click();
						event.preventDefault();
					}
				}
			};
			document.body.addEventListener("keydown", ModalWindow._gHandler);
		}
	};


// ---

	class Widget
	{
		constructor() {
			this._value   = null;
			this._element = null;
			this.onChange = null;
		}

		setValue(val) {
			if (!Widget.isEqual(val, this._value)) {
				this._value = val && (typeof(val) == "object") && Object.assign({}, val) || val;
				if (this._element)
					this._updateElement();
				if (typeof(this.onChange) == "function")
					this.onChange(this);
			}
		}

		reset() {
			this.setValue(null);
		}

		isNull() {
			return this._value === null;
		}

		element() {
			if (!this._element) {
				this._createElement();
				this._updateElement();
			}
			return this._element;
		}
	}

	Widget.isEqual = function(a, b) {
		if (a && b && typeof(a) === "object" && typeof(b) === "object") {
			for (let prop in a) {
				if (!Widget.isEqual(a[prop], b[prop])) {
					return false;
				}
			}
			return true;
		}
		return (a === b);
	}

// ---

	class OnlineWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "online";
		}

		_createElement() {
			this._element = document.createElement("span");
			this._element.setAttribute("style", style7);
			this._element.setAttribute("title", "Has activity in the last 15 minutes (not the forum)");
			this._element.appendChild(document.createTextNode("Online"));
		}

		_updateElement() {
			if (this._value) {
				this._element.style.display = "inline";
			}
			else {
				this._element.style.display = "none";
			}
		}
	}

// ---

	class CreatedWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "created";
		}

		element() {
			if (ui_version === 210301) {
				if (!this._element || !document.body.contains(this._element)) {
					let el = document.querySelector("h1[data-test='profile-username']");
					if (el) {
						el = el.nextElementSibling;
						if (el) {
							this._element = el.children[0] && el.children[0].children[1] || null;
						}
					}
				}
			}
			return super.element();
		}

		_createElement() {
			if (ui_version !== 210301) {
				this._element = document.createElement("p");
				this._element.setAttribute("id", "dp-created-info");
				this._element.setAttribute("style", "color:gray;");
			}
		}

		_updateElement() {
			let str = null;
			if (ui_version !== 210301) {
				str = tr("Registered:") + " " + (this._value && this._value.str || "-");
				if (this._element.childNodes.length) {
					this._element.childNodes[0].nodeValue = str;
				}
				else {
					this._element.appendChild(document.createTextNode(str));
				}
			}
			if (this._element) {
				if (this._value) {
					if (ui_version === 210301) {
						if (this._value.date || this._value.str) {
							str = this._value.date && (new Date(this._value.date)).toLocaleString() || "?";
							if (this._value.str) {
								str = str + " (" + this._value.str + ")";
							}
							this._element.setAttribute("title", str);
							return;
						}
					}
					else {
						if (this._value.date) {
							this._element.setAttribute("title", (new Date(this._value.date)).toLocaleString() || "?");
							return;
						}
					}
				}
				this._element.removeAttribute("title");
			}
		}
	}

// ---

	class BioWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "bio";
		}

		isEmpty() {
			return !this._value || (typeof(this._value) === "string" && this._value.trim() === "");
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("id", "dp-bio");
			this._element.setAttribute("style", "color:gray");
			this._element.setAttribute("dir", "auto");
		}

		_updateElement() {
			let str = this._value || "";
			if (this._element.childNodes.length) {
				this._element.childNodes[0].nodeValue = str;
			}
			else {
				this._element.appendChild(document.createTextNode(str));
			}
		}
	}

// ---

	class LinksWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "user";
		}

		_genLinkElement(href, ancor, marker) {
			let el = null;
			let chain = "";
			let a_el = document.createElement("a");
			a_el.setAttribute("href", href);
			if (ui_version === 210301) {
				a_el.setAttribute("style", "color:gray;");
				el = document.createElement("li");
				el.setAttribute("style", "display:inline;");
				if (marker) {
					el.appendChild(document.createTextNode(" \u{2022} "));
				}
				el.appendChild(a_el);
			}
			else {
				a_el.setAttribute("style", "color:gray;margin-left:1em;");
				el = a_el;
				chain = "\u{1F517} ";
			}
			a_el.appendChild(document.createTextNode(chain + ancor));
			return el;
		}

		_createElement() {
			this._element = document.createElement("div");
			let el = document.createElement("span");
			if (ui_version === 210301) {
				el.appendChild(document.createTextNode(tr("\u{1F517}")));
				el.setAttribute("style", "flex:0 0 15px;margin-right:12px;font-size:15px;");
				this._element.appendChild(el);
				let ul_el = document.createElement("ul");
				ul_el.setAttribute("style", "display:inline;");
				this._element.appendChild(ul_el);
				this._element.setAttribute("style", "align-items:center;display:flex;margin-bottom:12px;white-space:nowrap;");
			}
			else {
				el.setAttribute("style", "color:gray;");
				el.appendChild(document.createTextNode(tr("Links:")));
				this._element.appendChild(el);
				this._element.setAttribute("style", "margin-top:1em;");
			}
			this._element.setAttribute("id", "dp-links");
		}

		_updateElement() {
			let el = ui_version === 210301 && this._element.children[1] || this._element.children[0];
			while (el.children.length > 0)
				el.removeChild(el.children[0]);
			if (this._value && (this._value.id || this._value.name.length)) {
				if (this._value.name.length)
					el.appendChild(this._genLinkElement("https://duome.eu/" + encodeURIComponent(this._value.name), "Duome.eu", false));
				if (this._value.id)
					el.appendChild(this._genLinkElement("https://www.duolingo.com/users/" + this._value.id + "/redirect", tr("Permanent"), true));
			}
			else {
				let el2 = null;
				if (ui_version === 210301) {
					el2 = document.createElement("li");
					el2.setAttribute("style", "display:inline;");
				}
				else {
					el2 = document.createElement("span");
					el2.setAttribute("style", "color:gray;margin-left:1em;");
				}
				el2.appendChild(document.createTextNode("-"));
				el.appendChild(el2);
			}
		}
	}

// ---

	class StreakWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "streak";
		}

		element() {
			if (ui_version === 210301) {
				if (!this._element || !document.body.contains(this._element)) {
					let el = document.getElementById("dp-stat");
					if (el && el.children.length > 0) {
						el = el.children[0];
						this._element = el;
						let el2 = el.children[0];
						if (el2.tagName !== "DIV") {
							el2.setAttribute("style", "margin-top:-2px;");
							el = document.createElement("div");
							el.appendChild(el2);
							el2 = document.createElement("img");
							el2.setAttribute("src", "//d35aaqx5ub95lt.cloudfront.net/images/icons/streak-freeze.svg");
							el2.setAttribute("style", style6);
							el.appendChild(el2);
							this._element.insertBefore(el, this._element.firstChild);
							this._updateElement();
							return;
						}
					}
				}
			}
			return super.element();
		}

		_createElement() {
			if (ui_version !== 210301) {
				this._element = document.createElement("div");
				let el = document.createElement("span");
				el.setAttribute("class", "_2D777");
				el.setAttribute("style", style3);
				this._element.appendChild(el);
				el = document.createElement("span");
				el.setAttribute("style", style2);
				el.setAttribute("id", "dp_streak");
				let el2 = document.createElement("strong");
				el2.appendChild(document.createTextNode("?"));
				el.appendChild(el2);
				el.appendChild(document.createTextNode(" " + tr("days")));
				this._element.appendChild(el);
			}
		}

		_updateElement() {
			let url;
			if (ui_version === 210301) {
				if (this._value) {
					let el = this._element.children[0].children[0];
					if (typeof(this._value.today) == "boolean") {
						if (this._value.today) {
							url = "//d35aaqx5ub95lt.cloudfront.net/images/398e4298a3b39ce566050e5c041949ef.svg";
							el.style.marginTop = "-2px";
						}
						else {
							url = "//d35aaqx5ub95lt.cloudfront.net/images/969d573d8f995ccb47bbfa7c61a193bd.svg";
							el.style.marginTop = "-8px";
						}
						el.setAttribute("src", url);
					}
					el = el.nextElementSibling;
					if (this._value.freeze.length > 0) {
						let tm = new Date(this._value.freeze);
						tm.setMinutes(tm.getMinutes() - tm.getTimezoneOffset());
						el.style.display = "block";
						el.style.marginTop = "-7px";
						el.setAttribute("title", tm.toLocaleString());
					}
					else {
						el.setAttribute("style", style6);
						el.removeAttribute("title");
					}
				}
				return;
			}
			let num = "?"
			url = "//d35aaqx5ub95lt.cloudfront.net/images/icons/streak-empty.svg";
			if (this._value) {
				if (this._value.today)
					url = "//d35aaqx5ub95lt.cloudfront.net/images/icons/streak.svg";
				if (typeof(this._value.number) == "number")
					num = this._value.number;
			}
			this._element.children[0].style.backgroundImage = "url(" + url + ")";
			this._element.children[1].children[0].childNodes[0].nodeValue = num;
		}
	}

// ---

	class FreezeWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "freeze";
		}

		isNull() {
			return (!this._value || this._value.length == 0);
		}

		_createElement() {
			this._element = document.createElement("div");
			let el = document.createElement("span");
			el.setAttribute("class", "wwWR9");
			el.setAttribute("style", style1);
			this._element.appendChild(el);
			el = document.createElement("span");
			el.setAttribute("style", style2);
			this._element.appendChild(el);
		}

		_updateElement() {
			let freeze_str = (this._value && this._value.length > 0) && (new Date(this._value.replace(" ", "T"))).toLocaleDateString() || "?";
			if (this._element.children[1].childNodes.length > 0)
				this._element.children[1].childNodes[0].nodeValue = freeze_str;
			else
				this._element.children[1].appendChild(document.createTextNode(freeze_str));
		}
	}

// ---

	class LingotsWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "lingots";
		}

		_createElement() {
			this._element = document.createElement("div");
			let el;
			let el2;
			if (ui_version === 210301) {
				this._element.setAttribute("class", "_3Pm6e");
				el = document.createElement("img");
				el.setAttribute("src", "//d35aaqx5ub95lt.cloudfront.net/images/icons/lingot.svg");
				el.setAttribute("class", "_3Boy6 _2ZI34");
				this._element.appendChild(el);
				el2 = document.createElement("div");
				el2.setAttribute("class", "_30I27");
				this._element.appendChild(el2);
				let el3 = document.createElement("h4");
				el3.setAttribute("class", "_3gX7q");
				el3.appendChild(document.createTextNode("?"));
				el2.appendChild(el3);
				el3 = document.createElement("div");
				el3.setAttribute("class", "_2nvdt");
				el3.appendChild(document.createTextNode(tr("Total lingots")));
				el2.appendChild(el3);
			}
			else {
				el = document.createElement("span");
				if (ui_version === 2)
					el.setAttribute("class", "_13hfw QemVH _1PTkr m7XUW");
				else if (ui_version === 3)
					el.setAttribute("class", "_2pFNt _3aUCN _1woVy _1fHjR");
				this._element.appendChild(el);
				el = document.createElement("span");
				el.setAttribute("style", style2);
				el2 = document.createElement("strong");
				el2.appendChild(document.createTextNode("?"));
				el.appendChild(el2);
				this._element.appendChild(el);
			}
		}

		_updateElement() {
			let lingots = this._value === null && "?" || this._value;
			if (ui_version === 210301) {
				this._element.children[1].children[0].textContent = lingots;
			}
			else {
				this._element.children[1].children[0].childNodes[0].nodeValue = lingots;
			}
		}
	}

// ---

	class LastExerciseWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "last_exercise";
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("class", "_3Pm6e");
			let el = document.createElement("img");
			el.setAttribute("src", "//d35aaqx5ub95lt.cloudfront.net/images/icons/words.svg");
			el.setAttribute("class", "_3Boy6 _2ZI34");
			this._element.appendChild(el);
			let el2 = document.createElement("div");
			el2.setAttribute("class", "_30I27");
			this._element.appendChild(el2);
			let el3 = document.createElement("h4");
			el3.setAttribute("class", "_3gX7q");
			el3.appendChild(document.createTextNode("?"));
			el2.appendChild(el3);
			el3 = document.createElement("div");
			el3.setAttribute("class", "_2nvdt");
			el3.appendChild(document.createTextNode(tr("Last exercise")));
			el2.appendChild(el3);
		}

		_updateElement() {
			let el = this._element.children[1].children[0];
			if (this._value) {
				let etime = new Date(this._value);
				el.textContent = timeSince(etime);
				el.setAttribute("title", etime.toLocaleString());
			}
			else {
				el.textContent = this._value === 0 && "n/a" || "?";
				el.removeAttribute("title");
			}
		}
	}

// ---

	class CourseWidget extends Widget
	{
		constructor(tag, element) {
			super();
			this.tag = tag;
			this._element = element;
			this._element.classList.add("dp-course-item");
		}

		_updateElement() {
			this._removeExtraInfo();
			let t_el = CourseWidget.titleElement(this._element);
			if (this._value) {
				this._level = CourseWidget.getXpLevel(this._value[0].xp);
				if (t_el && t_el.childNodes.length === 1) {
					t_el.appendChild(document.createTextNode(" - " + tr("Level") + " " + this._level.value));
				}
				if (this._value[0].current) {
					this._element.classList.add("dp-course-current");
				}
				else {
					this._element.removeAttribute("style");
				}
				this._insertExtraInfo();
			}
			else {
				if (t_el) {
					while (t_el.childNodes.length > 1) {
						t_el.removeChild(t_el.lastChild);
					}
				}
				this._element.removeAttribute("style");
			}
		}

		_insertExtraInfo() {
			if (this._element.children.length === 2) {
				let c = this._element.children[1];
				while (c.childNodes.length > 2) {
					c.removeChild(c.lastChild);
				}
				let el = document.createElement("div");
				el.setAttribute("class", "dp-course-extra");
				el.appendChild(this._makeInfoItem(tr("Crowns"), this._value[0].crowns));
				if (this._level.next_level > 0) {
					el.appendChild(this._makeInfoItem(tr("Next level"), this._level.next_level + " XP"));
				}
				el.appendChild(this._makeInfoItem(tr("From language"), this._value[0].from));
				c.appendChild(el);
			}
		}

		_removeExtraInfo() {
			let eie = this._element.querySelector(".dp-course-extra");
			if (eie) {
				eie.remove();
			}
		}

		_makeInfoItem(text, value) {
			let te = document.createElement("div");
			te.appendChild(document.createTextNode(text + ": "));
			let st = document.createElement("span");
			st.appendChild(document.createTextNode(value));
			te.appendChild(st);
			return te;
			}
	}

	CourseWidget.titleElement = function(el) {
		return el.querySelector("div:nth-child(2)>div");
	};

	CourseWidget.languageElement = function(el) {
		let e = CourseWidget.titleElement(el);
		if (e && e.firstChild) {
			return e.firstChild.nodeValue;
		}
	};

	CourseWidget.xpElement = function(el) {
		let ex_el = el.querySelector("div:nth-child(2)>div:nth-child(2)");
		if (ex_el && ex_el.lastChild) {
			let xp_m = ex_el.lastChild.nodeValue.match(/(\d+)/);
			if (xp_m) {
				return Number(xp_m[1]);
			}
		}
	};

	CourseWidget.getXpLevel = function(xp) {
		let xp_level_cutoffs = [
			60, 120, 200, 300, 450, 750, 1125, 1650, 2250, 3e3, 3900, 4900,
			6e3, 7500, 9e3, 10500, 12e3, 13500, 15e3, 17e3, 19e3, 22500, 26e3, 3e4
		];
		let level = xp_level_cutoffs.length - 1;
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
		let nl = xp_level_cutoffs[level] || 0;
		if (nl > 0) {
			nl -= xp;
		}
		return { value: level + 1, next_level: nl };
	};

// ---

	class BlockingWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "block";
		}

		_createElement() {
			this._element = document.createElement("ul");
			this._element.setAttribute("style", "border-top:2px solid #dadada;display:table;width:100%;margin-top:30px;");
			this._element.appendChild(this._createLi("Blocking"));
			this._element.appendChild(this._createLi("Blockers"));
		}

		_updateElement() {
			if (this._value) {
				this._setLiValue(0, this._value.blocking);
				this._setLiValue(1, this._value.blockers);
			}
			else {
				this._setLiValue(0, null);
				this._setLiValue(1, null);
			}
		}

		_createLi(text) {
			let li_el = document.createElement("li");
			li_el.setAttribute("style", "display:table-cell;padding:12px 10px 0 0;");
			let sp_el = document.createElement("span");
			sp_el.appendChild(document.createTextNode(tr(text) + ": "));
			li_el.appendChild(sp_el);
			sp_el = document.createElement("span");
			sp_el.appendChild(document.createTextNode("?"));
			li_el.appendChild(sp_el);
			return li_el;
		}

		_setLiValue(idx, val) {
			let new_val;
			if (val === null)
				new_val = "?";
			else
				new_val = (val === -1) && "n/a" || val;
			this._element.children[idx].children[1].childNodes[0].nodeValue = new_val;
		}
	}

// ---

	class AchievementItem
	{
		constructor(id) {
			this._id = id;
			this._level = 0;
			this._finished = null;
			this._element = null;
		}

		setValue(val) {
			if (this._level !== val.level || this._finished !== val._finished) {
				this._level = val.level;
				this._finished = val.finished;
				if (this._element)
					this._updateElement();
			}
		}

		element() {
			if (!this._element) {
				this._createElement();
				this._updateElement();
			}
			return this._element;
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("style", "width:77px; display:inline-block; margin:5px;");
			this._element.setAttribute("title", tr(AchievementItem._decor[this._id].title));
			let p_el = document.createElement("div");
			let t_el = document.createElement("div");
			if (ui_version === 2) {
				this._element.setAttribute("class", "_2xnLX");
				p_el.setAttribute("class", "lkrNd " + AchievementItem._decor[this._id].picture_class[0][0]);
				t_el.setAttribute("class", "_2w0LW _1fADj _2w0LW");
			}
			else {
				this._element.setAttribute("class", "_1qHrn");
				p_el.setAttribute("class", "_3_QUJ " + AchievementItem._decor[this._id].picture_class[1][0]);
				t_el.setAttribute("class", "_3SIlB _13kYE _3SIlB");
			}
			t_el.appendChild(document.createTextNode("?"));
			p_el.appendChild(t_el);
			this._element.appendChild(p_el);
			this._updateElement();
		}

		_updateElement() {
			this._element.children[0].children[0].childNodes[0].nodeValue = tr("LEVEL") + " " + (this._level || "?");
			let text_action = null;
			let pic_classes = null;
			if (this._finished) {
				text_action = "add";
				pic_classes = [ 0, 1 ];
			}
			else {
				text_action = "remove";
				pic_classes = [ 1, 0 ];
			}
			let pc_ver = (ui_version === 3) && 1 || 0;
			this._element.firstChild.firstChild.classList[text_action]("_3A81p");
			this._element.firstChild.classList.remove(AchievementItem._decor[this._id].picture_class[pc_ver][pic_classes[0]]);
			this._element.firstChild.classList.add(AchievementItem._decor[this._id].picture_class[pc_ver][pic_classes[1]]);
		}
	}

	AchievementItem.isCorrect = function(id) {
		return AchievementItem._order.indexOf(id) !== -1;
	};


	AchievementItem._order = [
		"wildfire", "sage", "scholar", "regal", "champion", "sharpshooter", "conqueror", "winner", "legendary",
		"strategist", "friendly", "overtime", "photogenic"
	];

	AchievementItem._decor = {
		wildfire:     { picture_class: [ [ "_38s-f", "_2dW4w" ], ["PEvQz",  "YwCyZ"  ] ], title: "Wildfire" },
		sage:         { picture_class: [ [ "_2_uNm", "_1OCLu" ], ["_20zJn", "T0DDr"  ] ], title: "Sage" },
		scholar:      { picture_class: [ [ "_1UEFI", "_17Sw8" ], ["_1WucH", "_3Fge_" ] ], title: "Scholar" },
		regal:        { picture_class: [ [ "_2bKfI", "_2DmuE" ], ["_1OiHp", "y6jP4"  ] ], title: "Regal" },
		champion:     { picture_class: [ [ "_2UPSL", "wjpiv"  ], ["_2yBMs", "_2N2OI" ] ], title: "Champion" },
		sharpshooter: { picture_class: [ [ "_1pGIh", "_24m_z" ], ["_1pkpX", "_3c1H2" ] ], title: "Sharpshooter" },
		conqueror:    { picture_class: [ [ "NzA53",  "_3wv96" ], ["_3upVv", "_3HCUY" ] ], title: "Conqueror" },
		winner:       { picture_class: [ [ "_3YJ2r", "E6mN_"  ], ["_2S2dm", "R74tF"  ] ], title: "Winner" },
		legendary:    { picture_class: [ [ "_2j7XQ", "_3Gek4" ], ["_2ik6a", "_2mGoN" ] ], title: "Legendary" },
		strategist:   { picture_class: [ [ "WL3iH",  "_3-on6" ], ["_34sTq", "_22Ui-" ] ], title: "Strategist" },
		friendly:     { picture_class: [ [ "_2xjwF", "_2z9FT" ], ["_2zNmn", "_2SNGW" ] ], title: "Friendly" },
		overtime:     { picture_class: [ [ "_3FslY", "kDFIZ"  ], ["_1dML2", "Sx8mZ"  ] ], title: "Weekend Warrior" },
		photogenic:   { picture_class: [ [ "_2KzQv", "_2ByTK" ], ["_3Nhfm", "_1X1Kv" ] ], title: "Photogenic" },
	};

// ---

	class AchievementsWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "achievements";
			this._items = {};
		}

		_createElement() {
			this._element = document.createElement("div");
			this._updateElement();
		}

		_updateElement() {
			if (this._value) {
				let need_append = false;
				for (let i = 0; ; ++i) {
					let val = this._value[i];
					if (val === undefined)
						break;
					if (AchievementItem.isCorrect(val.name)) {
						let item = this._items[val.name];
						if (!item) {
							item = new AchievementItem(val.name);
							this._items[val.name] = item;
						}
						let level = val.tier;
						let finished = false;
						if (val.tierCounts.length > level)
							++level;
						else
							finished = true;
						item.setValue({ level: level, finished: finished });
						if (!this._element.contains(item.element()))
							need_append = true;
					}
					else
						warn("Unknown achievement '" + val.name + "'");
				}
				if (need_append) {
					while (this._element.childNodes.length > 1)
						this._element.removeChild(this._element.lastChild);
					AchievementItem._order.forEach(function(id) {
						if (this._items[id])
							this._element.appendChild(this._items[id].element());
					}, this);
				}
			}
			else {
				for (let id in this._items)
					this._items[id].setValue(0);
			}
		}
	}

// ---

	class LeagueWidget extends Widget
	{
		constructor() {
			super();
			this.tag  = "league";
			this._btn = new InfoButton({ on_click: this._displayModalWindow.bind(this) });
			this._info_el = null;
			this._modal_ct = null;
		}

		element() {
			if (ui_version === 210301) {
				if (!this._element || !document.body.contains(this._element)) {
					let el = document.getElementById("dp-stat");
					if (el && el.children.length >= 4) {
						el = el.children[3];
						this._element = el;
						let el2 = el.children[1].children[0];
						if (el2.tagName === "H4") {
							el2.style.display = "inline-block";
							el = document.createElement("div");
							el.appendChild(el2);
							el.appendChild(this._infoElement());
							el2 = this._element.children[1];
							el2.insertBefore(el, el2.firstChild);
							this._updateElement();
							return;
						}
					}
				}
			}
			return super.element();
		}

		_infoElement() {
			if (!this._info_el) {
				this._info_el = document.createElement("div");
				this._info_el.setAttribute("style", "display:block; margin-left:6px; float:right;");
				LeagueWidget._data_guide.forEach(function(di) {
					let e = document.createElement("span");
					e.setAttribute("class", "dp-league-data-item");
					e.setAttribute("style", "color:" + di.color + "; background-color:" + di.bcolor);
					e.appendChild(document.createTextNode("?"));
					this._info_el.appendChild(e);
				}.bind(this));
				this._info_el.appendChild(this._btn.element());
				this._updateElement();
			}
			return this._info_el;
		}

		_createElement() {
		}

		_updateElement() {
			let data = this._value || {};
			for (let i = 0; i < LeagueWidget._data_guide.length; ++i) {
				let di = LeagueWidget._data_guide[i];
				this._info_el.children[i].textContent = typeof(data[di.name]) === "number" ? data[di.name] : "?";
			}
			if (this._modal_ct) {
				this._updateModalContent();
			}
		}

		_ensureModalContent() {
			if (!this._modal_ct) {
				this._modal_ct = document.createElement("div");
				this._modal_ct.setAttribute("style", "min-width:260px;");
				{
					let badge = document.createElement("div");
					badge.setAttribute("style", "margin-bottom:1em; text-align:center;");
					this._modal_ct.appendChild(badge);
					{
						let image = document.createElement("div");
						image.setAttribute("style", style4);
						badge.appendChild(image);
					}
					{
						let text = document.createElement("h2");
						text.setAttribute("style", "margin:16px 0;");
						badge.appendChild(text);
					}
				}
				{
					let table = document.createElement("div");
					this._modal_ct.appendChild(table);
					LeagueWidget._data_guide.forEach(function(di) {
						let row = document.createElement("div");
						row.setAttribute("class", "dp-data-row");
						table.appendChild(row);
						let title = document.createElement("span");
						title.setAttribute("class", "dp-data-title");
						title.appendChild(document.createTextNode(tr(di.title) + ":"));
						row.appendChild(title);
						let value = document.createElement("span");
						value.setAttribute("class", "dp-data-value");
						value.appendChild(document.createTextNode("?"));
						row.appendChild(value);
					});
				}
				this._updateModalContent();
			}
		}

		_updateModalContent() {
			let bgi = "none";
			let text = "";
			let color = "none";
			if (this._value && typeof(this._value.tier) == "number") {
				let ln = LeagueWidget._names[this._value.tier];
				if (ln) {
					bgi = "url(//d35aaqx5ub95lt.cloudfront.net/images/leagues/badge_" + ln.name + ".svg)";
					text = tr(ln.title) + " " + tr("league");
					color = ln.color;
				}
				else {
					text = tr("Unknown") + " " + tr("league");
				}
			}
			let badge = this._modal_ct.children[0];
			badge.children[0].style.backgroundImage = bgi;
			badge.children[1].style.color = color;
			badge.children[1].textContent = text;

			let data = this._value || {};
			let rows = this._modal_ct.querySelectorAll(".dp-data-row");
			for (let i = 0; i < LeagueWidget._data_guide.length; ++i) {
				let di = LeagueWidget._data_guide[i];
				rows[i].children[1].textContent = typeof(data[di.name]) === "number" ? data[di.name] : "?";
			}
		}

		_displayModalWindow() {
			this._ensureModalContent();
			let modal = new ModalWindow(this._modal_ct);
			let m_el = modal.element();
			document.body.appendChild(m_el);
			modal.show().finally(function() {
				m_el.remove();
			});
		}
	}

	LeagueWidget._names = [
		{ name: "bronze",   color: "#CF9C6D", title: "Bronze" },
		{ name: "silver",   color: "#C2D1DD", title: "Silver" },
		{ name: "gold",     color: "#FEC701", title: "Gold" },
		{ name: "sapphire", color: "#1CB0F6", title: "Sapphire" },
		{ name: "ruby",     color: "#FF4B4B", title: "Ruby" },
		{ name: "emerald",  color: "#78C900", title: "Emerald" },
		{ name: "amethyst", color: "#CF9C6D", title: "Amethyst" },
		{ name: "pearl",    color: "#FFAADE", title: "Pearl" },
		{ name: "obsidian", color: "#494751", title: "Obsidian" },
		{ name: "diamond",  color: "#87EAEA", title: "Diamond" },
	];

	LeagueWidget._data_guide = [
		{ name: "num_wins",  color: "#999", bcolor: "#fbf07d", title: "Number of wins" },
		{ name: "top_three", color: "#999", bcolor: "#fade72", title: "Top 3 finishes" },
		{ name: "streak",    color: "#999", bcolor: "#f9d467", title: "Week streak" },
	];

// ---
// ---

	class WidgetContainer
	{
		constructor() {
			this._widgets = [];
		}

		setData(d) {
			this._widgets.forEach(function(wid) {
				let v = d[wid.tag];
				if (v !== undefined)
					wid.setValue(v);
				else
					wid.reset();
			});
			this._update();
		}

		reset() {
			this._widgets.forEach(function(wid) {
				wid.reset();
			});
			this._update();
		}
	}

// ---

	class TopContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._widgets.push(new OnlineWidget());
			this._widgets.push(new CreatedWidget());
			this._widgets.push(new BioWidget());
			this._widgets.push(new LinksWidget());
		}

		_update() {
			let el = document.querySelector("h1[data-test='profile-username']");
			if (el) {
				if (ui_version === 210301) {
					if (el.children.length === 2) {
						el.insertBefore(this._widgets[0].element(), el.children[1]);
					}
					this._widgets[1].element();
				}
				else {
					if (!document.getElementById("dp-created-info")) {
						el.parentNode.insertBefore(this._widgets[1].element(), el.nextSibling);
					}
				}

				let el2 = document.getElementById("dp-bio");
				if (!el2) {
					if (ui_version === 210301) {
						el.parentElement.insertBefore(this._widgets[2].element(), el.parentElement.lastElementChild);
					}
					else {
						el.parentNode.insertBefore(this._widgets[2].element(), this._widgets[1].element().nextSibling)
					}
				}
				if (!this._widgets[2].isEmpty()) {
					el2 = el.parentNode.querySelector("div[dir=auto]:not([id=dp-bio])"); // the original bio
					if (el2) {
						el2.remove();
					}
				}

				el2 = document.getElementById("dp-links");
				if (ui_version === 210301) {
					if (!el2 && el.nextSibling) {
						el.nextSibling.appendChild(this._widgets[3].element());
					}
				}
				else {
					if (!el2 || el.lastChild != el2) {
						el2 && el2.remove();
						el.parentNode.appendChild(this._widgets[3].element());
					}
				}
			}
		}
	}

// ---

	class CentralContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._version = -1;

			this._widgets.push(new StreakWidget());

			let freeze = new FreezeWidget();
			freeze.on_change = function(wid) {
				let el;
				if (wid.isNull()) {
					el = wid.element();
					if (el.parentElement)
						el.parentElement.removeChild(el);
				}
				else {
					el = document.getElementById("dp_streak");
					if (el) {
						let next = el.nextSibling;
						if (next)
							el.parentElement.insertBefore(wid.element(), next);
						else
							el.parentElement.appendChild(wid.element());
					}
				}
			};
			this._widgets.push(freeze);

			this._widgets.push(new LingotsWidget());
			this._widgets.push(new LastExerciseWidget());
			this._widgets.push(new LeagueWidget());
		}

		_update() {
			if (ui_version === 210301) {
				if (!this._element || !document.body.contains(this._element)) {
					this._findElement();
				}
				if (this._element) {
					this._widgets[0].element();
					if (!this._element.contains(this._widgets[2].element())) {
						this._element.appendChild(this._widgets[2].element());
					}
					if (!this._element.contains(this._widgets[3].element())) {
						this._element.appendChild(this._widgets[3].element());
					}
					this._widgets[4].element();
				}
				return;
			}

			let el;
			if (!this._element || this._version != ui_version) {
				this._version = ui_version;
				this._element = null;
				if (ui_version > 0)
					this._createElement();
			}

			if (this._element && !document.body.contains(this._element)) {
				if (ui_version == 2) {
					el = document.querySelector("div._3Nl60>div.COg1x>h2");
				}
				else if (ui_version == 3) {
					el = document.querySelector("div>div._1YfQ8>div._3Gj5_>h2");
				}
				if (el) {
					el.parentNode.insertBefore(this._element, el);
				}
			}
		}

		_findElement() {
			this._element = document.querySelector("div._2GPX6>div>div._1jKLW");
			if (this._element) {
				this._element.setAttribute("id", "dp-stat");
			}
		}

		_createElement() {
			this._element = document.createElement("div");
			if (ui_version == 3) {
				this._element.setAttribute("class", "a5SW0");
			}

			let el = document.createElement("h2");
			el.setAttribute("style", "margin-bottom:10px;");
			el.appendChild(document.createTextNode(tr("Streak")));
			this._element.appendChild(el);
			this._element.appendChild(this._widgets[0].element());
			if (!this._widgets[1].isNull())
				this._element.appendChild(this._widgets[1].element());

			this._appendSpacer();

			el = document.createElement("h2");
			el.setAttribute("style", "margin-bottom:10px;");
			el.appendChild(document.createTextNode(tr("Storage")));
			this._element.appendChild(el);
			this._element.appendChild(this._widgets[2].element());

			this._appendSpacer();
		}

		_appendSpacer() {
			let el = document.createElement("div");
			el.setAttribute("style", "height:15px;");
			this._element.appendChild(el);
		}
	}

// ---

	class CoursesContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._courses = null;
		}

		setData(d) {
			this._courses = {};
			this._xp_map = {};
			this._tl_map = {};
			if (d.courses) {
				// Fill data
				for (let i = 0; i < d.courses.list.length; ++i) {
					let c = d.courses.list[i];
					let l = {
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
				for (let lg in this._courses) {
					this._courses[lg].sort(function(a, b) {
						return b.xp - a.xp;
					});
				}
				// --
				this._courses.count = d.courses.list.length;
			}
			this._update();
		}

		reset() {
			this._courses = {};
			this._updateWidgets();
			this._widgets = null;
		}

		_update() {
			if (!this._widgets && this._courses && this._courses.count > 0) {
				this._makeWidgets();
			}
			this._updateWidgets();
		}

		_makeWidgets() {
			this._widgets = [];
			let ul;
			if (ui_version === 2)
				ul = document.querySelector("div._3Nl60>div.COg1x>div>ul.kcn9s._2G3j1._1Pp27");
			else
				ul = document.querySelector("div._1YfQ8>div._3Gj5_>div._1cKdX._1ORYU>ul._3VE_w");
			if (ul) {
				ul.querySelectorAll("li").forEach(function(el) {
					let wid = null;
					let lg;
					for (let i = 1, lg = CourseWidget.languageElement(el); lg && i <= 2; ++i) {
						if (this._courses[lg]) {
							wid = new CourseWidget(lg, el);
							break;
						}
						lg = this._tl_map[lg];
					}
					if (!wid) {
						let xp = CourseWidget.xpElement(el);
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
			}
		}

		_updateWidgets() {
			if (this._widgets) {
				this._widgets.forEach(function(wid) {
					let v = this._courses[wid.tag];
					if (v !== undefined) {
						wid.setValue(v);
					}
					else {
						wid.reset();
					}
				}, this);
			}
		}
	}

// ---

	class BlockingContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._widgets.push(new BlockingWidget());
		}

		_update() {
			let el;
			if (ui_version === 2)
				el = document.querySelector("div>div._3Nl60>div.COg1x>ul._3sDCf._1BWZU");
			else if (ui_version === 3)
				el = document.querySelector("div>div._1YfQ8>div._3Gj5_>ul._27avI._3yAjN");
			if (el) {
				if (!this._element)
					this._createElement();
				if (!document.body.contains(this._element))
					el.parentElement.appendChild(this._element);
			}
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.appendChild(this._widgets[0].element());
		}
	}

// ---

	class AchievementsContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._widgets.push(new LeagueWidget());
			this._widgets.push(new AchievementsWidget());
		}

		_update() {
			if ((ui_version == 2 && !document.querySelector("div._2y4G6>div._3blMz>div>div._1_7b8>h2"))
					|| (ui_version == 3 && !document.querySelector("div._2PVaI>div._25dpq>div>div._20-_w>h2"))) {
				if (!this._element)
					this._createElement();
				if (!document.body.contains(this._element) || this._element.parentElement.lastChild !== this._element) {
					let el;
					if (ui_version === 2)
						el = document.querySelector("div._1tEYo>div._2y4G6>div._3blMz");
					else if (ui_version === 3)
						el = document.querySelector("div._33Mo9>div._2PVaI>div._25dpq");
					if (el)
						el.appendChild(this._element);
				}
			}
			else if (this._element && document.body.contains(this._element))
				this._element.parentElement.removeChild(this._element);
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("style", "text-align:center;");
			let el = document.createElement("hr");
			this._element.appendChild(el);
			el = document.createElement("h2");
			el.appendChild(document.createTextNode(tr("Achievements")));
			this._element.appendChild(el);
			this._element.appendChild(this._widgets[0].element());
			this._element.appendChild(this._widgets[1].element());
		}
	}

// ---
// ---

	class MyObserver
	{
		constructor(handler) {
			this._observer = new MutationObserver(function() {
				this.stop();
				handler();
				this.start();
			}.bind(this));
		}

		start() {
			this._observer.observe(document.body, { childList: true, subtree: true });
		}

		stop() {
			this._observer.disconnect();
		}
	}

// ---

	class DataSource
	{
		constructor(manager) {
			this._manager   = manager;
			this.fetching   = false;
			this.pending    = false;
			this.controller = null;
		}

		fetch(user) {
			this.pending = true;
			this.controller = new AbortController();
			return this._manager.asyncGet(this._param_key).then(function(param) {
				this.fetching = true;
				this.pending = false;
				return fetch(this._makeUrl(param), {
					method: "GET",
					headers: { "Content-Type": "application/json; charset=UTF-8" },
					credentials: "include",
					signal: this.controller.signal
				}).then(function(resp) {
					if (resp.status !== 200)
						throw new Error("Failed to fetch user data");
					return resp.json();
				}).then(function(data) {
					data._user = user;
					data._type = this._data_type;
					this.fetching = false;
					return data;
				}.bind(this));
			}.bind(this)).catch(function(err) {
				this.fetching = false;
				this.pending  = false;
				return {
					_type: this._data_type,
					_error: err
				};
			}.bind(this));
		}
	}

// ---

	class OldProfileDataSource extends DataSource
	{
		constructor(manager) {
			super(manager);
			this._param_key = "user_name";
			this._data_type = "old_profile";
		}

		_makeUrl(param) {
			return window.location.origin + "/users/" + encodeURIComponent(param);
		}
	}

// ---

	class NewProfileDataSource extends DataSource
	{
		constructor(manager) {
			super(manager);
			this._param_key = "user_id";
			this._data_type = "new_profile";
		}

		_makeUrl(param) {
			return window.location.origin + "/2017-06-30/users/" + param
				+ "?fields=username,blockerUserIds,blockedUserIds,courses,currentCourseId,creationDate,bio,hasRecentActivity15";
		}
	}

// ---

	class LeagueDataSource extends DataSource
	{
		constructor(manager) {
			super(manager);
			this._param_key = "user_id";
			this._data_type = "league";
		}

		_makeUrl(param) {
			return "https://duolingo-leaderboards-prod.duolingo.com/leaderboards/7d9f5dd1-8423-491a-91f2-2532052038ce/users/"	+ param;
		}
	}

// ---

	class AchievementsDataSource extends DataSource
	{
		constructor(manager) {
			super(manager);
			this._param_key = "user_id";
			this._data_type = "achievements";
		}

		_makeUrl(param) {
			return "https://duolingo-achievements-prod.duolingo.com/users/" + param
				+ "/achievements?fromLanguage=en&hasPlus=1&isAgeRestricted=0&isProfilePublic=1&isSchools=0&learningLanguage=es";
		}
	}

// ---

	let u_data = new class
	{
		constructor(on_update, on_reset) {
			this._data = {};
			this._on_update = on_update;
			this._on_reset = on_reset;
			this._async_keys = { user_id: [], user_name: [] };
			this._sources = {
				old_profile:  new OldProfileDataSource(this),
				new_profile:  new NewProfileDataSource(this),
				league:       new LeagueDataSource(this),
				achievements: new AchievementsDataSource(this)
			};
			this._reset();
		}

		user() {
			return this._data.user;
		}

		data() {
			return this._data;
		}

		update(user) {
			this._reset();
			this._on_reset();
			for (let key in this._sources) {
				let source = this._sources[key];
				if (source.fetching) source.controller.abort();
			}
			if (!user.id) user.id = 0;
			if (!user.name) user.name = "";
			this._data.user = user;
			this._fetchData(this._sources.old_profile);
			this._fetchData(this._sources.new_profile);
			this._fetchData(this._sources.league);
			this._fetchData(this._sources.achievements);
		}

		asyncGet(key) {
			let result = null;
			let source = null;
			let async_queue = null;
			if (key == "user_id") {
				result = this._data.user.id;
				if (result === 0) {
					source = this._sources.old_profile;
					async_queue = this._async_keys.user_id;
				}
			}
			else if (key == "user_name") {
				result = this._data.user.name;
				if (result === "") {
					source = this._sources.new_profile;
					async_queue = this._async_keys.user_name;
				}
			}
			else
				result = this._data[key];

			if (!source) {
				return Promise.resolve(result);
			}

			let promise = new Promise(function(resolve, reject) {
				async_queue.push([ resolve, reject ]);
			});
			this._fetchData(source);
			return promise;
		}

		_reset() {
			this._data.user          = { id: 0, name: "" };
			this._data.created       = { str: "", date: 0 };
			this._data.streak        = { today: null, number: null, freeze: "" };
			this._data.freeze        = "";
			this._data.lingots       = null;
			this._data.last_exercise = null;
			this._data.block         = { blockers: null, blocking: null };
			this._data.achievements  = [];
			this._data.courses       = { list: [], id: null };
			this._data.league        = null;
			this._data.bio           = "";
			this._data.online        = false;
		}

		_fetchData(source) {
			if (!source.fetching && !source.pending) {
				source.fetch(this._data.user).then(function(data) {
					this._handleData(data);
					this._on_update(this._data);
				}.bind(this));
			}
		}

		_handleData(data) {
			debug("Handle data", data._type);
			if (data._error) {
				if (this._handleQueue(data._type, null, data._error) == 0)
					err(data._error.message);
				return;
			}
			if (data._user !== this._data.user) {
				this._handleQueue(data._type, null, new Error("Outdated data"));
				return;
			}

			switch (data._type) {
				case "old_profile":
					this._data.user.id        = data.id || 0;
					this._data.user.name      = data.username && data.username.trim() || "";
					this._data.created.str    = data.created && data.created.trim() || "";
					this._data.streak.number  = data.site_streak || 0;
					this._data.streak.today   = data.streak_extended_today || false;
					this._data.streak.freeze  = data.inventory && data.inventory.streak_freeze || "";
					this._data.freeze         = this._data.streak.freeze;
					this._data.lingots        = data.rupees || 0;
					if (data.bio && data.bio !== "" && this._data.bio === "") {
						this._data.bio = data.bio;
					}
					if (this._data.block.blockers == -1) {
						this._data.block.blockers = !data.blockers && -1 || data.blockers.length;
					}
					if (this._data.block.blocking == -1) {
						this._data.block.blocking = !data.blocking && -1 || data.blocking.length;
					}
					this._data.last_exercise  = 0;
					if (data.calendar) {
						this._data.last_exercise = data.calendar.reduce(function(previousValue, item) {
							return previousValue < item.datetime ? item.datetime : previousValue;
						}, 0);
					}
					this._handleQueue("user_id", this._data.user.id, null);
					break;
				case "new_profile":
					this._data.user.name      = data.username && data.username.trim() || "";
					this._data.courses.id     = data.currentCourseId || null;
					this._data.courses.list   = data.courses || [];
					this._data.created.date   = (data.creationDate || 0) * 1000;
					this._data.online         = data.hasRecentActivity15;
					if (data.bio && data.bio !== "" && this._data.bio === "") {
						this._data.bio = data.bio;
					}
					if (this._data.block.blockers == -1) {
						this._data.block.blockers = !data.blockerUserIds && -1 || data.blockerUserIds.length;
					}
					if (this._data.block.blocking == -1) {
						this._data.block.blocking = !data.blockedUserIds && -1 || data.blockedUserIds.length;
					}
					this._handleQueue("user_name", this._data.user.name, null);
					break;
				case "league":
					this._data.league = {
						tier:      data.tier || 0,
						num_wins:  data.num_wins || 0,
						streak:    data.streak_in_tier || 0,
						top_three: data.top_three_finishes || 0
					};
					break;
				case "achievements":
					this._data.achievements = data.achievements || [];
					break;
			}
		}

		_handleQueue(key, data, err) {
			if (!this._async_keys[key]) {
				switch (key) {
					case "old_profile":
						key = "user_id";
						break;
					case "new_profile":
						key = "user_name";
						break;
					default:
						return 0;
				}
			}
			let handled = 0;
			this._async_keys[key].forEach(function(it) {
				if (!err)
					it[0](data);
				else
					it[1](err);
				++handled;
			});
			this._async_keys[key] = [];
			return handled;
		}
	}(update_profile_view, reset_profile_view);

// ---

	function reset_profile_view() {
		debug("Reset user profile");
		observe.stop();
		containers.forEach(function(c) {
			c.reset();
		});
		observe.start();
	}

// ---

	function update_profile_view(data) {
		debug("Update user profile", data.user);
		observe.stop();
		containers.forEach(function(c) {
			c.setData(data);
		});
		observe.start();
	}

// ---

	function try_update() {
		ui_version = getProfileVersion();
		if (ui_version !== 0) {
			let uname = getUserName();
			if (uname) {
				if (uname !== u_data.user().name) {
					u_data.update({ name: uname });
				}
				else {
					update_profile_view(u_data.data());
				}
			}
		}
	}

// ---

	function getUserName() {
		let res = p_reg.exec(document.location.pathname);
		return res && res[1] || null;
	}

// ---

	function getProfileVersion() {
		let ver = 0;
		if (document.querySelector("div._3blMz>div.g7QLd>div._2tFvE>h1[data-test='profile-username']")) // www subdomain
			ver = 2;
		else if (document.querySelector("div._25dpq>div._3Ho-0>div._2XFyg>h1[data-test='profile-username']")) // preview subdomain
			ver = 3;
		else if (document.querySelector("div._91Tq4>div._6yLXC>div._2mVDz>h1[data-test='profile-username']")) // March 2021; www, preview
			ver = 210301;
		if (ver !== ui_version) {
			debug("UI version changed: " + ui_version + " >>> " + ver);
		}
		return ver;
	}

// ---

	let time_since_values = [
		{ divider: 31536000, tail: "year"   },
		{ divider: 2592000,  tail: "month"  },
		{ divider: 86400,    tail: "day"    },
		{ divider: 3600,     tail: "hour"   },
		{ divider: 60,       tail: "minute" },
		{ divider: 1,        tail: "second" }
	];

	function timeSince(time) {
		let secs = Math.floor(((new Date()) - time) / 1000);
		let tail = null;
		let num;
		for (let i = 0; i < time_since_values.length; ++i) {
			num = Math.floor(secs / time_since_values[i].divider);
			if (num >= 1) {
				return num + " " + time_since_values[i].tail + (num > 1 && "s" || "") + " ago";
			}
		}
		return "Just now";
	}

// ---

	function create_style_sheet() {
		let style = document.createElement("style");
		style.appendChild(document.createTextNode("")); // Webkit hack
		document.head.appendChild(style);
		return style.sheet;
	}

// ---

	function add_css_rule(sheet, selector, rules) {
		if ("addRule" in sheet) {
			sheet.addRule(selector, rules);
		}
		else if ("insertRule" in sheet) {
			sheet.insertRule(selector + "{" + rules + "}", 0);
		}
	}

// ---

	function init() {
		info("Started");
		let sheet = create_style_sheet();
		for (let selector in css_rules) {
			add_css_rule(sheet, selector, css_rules[selector]);
		}

		containers.push(new TopContainer());
		containers.push(new CentralContainer());
		containers.push(new CoursesContainer());
		containers.push(new BlockingContainer());
		containers.push(new AchievementsContainer());

		observe = new MyObserver(try_update);
		observe.start();

		setTimeout(function() {
			duo = window && typeof(window.duo) === "object" && window.duo;
			if (!duo) {
				debug("The duo class is not available, we will try to use Greasemonkey class to reach it");
				duo = unsafeWindow && typeof(unsafeWindow.duo) === "object" && unsafeWindow.duo || null;
			}
			try_update();
		}, 0);
	}

// ---

	window.addEventListener("load", function() {
		init();
	});
})();

