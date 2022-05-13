// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @include        https://preview.duolingo.com/*
// @version        1.17.0
// @grant          none
// @description    This script displays additional information in the users' profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профилях пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @run-at         document-start
// @license        MIT License
// ==/UserScript==

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

	let u_data     = null;
	let observe    = null;
	let ui_version = 0;
	let ui_section = "";
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
			"uk" : "Зареєстрований(а):",
		},
		"Links:" : {
			"ru" : "Ссылки:",
			"uk" : "Посилання:",
		},
		"Permanent" : {
			"ru" : "Постоянная",
			"uk" : "Постійна",
		},
		"Level" : {
			"ru" : "Уровень",
			"uk" : "Рівень",
		},
		"LEVEL" : {
			"ru" : "УРОВЕНЬ",
			"uk" : "РІВЕНЬ",
		},
		"Crowns" : {
			"ru" : "Короны",
			"uk" : "Корони",
		},
		"Next level" : {
			"ru" : "Следующий уровень",
			"uk" : "Наступний рівень",
		},
		"From language" : {
			"ru" : "Базовый язык",
			"uk" : "Основна мова",
		},
		"Skills" : {
			"ru" : "Навыки",
			"uk" : "Навички",
		},
		"Unfinished" : {
			"ru" : "Незавершенные",
			"uk" : "Незавершені",
		},
		"Wildfire" : {
			"ru" : "Энтузиаст",
			"uk" : "Пожежа",
		},
		"Sage" : {
			"ru" : "Мудрец",
			"uk" : "Мудрий",
		},
		"Scholar" : {
			"ru" : "Эрудит",
			"uk" : "Вчений",
		},
		"Regal" : {
			"ru" : "Владыка",
			"uk" : "Владика",
		},
		"Champion" : {
			"ru" : "Триумфатор",
			"uk" : "Чемпіон",
		},
		"Sharpshooter" : {
			"ru" : "Снайпер",
			"uk" : "Перфекціоніст",
		},
		"Conqueror" : {
			"ru" : "Покоритель",
			"uk" : "Завойовник",
		},
		"Winner" : {
			"ru" : "Победитель",
			"uk" : "Переможець",
		},
		"Legendary" : {
			"ru" : "Легенда",
			"uk" : "Легенда",
		},
		"Strategist" : {
			"ru" : "Стратег",
			"uk" : "Стратег",
		},
		"Friendly" : {
			"ru" : "Дружелюбный",
			"uk" : "Дружній",
		},
		"Weekend Warrior" : {
			"ru" : "Воин выходного дня",
			"uk" : "Лицар вихідного дня",
		},
		"Photogenic" : {
			"ru" : "Фотогеничный",
			"uk" : "Фотогенічний",
		},
		"league" : {
			"ru" : "лига",
			"uk" : "ліга",
		},
		"Bronze" : {
			"ru" : "Бронзовая",
			"uk" : "Бронзова",
		},
		"Silver" : {
			"ru" : "Серебряная",
			"uk" : "Срібна",
		},
		"Gold" : {
			"ru" : "Золотая",
			"uk" : "Золота",
		},
		"Sapphire" : {
			"ru" : "Сапфировая",
			"uk" : "Сапфірова",
		},
		"Ruby" : {
			"ru" : "Рубиновая",
			"uk" : "Рубінова",
		},
		"Emerald" : {
			"ru" : "Изумрудная",
			"uk" : "Смарагдова",
		},
		"Amethyst" : {
			"ru" : "Аметистовая",
			"uk" : "Аметистова",
		},
		"Pearl" : {
			"ru" : "Жемчужная",
			"uk" : "Перлинна",
		},
		"Obsidian" : {
			"ru" : "Обсидиановая",
			"uk" : "Обсидіанова",
		},
		"Diamond" : {
			"ru" : "Алмазная",
			"uk" : "Діамантова",
		},
		"Unknown" : {
			"ru" : "Неизвестная",
			"uk" : "Невідома",
		},
		"Total lingots" : {
			"ru" : "Всего линготов",
			"uk" : "Усього лінготи",
		},
		"Last exercise" : {
			"ru" : "Последнее занятие",
			"uk" : "Остання вправа",
		},
		"Number of wins" : {
			"ru" : "Количество побед",
			"uk" : "Кількість перемог",
		},
		"Top 3 finishes" : {
			"ru" : "В тройке лидеров",
			"uk" : "Топ 3 фініші",
		},
		"Week streak" : {
			"ru" : "Недель подряд",
			"uk" : "Тижнів поспіль",
		},
		"Total" : {
			"ru" : "Всего",
			"uk" : "Усього",
		},
		"Sunday" : {
			"ru" : "Воскресенье",
			"uk" : "Неділя",
		},
		"Monday" : {
			"ru" : "Понедельник",
			"uk" : "Понеділок",
		},
		"Tuesday" : {
			"ru" : "Вторник",
			"uk" : "Вівторок",
		},
		"Wednesday" : {
			"ru" : "Среда",
			"uk" : "Середа",
		},
		"Thursday" : {
			"ru" : "Четверг",
			"uk" : "Четвер",
		},
		"Friday" : {
			"ru" : "Пятница",
			"uk" : "П'ятниця",
		},
		"Saturday" : {
			"ru" : "Суббота",
			"uk" : "Субота",
		},
		"Current" : {
			"ru" : "Текущий",
			"uk" : "Поточний",
		},
		"View details" : {
			"ru" : "Подробнее",
			"uk" : "Докладніше",
		},
	};

	let duo = null;

	function tr(t) {
		return duo && (typeof(duo.uiLanguage) === "string") && trs[t] && trs[t][duo.uiLanguage] || t;
	}

	let css_rules = {
		".dp-hidden": "display:none;",
		".dp-info-block": "display:block; margin-left:6px; float:right;",
		".dp-info-button": "display:inline-block; cursor:pointer; margin-left:12px; color:white; background-color:silver; width:18px; height:18px; border-radius:18px; text-align:center; font-size:16px; font-weight:800;",
		".dp-close-button": "width:35px; height:35px; background:white; border:2px solid #e5e5e5; border-radius:98px; cursor:pointer;",
		".dp-close-button:after": "transform:rotate(45deg);",
		".dp-close-button:before": "transform:rotate(-45deg);",
		".dp-close-button:after, .dp-close-button:before": "content:\"\"; position:absolute; width:3px; height:19px; top:6px; left:15px; border-radius:3px; background-color: #b0b0b0;",
		".dp-modal": "display:inline-block; position:relative; vertical-align:middle; padding:30px; border-radius:16px; background-color:white;",
		".dp-modal .dp-container": "padding:10px; text-align:left; white-space:normal;",
		".dp-modal-overlay": "position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.65); text-align:center; white-space:nowrap; z-index:400;",
		".dp-modal-overlay:after": "display:inline-block; vertical-align:middle; width:0; height:100%; content:\"\";",
		".dp-modal .dp-close-button": "position:absolute; top:0; right:0; transform:translateX(50%) translateY(-50%);",
		".dp-modal .dp-close-button:hover": "background-color:#e5e5e5;",
		".dp-modal h2, .dp-modal h3": "text-align:center;",
		".dp-course-current": "background-color:linen;",
		".dp-course-current:first-child": "border-top-left-radius:15px; border-top-right-radius:15px;",
		".dp-course-current:last-child": "border-bottom-left-radius:15px; border-bottom-right-radius:15px;",
		".dp-course-extra": "max-height:0; overflow:hidden; transition: max-height 1s 0.5s;",
		".dp-data-row": "padding:0 6px; border-bottom:1px dotted #ccc;",
		".dp-data-info": "padding:12px;",
		".dp-data-row, .dp-data-info": "display:flex; font-size:18px; color:#666; min-height:24px;",
		".dp-data-row.dp-subdata": "padding-left:15px; font-size:90%;",
		".dp-data-title": "margin:auto auto auto 0; padding: 0 6px 0 0;",
		".dp-data-value": "display:flex; min-width:2em; margin:auto 0; padding:0; justify-content:right;",
		".dp-data-row.dp-summary": "font-size:115%; font-weight:600; background-color:#f6f6f6; border-color:#000; padding:3px 6px;",
		".dp-achievements-list": "text-align:center; margin-bottom:12px; min-height:54px;",
		".dp-achievements-container": "padding:8px; border:2px solid #e5e5e5; border-radius:16px;",
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
				this._element.setAttribute("class", "dp-info-button");
				this._element.appendChild(document.createTextNode("i"));
				if (this._on_click) {
					this._element.addEventListener("click", this._on_click);
				}
			}
			return this._element;
		}
	}

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
				if (val) {
					if (Array.isArray(val)) {
						this._value = val.slice();
					}
					else if (typeof(val) === "object") {
						this._value = Object.assign({}, val);
					}
					else
						this._value = val;
				}
				else
					this._value = val;

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

		onTimer() {
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
	};

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
					this._findElement();
					this._updateElement();
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

		_findElement() {
			let el = document.querySelector("h1[data-test='profile-username']");
			if (el) {
				el = el.nextElementSibling;
				if (el) {
					this._element = el.children[0] && el.children[0].children[1] || null;
				}
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
			while (el.firstChild)
				el.lastChild.remove();
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
							return this._element;
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
					if (typeof(this._value.number) === "number") {
						this._element.children[1].children[0].textContent = this._value.number;
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
			this._element.children[1].children[0].textContent = num;
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
		}

		_updateElement() {
			let lingots = this._value === null && "?" || this._value;
			if (ui_version === 210301) {
				this._element.children[1].children[0].textContent = lingots;
			}
		}
	}

// ---

	class LastExerciseWidget extends Widget
	{
		constructor() {
			super();
			this.tag = "sessions";
			this._btn = new InfoButton({ on_click: this._displayModalWindow.bind(this) });
			this._last = null;
		}

		onTimer() {
			this._displaySince();
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("class", "_3Pm6e");
			{
				let img = document.createElement("img");
				img.setAttribute("src", "//d35aaqx5ub95lt.cloudfront.net/images/icons/words.svg");
				img.setAttribute("class", "_3Boy6 _2ZI34");
				this._element.appendChild(img);
			}
			{
				let r_blk = document.createElement("div");
				r_blk.setAttribute("class", "_30I27");
				this._element.appendChild(r_blk);
				{
					let h_blk = document.createElement("div");
					r_blk.appendChild(h_blk);
					{
						let hdr = document.createElement("h4");
						hdr.setAttribute("class", "_3gX7q");
						hdr.setAttribute("style", "display:inline-block");
						hdr.appendChild(document.createTextNode("?"));
						h_blk.appendChild(hdr);
					}
					{
						let i_blk = document.createElement("div");
						i_blk.setAttribute("class", "dp-info-block");
						i_blk.appendChild(this._btn.element());
						h_blk.appendChild(i_blk);
					}
				}
				{
					let title = document.createElement("div");
					title.setAttribute("class", "_2nvdt");
					title.appendChild(document.createTextNode(tr("Last exercise")));
					r_blk.appendChild(title);
				}
			}
		}

		_updateElement() {
			let etime = null;
			if (this._value) {
				etime = this._value.reduce(function(previousValue, item) {
					return previousValue < item.datetime ? item.datetime : previousValue;
				}, 0);
			}
			let el = this._element.children[1].children[0].children[0];
			if (etime) {
				this._last = new Date(etime);
				this._displaySince(el);
				el.setAttribute("title", this._last.toLocaleString());
			}
			else {
				el.textContent = etime === 0 ? "n/a" : "?";
				el.removeAttribute("title");
			}
			if (this._modal_ct) {
				this._updateModalContent();
			}
		}

		_displaySince(el) {
			if (!el) {
				el = this._element.children[1].children[0].children[0];
			}
			el.textContent = timeSince(this._last);
		}

		_displayModalWindow() {
			this._ensureModalContent();
			let modal = new ModalWindow(this._modal_ct);
			let m_el = modal.element();
			document.body.appendChild(m_el);
			modal.show().finally(function() {
				m_el.remove();
			});
			this._modal_ct.querySelector("[tabindex]").focus();
		}

		_ensureModalContent() {
			if (!this._modal_ct) {
				this._modal_ct = document.createElement("div");
				{
					let header = document.createElement("h2");
					this._modal_ct.appendChild(header);
					{
						let uname = document.createElement("span");
						uname.setAttribute("style", "color:#00b;");
						header.appendChild(uname);
					}
					header.appendChild(document.createTextNode("'s recent practice sessions"));
				}
				{
					let table = document.createElement("div");
					table.setAttribute("tabindex", 0);
					table.setAttribute("style", "max-height:65vh; overflow: visible auto; border:1px solid #ccc; border-radius:6px;");
					this._modal_ct.appendChild(table);
				}
				this._updateModalContent();
			}
		}

		_updateModalContent() {
			this._modal_ct.children[0].children[0].textContent = (u_data.user().name || "?");
			let table = this._modal_ct.children[1];
			while (table.firstChild)
				table.lastChild.remove();
			if (this._value && this._value[0]) {
				let sorted = this._value.sort(function(a, b) {
					return a.datetime - b.datetime;
				});
				let rd = null;
				let s_impr = 0;
				let s_date = new Date(sorted[0].datetime);
				s_date.setHours(0, 0, 0, 0);
				sorted.forEach(function(item) {
					rd = new Date(item.datetime);
					rd.setHours(0, 0, 0, 0);
					if (rd.valueOf() !== s_date.valueOf()) {
						table.appendChild(this._makeDataRowElement(s_date, s_impr, true));
						s_date = rd;
						s_impr = 0;
					}
					table.appendChild(this._makeDataRowElement(new Date(item.datetime), item.improvement, false));
					s_impr += item.improvement;
				}.bind(this));
				table.appendChild(this._makeDataRowElement(s_date, s_impr, true));
			}
			else {
				let el = document.createElement("span");
				el.setAttribute("class", "dp-data-info");
				el.appendChild(document.createTextNode(this._value && "There is no data" || "Getting data from the server..."));
				table.appendChild(el);
			}
		}

		_makeDataRowElement(dt, xp, summary) {
			let row  = document.createElement("div");
			let col1 = document.createElement("span");
			let col2 = document.createElement("span");
			let ecl  = null;
			let text = null;
			if (!summary) {
				ecl = "";
				let year = dt.getFullYear();
				let month = dt.getMonth() + 1;
				let day = dt.getDate();
				let dstr = "" + year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
				text = dstr + " " + dt.toLocaleTimeString() + " ";
			}
			else {
				ecl = " dp-summary";
				text = tr("Total") + " ("
					+ tr([ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ][dt.getDay()]) + ") ";
			}
			row.setAttribute("class", "dp-data-row" + ecl);
			col1.setAttribute("class", "dp-data-title");
			col1.appendChild(document.createTextNode(text));
			col2.setAttribute("class", "dp-data-value");
			col2.appendChild(document.createTextNode(xp.toString() + " XP"));
			row.appendChild(col1);
			row.appendChild(col2);
			return row;
		}
	}

// ---

	class CourseWidget extends Widget
	{
		constructor(tag, element) {
			super();
			this.tag      = tag;
			this._btn     = new InfoButton({ on_click: this._displayModalWindow.bind(this) });
			this._element = element;
			this._prepareElement();
			this._updateElement();
		}

		_prepareElement() {
			if (this._element.children.length > 2) {
				let right_side = document.createElement("div");
				right_side.setAttribute("style", "display:flex; flex-direction:column; align-items:flex-end; margin-left:auto;");
				let xp_el = this._element.replaceChild(right_side, this._element.children[1])
				right_side.appendChild(xp_el);
				let cr_el = document.createElement("div");
				cr_el.setAttribute("style", "display:flex; margin-top:6px;");
				let ct_el = xp_el.cloneNode(false);
				ct_el.textNode = "";
				cr_el.appendChild(ct_el);
				let ci_el = document.createElement("img");
				ci_el.setAttribute("src", "//d35aaqx5ub95lt.cloudfront.net/images/crowns/b3ede3d53c932ee30d981064671c8032.svg");
				ci_el.setAttribute("style", "width:23px; margin-left:2px;");
				cr_el.appendChild(ci_el);
				right_side.appendChild(cr_el);
				this._element.insertBefore(this._btn.element(), this._element.children[2]);
			}
		}

		_updateElement() {
			let crowns  = null;
			let current = false;
			if (this._value) {
				if (this._value.current) {
					current = true;
				}
				crowns = this._value.crowns;
			}
			this._element.classList[current ? "add" : "remove"]("dp-course-current");
			this._element.children[1].children[1].children[0].textContent = crowns !== null ? crowns.toString() : "?";

			if (this._modal_ct) {
				this._updateModalContent();
			}
		}

		_displayModalWindow(event) {
			event.preventDefault();
			this._ensureModalContent();
			let modal = new ModalWindow(this._modal_ct);
			let m_el = modal.element();
			document.body.appendChild(m_el);
			modal.show().finally(function() {
				m_el.remove();
			});
		}

		_ensureModalContent() {
			if (!this._modal_ct) {
				this._modal_ct = document.createElement("div");
				this._modal_ct.setAttribute("style", "min-width:260px;");
				{
					let header = document.createElement("h2");
					header.setAttribute("style", "color:#00b; margin-bottom:10px;");
					this._modal_ct.appendChild(header);
				}
				{
					let current = document.createElement("h3");
					current.setAttribute("style", "color:#0b0;");
					this._modal_ct.appendChild(current);
				}
				{
					let table = document.createElement("div");
					this._modal_ct.appendChild(table);
					table.appendChild(this._makeDataRowElement("From language"));
					table.appendChild(this._makeDataRowElement("Crowns"));
					table.appendChild(this._makeDataRowElement("Level"));
					table.appendChild(this._makeDataRowElement("Next level"));
				}
				this._updateModalContent();
			}
		}

		_updateModalContent() {
			let title;
			let xp;
			let curr = false;
			let from;
			let crowns;
			let level;
			let next_l;
			if (this._value) {
				let value = this._value;
				xp     = value.xp;
				curr   = value.current;
				title  = value.title;
				from   = value.from;
				crowns = value.crowns;
				let xp_level = CourseWidget.getXpLevel(xp);
				level  = xp_level.value;
				next_l = xp_level.next_level !== 0 ? (xp_level.next_level + " " + tr("XP")) : "-";
			}
			else {
				xp = title = from = crowns = level = next_l = "?";
			}
			this._modal_ct.querySelector("h2").textContent = title + " (" + xp + " " + tr("XP") + ")";
			this._modal_ct.querySelector("h3").textContent = curr ? tr("Current") : "";
			let table = this._modal_ct.children[2];
			let rows  = table.children;
			rows[0].children[1].textContent = from;
			rows[1].children[1].textContent = crowns;
			rows[2].children[1].textContent = level;
			rows[3].children[1].textContent = next_l;

			if (curr && this._value.skills) {
				let skills = this._value.skills;
				let extra_rows = [ "" ];
				extra_rows.push(skills.count);
				for (let i = 0; i < skills.levels.length; ++i) {
					extra_rows.push(skills.levels[i] || 0);
				}
				let start_idx = 4;
				let titles = [ "Skills", "Total", "Unfinished", null, null, null, null, null, "Legendary" ];
				extra_rows.forEach(function(row_data, idx) {
					let row = rows[idx + start_idx];
					if (!row) {
						row = this._makeDataRowElement(titles[idx] || (tr("Level") + " " + (idx - 2)), idx !== 0);
						table.appendChild(row);
					}
					row.children[1].textContent = row_data;
				}, this);
			}
		}

		_makeDataRowElement(title, sub) {
			let row_el = document.createElement("div");
			row_el.setAttribute("class", "dp-data-row" + (sub && " dp-subdata" || ""));
			let ttl_el = document.createElement("span");
			ttl_el.setAttribute("class", "dp-data-title");
			ttl_el.appendChild(document.createTextNode((sub && "\u{2022} " || "") + tr(title) + ":"));
			row_el.appendChild(ttl_el);
			let val_el = document.createElement("span");
			val_el.setAttribute("class", "dp-data-value");
			row_el.appendChild(val_el);
			return row_el;
		}
	}

	CourseWidget.languageData = function(el) {
		if (el.tagName === "A") {
			if (el.href) {
				let reg = /\/enroll\/([a-zA-Z_-]+)\/([a-zA-Z_-]+)\//.exec(el.href);
				if (reg) {
					return { target: reg[1], from: reg[2] };
				}
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
			this._element.setAttribute("style", "width:80px; display:inline-block; margin:5px;");
			this._element.setAttribute("title", tr(AchievementItem._decor[this._id].title));
			let p_el = document.createElement("div");
			let t_el = document.createElement("div");

			this._element.setAttribute("class", "_1qHrn");
			p_el.setAttribute("class", "_3_QUJ " + AchievementItem._decor[this._id].picture_class[0]);
			t_el.setAttribute("class", "_3SIlB _13kYE");

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
			this._element.firstChild.firstChild.classList[text_action]("_2Jl4F");
			this._element.firstChild.classList.remove(AchievementItem._decor[this._id].picture_class[pic_classes[0]]);
			this._element.firstChild.classList.add(AchievementItem._decor[this._id].picture_class[pic_classes[1]]);
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
		wildfire:     { picture_class: [ "PEvQz",  "YwCyZ"  ], title: "Wildfire" },
		sage:         { picture_class: [ "_20zJn", "T0DDr"  ], title: "Sage" },
		scholar:      { picture_class: [ "_1WucH", "_3Fge_" ], title: "Scholar" },
		regal:        { picture_class: [ "_1OiHp", "y6jP4"  ], title: "Regal" },
		champion:     { picture_class: [ "_2yBMs", "_2N2OI" ], title: "Champion" },
		sharpshooter: { picture_class: [ "_1pkpX", "_3c1H2" ], title: "Sharpshooter" },
		conqueror:    { picture_class: [ "_3upVv", "_3HCUY" ], title: "Conqueror" },
		winner:       { picture_class: [ "_2S2dm", "R74tF"  ], title: "Winner" },
		legendary:    { picture_class: [ "_2ik6a", "_2mGoN" ], title: "Legendary" },
		strategist:   { picture_class: [ "_34sTq", "_22Ui-" ], title: "Strategist" },
		friendly:     { picture_class: [ "_2zNmn", "_2SNGW" ], title: "Friendly" },
		overtime:     { picture_class: [ "_1dML2", "Sx8mZ"  ], title: "Weekend Warrior" },
		photogenic:   { picture_class: [ "_3Nhfm", "_1X1Kv" ], title: "Photogenic" },
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
			this._element.setAttribute("class", "dp-achievements-list");
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
				this._info_el.setAttribute("class", "dp-info-block");
				this._info_el.appendChild(this._btn.element());
				this._updateElement();
			}
			return this._info_el;
		}

		_createElement() {
		}

		_updateElement() {
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
			let bgi = null;
			let text = "";
			let color = "none";
			if (this._value && typeof(this._value.tier) == "number") {
				let ln = LeagueWidget._names[this._value.tier];
				if (ln) {
					bgi = ln.name;
					text = tr(ln.title) + " " + tr("league");
					color = ln.color;
				}
				else {
					text = tr("Unknown") + " " + tr("league");
				}
			}
			let badge = this._modal_ct.children[0];
			badge.children[0].style.backgroundImage =
				"url(//d35aaqx5ub95lt.cloudfront.net/images/leagues/badge_" + (bgi || "locked") + ".svg)"
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

		onTimer() {
			if (Array.isArray(this._widgets)) {
				this._widgets.forEach(function(wid) {
					wid.onTimer();
				});
			}
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

				let el2 = document.getElementById("dp-bio");
				if (!el2) {
					if (ui_version === 210301) {
						el.parentElement.insertBefore(this._widgets[2].element(), el.parentElement.lastElementChild);
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
		}

		_findElement() {
			this._element = document.querySelector("div._2GPX6>div>div._1jKLW");
			if (this._element) {
				this._element.setAttribute("id", "dp-stat");
			}
		}
	}

// ---

	class CoursesContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._widgets = {};
			this._courses = null;
		}

		setData(d) {
			this._courses = {};
			if (d.courses) {
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
						if (l.target === d.courses.skills.language || l.title === d.courses.skills.title) {
							l.skills = d.courses.skills;
						}
					}
					let ckey = l.target + "/" + l.from;
					this._courses[ckey] = l;
				}
			}
			this._setWidgets();
		}

		reset() {
			this._courses = {};
			this._setWidgets();
		}

		_update() {
			if (ui_section !== "courses") {
				this._widgets = {};
				return;
			}
			this._setWidgets();
		}

		_setWidgets() {
			let list_el;
			let widgets = this._widgets;
			this._widgets = {};
			if (ui_version !== 210301 || !(list_el = document.querySelector("div._2GPX6>div.BMuTY"))) {
				return;
			}
			for (let i = 0; i < list_el.children.length; ++i) {
				let course_el = list_el.children[i];
				let lang_data = CourseWidget.languageData(course_el);
				if (lang_data) {
					let lang_key = lang_data.target + "/" + lang_data.from;
					let widget = widgets[lang_key];
					if (!widget || widget.element() !== course_el) {
						widget = new CourseWidget(lang_key, course_el);
					}
					let wdata = this._courses[lang_key];
					if (wdata !== undefined) {
						widget.setValue(wdata);
					}
					else {
						widget.reset();
					}
					this._widgets[lang_key] = widget;
				}
			}
		}
	}

// ---

	class AchievementsContainer extends WidgetContainer
	{
		constructor() {
			super();
			this._widgets.push(new AchievementsWidget());
		}

		_update() {
			if (ui_version === 210301 && ui_section === "") {
				if (!this._element) {
					this._createElement();
				}
				if (!document.body.contains(this._element)) {
					let c_el = document.querySelector("div._25dpq>div._2GPX6>div>div._2tUeO");
					if (c_el) {
						while (c_el.firstChild) {
							c_el.lastChild.remove();
						}
						c_el.appendChild(this._element);
					}
				}
				this._updateLink();
			}
		}

		_createElement() {
			this._element = document.createElement("div");
			this._element.setAttribute("class", "dp-achievements-container");
			this._element.appendChild(this._widgets[0].element());
			this._link = document.createElement("a");
			this._link.setAttribute("class", "SEEvZ");
			this._link.appendChild(document.createTextNode(tr("View details")));
			{
				let arrow = document.createElement("span");
				arrow.setAttribute("class", "_3s9Ha _3LsFl _2jNpf _1G1lu");
				this._link.appendChild(arrow);
			}
			this._element.appendChild(this._link);
		}

		_updateLink() {
			let uname = u_data.user().name;
			if (uname) {
				this._link.setAttribute("href", "/profile/" + encodeURIComponent(u_data.user().name) + "/achievements");
			}
			else {
				this._link.removeAttribute("href");
			}
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
			this._manager    = manager;
			this.fetching    = false;
			this.pending     = false;
			this._controller = null;
		}

		fetch(user) {
			if (this.fetching && this._controller) {
				this._controller.abort();
			}
			this.pending = true;
			this.fetching = false;
			this._controller = new AbortController();
			return this._manager.asyncGet(this._param_key).then(function(param) {
				this.fetching = true;
				this.pending = false;
				return fetch(this._makeUrl(param), {
					method: "GET",
					headers: { "Content-Type": "application/json; charset=UTF-8" },
					credentials: "include",
					signal: this._controller.signal
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
				+ "?fields=username,courses,currentCourseId,creationDate,bio,hasRecentActivity15";
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

	u_data = new class
	{
		constructor(on_update, on_reset) {
			this.last_activity = null;
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

		update(user, soft) {
			if (!soft) {
				this._reset();
				this._on_reset();
			}
			{
				let err = { name: "Debug", message: "The request queue was reset" };
				this._handleQueue("user_id", null, err);
				this._handleQueue("user_name", null, err);
			}
			if (!user.id) user.id = 0;
			if (!user.name) user.name = "";
			this._data.user = user;
			this.last_activity = new Date();
			this._fetchData(this._sources.old_profile, true);
			this._fetchData(this._sources.new_profile, true);
			this._fetchData(this._sources.league, true);
			this._fetchData(this._sources.achievements, true);
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
			this._fetchData(source, false);
			return promise;
		}

		_reset() {
			this._data.user         = { id: 0, name: "" };
			this._data.created      = { str: "", date: 0 };
			this._data.streak       = { today: null, number: null, freeze: "" };
			this._data.freeze       = "";
			this._data.lingots      = null;
			this._data.sessions     = null;
			this._data.achievements = [];
			this._data.courses      = { list: [], id: null, skills: null };
			this._data.league       = null;
			this._data.bio          = "";
			this._data.online       = false;
		}

		_fetchData(source, force) {
			if (force || (!source.fetching && !source.pending)) {
				source.fetch(this._data.user).then(function(data) {
					this._handleData(data);
					this._on_update(this._data);
				}.bind(this));
			}
		}

		_handleData(data) {
			debug("Handle data", data._type);
			this.last_activity = new Date();
			if (data._error) {
				if (data._error.name !== "AbortError") {
					if (this._handleQueue(data._type, null, data._error) == 0) {
						if (data._error.name === "Debug") {
							debug(data._error.message);
						}
						else {
							err(data._error.message);
						}
					}
				}
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
					this._data.sessions       = data.calendar || [];
					this._data.courses.skills = null;
					if (data.language_data && data.learning_language) {
						let cc = data.language_data[data.learning_language];
						if (cc && cc.skills) {
							let count = 0;
							this._data.courses.skills = {};
							this._data.courses.skills.title = cc.language_string || null;
							this._data.courses.skills.language = data.learning_language;
							this._data.courses.skills.levels = cc.skills.reduce(function(levels, skill) {
								if (!skill.bonus) {
									let lvl = typeof(skill.levels_finished) == "number" ? skill.levels_finished : 0;
									levels[lvl] = (levels[lvl] || 0) + 1;
									++count;
								}
								return levels;
							}, []);
							this._data.courses.skills.count = count;
						}
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
		debug("Update user profile view", data.user);
		observe.stop();
		containers.forEach(function(c) {
			c.setData(data);
		});
		observe.start();
	}

	function tickContainers() {
		observe.stop();
		containers.forEach(function(c) {
			c.onTimer();
		});
		observe.start();
	}

// ---

	function try_update() {
		let uid    = null;
		let uname  = null;
		ui_version = 0;
		if ((uname = getUserName()) || (uid = getUserId())) {
			ui_version = getProfileVersion();
			if (ui_version !== 0) {
				let user = u_data.user();
				if ((uname && uname !== user.name) || (uid && uid !== user.id)) {
					u_data.update({ id: uid, name: uname });
				}
				else {
					update_profile_view(u_data.data());
				}
			}
		}
	}

// ---

	function getUserName() {
		let res = /^\/profile\/([a-zA-Z0-9._-]+)(\/(courses))?$/.exec(document.location.pathname);
		if (res) {
			ui_section = res[3] || "";
			return res[1];
		}
		return null;
	}

// ---

	function getUserId() {
		let res = /^\/u\/(\d+)$/.exec(document.location.pathname);
		if (res) {
			ui_section = "";
			return Number(res[1]);
		}
		return null;
	}

// ---

	function getProfileVersion() {
		let ver = 0;
		if (ui_section === "") {
			if (document.querySelector("div._91Tq4>div._6yLXC>div._2mVDz>h1[data-test='profile-username']"))
				ver = 210301; // March 2021; www, preview
		}
		else if (ui_section === "courses") {
			if (document.querySelector("div._3W86r._1Xlh1>div._3sLAg>div._2GPX6>div.BMuTY"))
				ver = 210301; // March 2021; www, preview
		}
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
		containers.push(new AchievementsContainer());

		observe = new MyObserver(try_update);
		observe.start();

		setTimeout(function() {
			duo = window && typeof(window.duo) === "object" && window.duo;
			if (!duo) {
				debug("The duo class is not available via window, so we will try to use Greasemonkey class to reach it");
				duo = unsafeWindow && typeof(unsafeWindow.duo) === "object" && unsafeWindow.duo || null;
			}
			try_update();
		}, 0);

		// The update timer only works if the tab is active
		let timer_id = null;
		let manage_timer = function() {
			if (document.visibilityState === "visible") {
				if (!timer_id) {
					timer_id = setInterval(function() {
						let la = u_data.last_activity;
						if (la && (new Date()) - la >= 5 * 60 * 1000) {
							// No more than every 5 minutes for the queries
							u_data.update(u_data.user(), true);
						}
						// Every minute for the widgets.
						// Only one widget currently uses this method and it does not make any request to the server.
						tickContainers();
					}, 1 * 60 * 1000);
					debug("The update timer has been started");
					let la = u_data.last_activity;
					if (la && (new Date()) - la >= 1 * 60 * 1000) {
						// The tab has just been activated and at least one minute has passed since the last update.
						tickContainers();
						u_data.update(u_data.user(), true);
					}
				}
			}
			else if (timer_id) {
				clearInterval(timer_id);
				timer_id = null;
				debug("The update timer has been stopped");
			}
		};
		document.addEventListener("visibilitychange", manage_timer);
		manage_timer();
	}

// ---

	if (document.readyState === "loading") {
		window.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

