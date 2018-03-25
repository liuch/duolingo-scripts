// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.5.5
// @grant          none
// @description    This script displays additional information in the users' profile.
// @description:ru Этот скрипт показывает дополнительную информацию в профиле пользователей.
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_profile.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// @run-at         document-start
// ==/UserScript==

(function () {
	var wp_func = [];
	var wp_data = {};

	function get_exports(key) {
		if (wp_data[key])
			return wp_data[key].exports;
		var e = wp_data[key] = { exports: {}, id: key, loaded: false };
		wp_func[key].call(e.exports, e, e.exports, get_exports);
		e.loaded = true;
		return e.exports;
	}

	var ext_keys = [
		[ "mtWMg", "HttpQuery" ],
		[ "U7vGf", "React" ],
		[ "O27J2", "ReactDOM" ]
	];
	window.fc_ext_func = {};

	window.webpackJsonp = function(c_m, pack_data) {
		if (ext_keys.length) {
			for (var i in pack_data)
				wp_func[i] = pack_data[i];

			var tmp_array = [];
			for (i = 0; i < ext_keys.length; i++) {
				var f = ext_keys[i];
				if (wp_func[f[0]])
					window.fc_ext_func[f[1]] = get_exports(f[0]);
				else
					tmp_array.push(f);
			}
			ext_keys = tmp_array;
		}
	};
}());

function inject(f) { //Inject the script into the document
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duo-profile');
	script.textContent = '(' + f.toString() + ')()';
	document.head.appendChild(script);
}
inject(f);

function f() {
	var u_req, u_req2;
	var p_reg = new RegExp("^/([a-zA-Z0-9._-]+)$");
	var u_dat = {};
	var React, ReactDOM;

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

	function FreezeElement() {
		if (!u_dat.freeze.length)
			return null;

		var style1 = {
			width: "18px",
			height: "25px",
			margin: "0",
			float: "none",
			"background-position": "-80px -6px",
			"background-size": "180px auto",
			"vertical-align": "middle"
		};
		var style2 = {
			"vertical-align": "middle"
		};
		return React.createElement("div", null, [
			React.createElement("span", { className: "_3PGD5 _1m3JK", style: style1 }),
			React.createElement("span", { className: "_1cHvL", style: style2 }, (new Date(u_dat.freeze.replace(" ", "T"))).toLocaleDateString())
		]);
	}

	function StreakElement() {
		return React.createElement("div", null, [
			React.createElement("h2", { style: { "margin-bottom": "10px" } }, tr("Streak")),
			React.createElement("span", { className: "_62zln _1L-uo cCL9P" }),
			React.createElement("span", { className: "_1cHvL", id: "dp_streak_days" }, [
				React.createElement("strong", null, u_dat.streak),
				" " + tr("days")
			])
		]);
	}

	function StorageElement() {
		var elem  = "h3";
		var props = null;
		if (u_dat.version == 2) {
			elem  = "h2";
			props = { style: { "margin-bottom": "10px" } };
		}
		return React.createElement(elem, props, tr("Storage"));
	}

	function LingotsElement() {
		return React.createElement("div", null, [
			React.createElement("span", { className: "_1yWWS _3SHvM cCL9P" }),
			React.createElement("span", { className: "_1cHvL" }, [
				React.createElement("strong", null, u_dat.lingots === null ? "-" : u_dat.lingots)
			])
		]);
	}

	var starNumClasses = [
		[ "_35-xP dw2F4", "_1vlZ7 _35-xP dw2F4" ],
		[ "ZKmUJ dw2F4", "_3OP3B ZKmUJ dw2F4" ],
		[ "tD042 dw2F4", "CIzSZ tD042 dw2F4" ]
	];
	var starOnClasses = [ "_2cOts", "_28huv", "_3UINz" ];

	function StarItem(num, on) {
		var on_str = on ? starOnClasses[num-1] + " " : "";
		return React.createElement("div", null, [
			React.createElement("div", { className: on_str + starNumClasses[num-1][0] }),
			React.createElement("div", { className: on_str + starNumClasses[num-1][1] })
		]);
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
				"", "", "", ""
			]
		},
		clubs: {
			name: "Inner Circle",
			description: [
				"", "", "", ""
			]
		}
	};

	function AchievementItem(achievement, margin) {
		var item;
		var classes = achievementClass[achievement.name];
		if (classes) {
			var cl = { className: "VHE7v" };
			if (margin)
				cl.style = { "margin-bottom": "10px" };
			var tier = achievement.tier;
			item = React.createElement("div", cl, [
				React.createElement("div", { className: "_3xN15 " + classes }, [
					StarItem(1, tier >= 1),
					StarItem(2, tier >= 2),
					StarItem(3, tier >= 3)
				])
			]);
		}
		else
			console.warn("Unknown achievement:", achievement.name);
		return item;
	}

	function AchievementsElement() {
		var items = [];
		var item;
		for (var i = 0; i < u_dat.achievements.length; ++i) {
			item = AchievementItem(u_dat.achievements[i], true);
			if (item)
				items.push(item);
		}
		return React.createElement("div", null, [
			React.createElement("hr", { className: "_2rgts" }),
			React.createElement("h1", { className: "_1Cjfg" }, tr("Achievements")),
			React.createElement("div", { className: "QZc9N" }, items)
		]);
	}

	function AchievementsElementExtra(names) {
		var items = [];
		var item;
		var achv, ach_n;
		var name, desc;
		for (var i = 0; i < u_dat.achievements.length; ++i) {
			if (names.indexOf(u_dat.achievements[i].name) != -1) {
				item = AchievementItem(u_dat.achievements[i]);
				if (item) {
					achv = u_dat.achievements[i];
					name = achv.name;
					ach_n = achievementNames[name];
					name = ach_n.name || ("Unknown (" + name + ")");
					desc = ach_n.description[achv.tier] || "";
					item = React.createElement("li", { className: "f4TL7" }, [
						item,
						React.createElement("div", { className: "_2g1FE" }),
						React.createElement("div", { className: "_2ANoo" }, [
							React.createElement("div", { className: "_1JLPg" }, name),
							React.createElement("div", { className: "_3zECl" }, desc),
							React.createElement("div", { className: "_17f4c" })
						])
					]);
					items.push(item);
				}
			}
		}
		return React.createElement("div", null, [
			React.createElement("h1", null, tr("Hidden achievements")),
			React.createElement("ul", null, items)
		]);
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
		if (c_el) {
			if (u_dat.achievements.length) {
				if (achiv_extra.length == 0)
					ReactDOM.render(AchievementsElement(), c_el);
				else
					ReactDOM.render(AchievementsElementExtra(achiv_extra), c_el);
			}
			else
				while (c_el.firstChild)
					c_el.removeChild(c_el.firstChild);
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
					ReactDOM.render(StreakElement(), c_el);
				}
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
			ReactDOM.render(React.createElement("div", null, [
				FreezeElement(),
				React.createElement("div", { className: "_2QmPh" }, [
					StorageElement(),
					LingotsElement()
				]),
				React.createElement("div", (u_dat.version == 2) && { className: "_2QmPh" } || null)
			]), c_el);
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
			ReactDOM.render(React.createElement("ul", { style: { "border-top": "2px solid #dadada", display: "table", width: "100%", "margin-top": "30px" } }, [
				React.createElement("li", { style: { display: "table-cell", padding: "12px 10px 0 0" } }, "Blocking: " + u_dat.blocking),
				React.createElement("li", { style: { display: "table-cell", padding: "12px 10px 0 0" } }, "Blockers: " + u_dat.blockers)
			]), c_el);
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
		u_dat.blockers     = 0;
		u_dat.blocking     = 0;
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
		if (!u_req)
			u_req = fc_ext_func.HttpQuery.create({ baseURL: "https://www.duolingo.com/users", headers: headers });
		if (!u_req2)
			u_req2 = fc_ext_func.HttpQuery.create({ baseURL: "https://www.duolingo.com/2017-06-30/users", headers: headers });

		try {
			u_req.get(uname).then(function(d) {
				u_dat.version  = version;
				u_dat.id       = d.data.id || 0;
				u_dat.created  = d.data.created && d.data.created.trim() || "n/a";
				u_dat.username = d.data.username && d.data.username.trim() || "n/a";
				u_dat.streak   = d.data.site_streak || 0;
				u_dat.freeze   = d.data.inventory && d.data.inventory.streak_freeze || "";
				u_dat.lingots  = d.data.rupees || 0;
				u_dat.st_today = d.data.streak_extended_today || false;
				u_dat.blockers = d.data.blockers && d.data.blockers.length || 0;
				u_dat.blocking = d.data.blocking && d.data.blocking.length || 0;
				u_req2.get("" + u_dat.id + "?fields=_achievements").then(function(d) {
					u_dat.achievements = d.data._achievements || [];
					update_profile_view();
				});
			});
		}
		catch (e) {
			console.error("Failed to get the user data");
		}
	}

	function try_update() {
		if (!fc_ext_func || !fc_ext_func.HttpQuery || !fc_ext_func.React || !fc_ext_func.ReactDOM)
			return;

		React = fc_ext_func.React;
		ReactDOM = fc_ext_func.ReactDOM;
		var user_name = getUserName();
		if (user_name) {
			var profile_ver = getProfileVersion();
			if (profile_ver > 0) {
				get_user_data(user_name, profile_ver);
			}
		}
	}

	function set_observe() {
		var root_el = document.getElementsByTagName("body")[0];
		if (root_el) {
			var observer = new MutationObserver(function(mutations) {
				try_update();
			});
			observer.observe(root_el, { childList: true, subtree: true });
		}
	}

	clear_data();
	setTimeout(set_observe, 100);
}
