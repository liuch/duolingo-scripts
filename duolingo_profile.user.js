// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.6.2
// @grant          none
// @description    This script displays additional information in the users' profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профиле пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// @run-at         document-start
// ==/UserScript==

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

		set: function(func) {
			this.root_el = document.getElementsByTagName("body")[0];
			if (this.root_el) {
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
			this.observer.observe(this.root_el, { childList: true, subtree: true });
		},

		stop: function() {
			this.observer.disconnect();
		}
	};

	var p_reg = new RegExp("^/([a-zA-Z0-9._-]+)$");
	var u_dat = {};

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
		}
	};

	function tr(t) {
		if (typeof(duo) == "object" && typeof(duo.uiLanguage) == "string" && trs[t] && trs[t][duo.uiLanguage])
			return trs[t][duo.uiLanguage];
		return t;
	}

	function getUserName() {
		var res = p_reg.exec(document.location.pathname);
		return res && res[1] || null;
	}

	function getProfileVersion() {
		if (document.querySelector("._2RO1n>div>div>h1[data-test='profile-username']"))
			return 1;
		if (document.querySelector("._2RO1n>div>._2MEyI>._2IGH->h1[data-test='profile-username']"))
			return 2;
		return 0;
	}

	var style1 = "width:18px;height:25px;margin:0;float:none;background-position:-80px -6px;background-size:180px auto;vertical-align:middle;";
	var style2 = "vertical-align:middle;margin-left:0.5em;";

	function append_freeze_elements(p_el) {
		if (u_dat.freeze.length) {
			var el = document.createElement("span");
			el.setAttribute("class", "_3PGD5 _1m3JK");
			el.setAttribute("style", style1);
			p_el.appendChild(el);
			el = document.createElement("span");
			el.setAttribute("style", style2);
			el.appendChild(document.createTextNode((new Date(u_dat.freeze.replace(" ", "T"))).toLocaleDateString()));
			p_el.appendChild(el);
		}
	}

	function append_streak_elements(p_el) {
		var el = document.createElement("h2");
		el.setAttribute("style", "margin-bottom:10px;");
		el.appendChild(document.createTextNode(tr("Streak")));
		p_el.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("class", "_62zln _1L-uo cCL9P");
		p_el.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("style", style2);
		el.setAttribute("id", "dp_streak_days");
		var el2 = document.createElement("strong");
		el2.appendChild(document.createTextNode(u_dat.streak));
		el.appendChild(el2);
		el.appendChild(document.createTextNode(" " + tr("days")));
		p_el.appendChild(el);
	}

	function append_storage_element(p_el) {
		var el = null;
		if (u_dat.version == 2) {
			el = document.createElement("h2");
			el.setAttribute("style", "margin-bottom:10px;");
		}
		else
			el = document.createElement("h3");
		el.appendChild(document.createTextNode(tr("Storage")));
		p_el.appendChild(el);
	}

	function append_lingot_elements(p_el) {
		var el = document.createElement("span");
		el.setAttribute("class", "_1yWWS _3SHvM cCL9P");
		p_el.appendChild(el);
		el = document.createElement("span");
		el.setAttribute("style", style2);
		var el2 = document.createElement("strong");
		el2.appendChild(document.createTextNode(u_dat.lingots === null ? "-" : u_dat.lingots));
		el.appendChild(el2);
		p_el.appendChild(el);
	}

	var starNumClasses = [
		[ "_35-xP dw2F4", "_1vlZ7 _35-xP dw2F4" ],
		[ "ZKmUJ dw2F4", "_3OP3B ZKmUJ dw2F4" ],
		[ "tD042 dw2F4", "CIzSZ tD042 dw2F4" ]
	];
	var starOnClasses = [ "_2cOts", "_28huv", "_3UINz" ];

	function create_star_element(num, on) {
		var star_el = document.createElement("div");
		var on_str = on ? starOnClasses[num-1] + " " : "";
		var el = document.createElement("div");
		el.setAttribute("class", on_str + starNumClasses[num-1][0]);
		star_el.appendChild(el);
		el = document.createElement("div");
		el.setAttribute("class", on_str + starNumClasses[num-1][1]);
		star_el.appendChild(el);
		return star_el;
	}

	var achievementClass = {
		streak:      "_2wzQU",
		completion:  "_16Aal",
		social:      "_23nCr",
		xp:          "_3dC1N",
		gold_skills: "UN9bj",
		spending:    "_3bUu2",
		time:        "_2mfXg",
		perfect:     "_1D0uS",
		clubs:       "_1B8a8",
		items:       "_1d2qa"
	};

	var achievementNames = {
		items: {
			name: "Wizard",
			description: [
				"Equip a Streak Freeze",
				"Equip a Weekend Amulet",
				"Win a Double or Nothing wager",
				"You won a Double or Nothing wager"
			]
		},
		clubs: {
			name: "Inner Circle",
			description: [
				"Join or create a Club",
				"Get to the top of your Club's leaderboard",
				"Become your Club's weekly winner",
				"You became your Club's weekly winner"
			]
		}
	};

	function create_achievement_item_element(achievement, margin) {
		var item;
		var classes = achievementClass[achievement.name];
		if (classes) {
			var tier = achievement.tier;
			item = document.createElement("div");
			item.setAttribute("class", "VHE7v");
			if (margin)
				item.setAttribute("style", "margin-bottom:10px;");
			var el = document.createElement("div");
			el.setAttribute("class", "_3xN15 " + classes);
			el.appendChild(create_star_element(1, tier >= 1));
			el.appendChild(create_star_element(2, tier >= 2));
			el.appendChild(create_star_element(3, tier >= 3));
			item.appendChild(el);
		}
		else
			console.warn("Unknown achievement:", achievement.name);
		return item;
	}

	function append_achievement_elements(p_el) {
		var items = [];
		var item;
		for (var i = 0; i < u_dat.achievements.length; ++i) {
			item = create_achievement_item_element(u_dat.achievements[i], true);
			if (item)
				items.push(item);
		}
		var el = document.createElement("hr");
		el.setAttribute("class", "_2rgts");
		p_el.appendChild(el);
		el = document.createElement("h1");
		el.setAttribute("class", "_1Cjfg");
		el.appendChild(document.createTextNode(tr("Achievements")));
		p_el.appendChild(el);
		el = document.createElement("div");
		el.setAttribute("class", "QZc9N");
		for (var i = 0; i < items.length; ++i) {
			el.appendChild(items[i]);
		}
		p_el.appendChild(el);
	}

	function append_extra_achievement_elements(names, p_el) {
		var items = [];
		var item, li, div1, div2;
		var achv, ach_n;
		var name, desc;
		for (var i = 0; i < u_dat.achievements.length; ++i) {
			if (names.indexOf(u_dat.achievements[i].name) != -1) {
				item = create_achievement_item_element(u_dat.achievements[i], false);
				if (item) {
					achv = u_dat.achievements[i];
					name = achv.name;
					ach_n = achievementNames[name];
					name = ach_n.name || ("Unknown (" + name + ")");
					desc = ach_n.description[achv.tier] || "";
					li = document.createElement("li");
					li.setAttribute("class", "f4TL7");
					li.appendChild(item);
					div1 = document.createElement("div");
					div1.setAttribute("class", "_2g1FE");
					li.appendChild(div1);
					div1 = document.createElement("div");
					div1.setAttribute("class", "_2ANoo");
					div2 = document.createElement("div");
					div2.setAttribute("class", "_1JLPg");
					div2.appendChild(document.createTextNode(name));
					div1.appendChild(div2);
					div2 = document.createElement("div");
					div2.setAttribute("class", "_3zECl");
					div2.appendChild(document.createTextNode(desc));
					div1.appendChild(div2);
					div2 = document.createElement("div");
					div2.setAttribute("class", "_17f4c");
					div1.appendChild(div2);
					li.appendChild(div1);
					items.push(li);
				}
			}
		}
		var h1 = document.createElement("h1");
		h1.appendChild(document.createTextNode(tr("Hidden achievements")));
		p_el.appendChild(h1);
		var ul = document.createElement("h1");
		for (var i = 0; i < items.length; ++i) {
			ul.appendChild(items[i]);
		}
		p_el.appendChild(ul);
	}

	function remove_all_children(par) {
		while (par.firstChild) {
			par.removeChild(par.firstChild);
		}
	}

	function update_profile_view() {
		var c_el;
		var d_el;
		// Created
		var b_el = document.querySelector("h1[data-test='profile-username']");
		if (b_el) {
			d_el = document.getElementById("dp-created-info");
			if (u_dat.created.length) {
				if (!d_el) {
					d_el = document.createElement("p");
					d_el.setAttribute("id", "dp-created-info");
					d_el.appendChild(document.createTextNode(tr("Registered:") + " " + u_dat.created));
					d_el.setAttribute("style", "color:gray;");
					b_el.parentNode.insertBefore(d_el, b_el.nextSibling);
				}
			}
			else if (d_el)
				d_el.remove();
		}
		// Achievements
		var achiv_extra = [];
		c_el = null;
		if (u_dat.version == 1 || !document.querySelector("._3MT-S>div>._1E3L7>._2RO1n>._2GU1P>._1SrQO>h1._1Cjfg")) {
			c_el = document.getElementById("dp-container-achiv");
			if (!c_el) {
				b_el = document.querySelector("._3MT-S>div>._1E3L7>._2RO1n");
				if (b_el) {
						c_el = document.createElement("div");
						c_el.setAttribute("id", "dp-container-achiv");
						b_el.appendChild(c_el);
				}
			}
		}
		else {
			b_el = document.querySelector("._3MT-S>div>._1E3L7>._2RO1n>._2GU1P>._3jMdg>.zyezv>ul");
			if (b_el) {
				for (var k in achievementClass) {
					if (!b_el.querySelector("." + achievementClass[k]))
						achiv_extra.push(k);
				}
				b_el = b_el.parentElement;
				c_el = document.getElementById("dp-container-achiv-extra");
				if (!c_el) {
					c_el = document.createElement("div");
					c_el.setAttribute("id", "dp-container-achiv-extra");
					b_el.appendChild(c_el);
				}
			}
		}
		var el;
		if (c_el) {
			remove_all_children(c_el);
			if (u_dat.achievements.length) {
				if (achiv_extra.length == 0) {
					el = document.getElementById("dp-container-achiv-extra");
					append_achievement_elements(c_el);
				}
				else {
					el = document.getElementById("dp-container-achiv");
					append_extra_achievement_elements(achiv_extra, c_el);
				}
				if (el)
					remove_all_children(el);
			}
		}
		// Streak, Freeze and Lingots
		if (u_dat.version == 2) {
			b_el = document.querySelector("._2_lzu>.a5SW0>h2");
			if (b_el) {
				c_el = document.getElementById("dp-container0");
				if (!c_el) {
					c_el = document.createElement("div");
					c_el.setAttribute("id", "dp-container0");
					b_el.parentNode.insertBefore(c_el, b_el);
				}
				else
					remove_all_children(c_el);
				append_streak_elements(c_el);
			}
			b_el = document.getElementById("dp_streak_days");
		} else
			b_el = document.querySelector("._2_lzu>.a5SW0>._2QmPh>._1cHvL");
		if (b_el) {
			d_el = document.getElementById("dp-steak-today");
			if (u_dat.st_today) {
				if (!d_el) {
					d_el = document.createElement("span");
					d_el.setAttribute("id", "dp-steak-today");
					d_el.setAttribute("class", "RWiDH _3wurl cCL9P");
					d_el.setAttribute("style", "margin:9px 0 0 -11px;");
					b_el.parentNode.insertBefore(d_el, b_el);
				}
			} else if (d_el)
				d_el.remove();
			c_el = document.getElementById("dp-container1");
			if (!c_el) {
				c_el = document.createElement("div");
				c_el.setAttribute("id", "dp-container1");
				b_el.parentNode.appendChild(c_el);
			}
			append_freeze_elements(c_el);
			el = document.createElement("div");
			el.setAttribute("class", "_2QmPh");
			append_storage_element(el);
			append_lingot_elements(el);
			c_el.appendChild(el);
			if (u_dat.version == 2) {
				el = document.createElement("div");
				el.setAttribute("class", "_2QmPh");
				c_el.appendChild(el);
			}
		}
		// Blockinig / Blockers
		b_el = document.querySelector("._2_lzu>.a5SW0>._1JZEb");
		if (b_el) {
			c_el = document.getElementById("dp-container2");
			if (!c_el) {
				c_el = document.createElement("div");
				c_el.setAttribute("id", "dp-container2");
				b_el.parentNode.appendChild(c_el);
			}
			else
				remove_all_children(c_el);
			var ul_el = document.createElement("ul");
			ul_el.setAttribute("style", "border-top:2px solid #dadada;display:table;width:100%;margin-top:30px;");
			var li_el = document.createElement("li");
			li_el.setAttribute("style", "display:table-cell;padding:12px 10px 0 0;");
			li_el.appendChild(document.createTextNode(tr("Blocking") + ": " + ((u_dat.blocking == -1) && "n/a" || u_dat.blocking)));
			ul_el.appendChild(li_el);
			li_el = document.createElement("li");
			li_el.setAttribute("style", "display:table-cell;padding:12px 10px 0 0;");
			li_el.appendChild(document.createTextNode(tr("Blockers") + ": " + ((u_dat.blockers == -1) && "n/a" || u_dat.blockers)));
			ul_el.appendChild(li_el);
			c_el.appendChild(ul_el);
		}
	}

	function clear_data() {
		u_dat.version      = 0;
		u_dat.id           = 0;
		u_dat.username     = "";
		u_dat.created      = "";
		u_dat.streak       = null;
		u_dat.freeze       = "";
		u_dat.lingots      = null;
		u_dat.st_today     = false;
		u_dat.blockers     = -1;
		u_dat.blocking     = -1;
		u_dat.achievements = [];
	}

	var headers = {
		"Content-Type": "application/json; charset=UTF-8"
	};

	function get_user_data(uname, version) {
		if (uname == u_dat.user_name) {
			update_profile_view();
			return;
		}

		clear_data();
		u_dat.user_name = uname;
		window.fetch("https://www.duolingo.com/users/" + uname, {
			method: "GET",
			headers: headers,
			credentials: "include"
		}).then(function(resp) {
			if (resp.status !== 200)
				throw new Error("Failed to fetch the user data");
			return resp.json();
		}).then(function(d) {
			u_dat.version  = version;
			u_dat.id       = d.id || 0;
			u_dat.created  = d.created && d.created.trim() || "n/a";
			u_dat.username = d.username && d.username.trim() || "n/a";
			u_dat.streak   = d.site_streak || 0;
			u_dat.freeze   = d.inventory && d.inventory.streak_freeze || "";
			u_dat.lingots  = d.rupees || 0;
			u_dat.st_today = d.streak_extended_today || false;
			u_dat.blockers = !d.blockers && -1 || d.blockers.length;
			return window.fetch("https://www.duolingo.com/2017-06-30/users/" + u_dat.id + "?fields=_achievements,blockedUserIds", {
				method: "GET",
				headers: headers,
				credentials: "include"
			});
		}).then(function(resp) {
			if (resp.status !== 200)
				throw new Error("Failed to fetch the user's achivements");
			return resp.json();
		}).then(function(d) {
			u_dat.achievements = d && d._achievements || [];
			u_dat.blocking     = !d.blockedUserIds && -1 || d.blockedUserIds.length;
		}).catch(function(err) {
				console.warn(err.message);
		}).then(function(d) {
			update_profile_view();
		});
	}

	function try_update() {
		var user_name = getUserName();
		if (user_name) {
			var profile_ver = getProfileVersion();
			if (profile_ver > 0) {
				get_user_data(user_name, profile_ver);
			}
		}
	}

	clear_data();
	try_update();
	observe.set(try_update);
	observe.start();
}

