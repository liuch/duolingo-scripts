// ==UserScript==
// @name           DuoProfile
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.4.1
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
	var u_req;
	var p_reg = new RegExp("^/([a-zA-Z0-9._-]+)$");
	var u_dat = {};
	var React, ReactDOM;
	var upd_dom = 0;

	var trs = {
		"Registered:" : {
			"ru" : "Зарегистрирован(а):",
			"uk" : "Зареєстрований(а):"
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

	function isProfilePage() {
		var r = p_reg.exec(document.location.pathname);
		if (r) {
			if (document.querySelector("._2_lzu>.a5SW0>.-Esnq")) {
				var uname = r[1];
				return uname;
			}
		}
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
			React.createElement("span", { className: "_1m3JK", style: style1 }),
			React.createElement("span", { className: "_32wO4", style: style2 }, (new Date(u_dat.freeze.replace(" ", "T"))).toLocaleDateString())
		]);
	}

	function LingotsElement() {
		return React.createElement("div", null, [
			React.createElement("span", { className: "_1yWWS _3SHvM cCL9P" }),
			React.createElement("span", { className: "_32wO4" }, [
				React.createElement("strong", null, u_dat.lingots)
			])
		]);
	}

	function update_profile_view() {
		var b_el = document.querySelector("h1[data-test='profile-username']");
		var d_el = document.getElementById("dp-created-info");
		if (b_el && !d_el) {
			d_el = document.createElement("p");
			d_el.setAttribute("id", "dp-created-info");
			d_el.appendChild(document.createTextNode(tr("Registered:") + " " + u_dat.created));
			d_el.setAttribute("style", "color:gray;");
			b_el.parentNode.insertBefore(d_el, b_el.nextSibling);
		}
		b_el = document.querySelector("._2_lzu>.a5SW0>.-Esnq>._32wO4");
		d_el = document.getElementById("dp-steak-today");
		if (u_dat.st_today) {
			if (b_el && !d_el) {
				d_el = document.createElement("span");
				d_el.setAttribute("id", "dp-steak-today");
				d_el.setAttribute("class", "RWiDH _3wurl cCL9P");
				d_el.setAttribute("style", "margin:9px 0 0 -11px;");
				b_el.parentNode.insertBefore(d_el, b_el);
			}
		}
		else if (d_el)
			d_el.remove();

		var c_el = document.getElementById("dp-container1");
		if (!c_el) {
			c_el = document.createElement("div");
			c_el.setAttribute("id", "dp-container1");
			b_el.parentNode.appendChild(c_el);
		}
		ReactDOM.render(React.createElement("div", null, [
			FreezeElement(),
			React.createElement("div", { className: "-Esnq" }, [
				React.createElement("h3", { className: "_2463T" }, tr("Storage")),
				LingotsElement()
			])
		]), c_el);

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
		u_dat.id       = 0;
		u_dat.username = "";
		u_dat.created  = "";
		u_dat.freeze   = "";
		u_dat.lingots  = 0;
		u_dat.st_today = false;
		u_dat.blockers = 0;
		u_dat.blocking = 0;
	}

	function get_user_data(uname) {
		if (uname == u_dat.user_name)
			return;

		clear_data();
		u_dat.user_name = uname;
		if (!u_req)
			u_req = fc_ext_func.HttpQuery.create({ baseURL: "https://www.duolingo.com/users", headers: { "Content-Type": "application/json; charset=UTF-8" } });

		try {
			u_req.get(uname).then(function(d) {
				u_dat.id       = d.data.id || 0;
				u_dat.created  = d.data.created && d.data.created.trim() || "n/a";
				u_dat.username = d.data.username && d.data.username.trim() || "n/a";
				u_dat.freeze   = d.data.inventory && d.data.inventory.streak_freeze || "";
				u_dat.lingots  = d.data.rupees || 0;
				u_dat.st_today = d.data.streak_extended_today || false;
				u_dat.blockers = d.data.blockers && d.data.blockers.length || 0;
				u_dat.blocking = d.data.blocking && d.data.blocking.length || 0;
				window.fc_callback = window.fc_callback && (window.fc_callback + 1) || 1;
				update_profile_view();
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
		var user_name = isProfilePage();
		if (user_name) {
			get_user_data(user_name);
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
