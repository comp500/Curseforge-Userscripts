// ==UserScript==
// @name         Block mod button
// @version      0.1
// @description  Hides selected mods from Curseforge
// @author       comp500
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/minecraft/*
// @match        https://www.curseforge.com/Minecraft/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/blockmod.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/blockmod.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
	"use strict";

	let storage = {};
	if (localStorage.BlockMod != null) {
		try {
			storage = JSON.parse(localStorage.BlockMod);
		} catch (e) {
			console.error(e);
			storage = {};
		}
	}

	let modRegex = /\/minecraft\/mc-mods\/([a-z][\da-z\-_]{0,127})$/;

	GM_registerMenuCommand("List blocked mods", () => {
		alert(Object.keys(storage).join(", "));
	});

	GM_registerMenuCommand("Clear blocked mods", () => {
		storage = {};
		localStorage.BlockMod = JSON.stringify(storage);
		location.reload();
	});

	Array.from(document.querySelectorAll(".project-listing-row")).map(row => {
		for (let link of Array.from(row.getElementsByTagName("a")).filter(a => modRegex.test(a.href))) {
			let stored = link.href.replace("https://www.curseforge.com/minecraft/mc-mods/", "").replace("https://www.curseforge.com/Minecraft/mc-mods/", "");
			if (storage[stored] == "block") {
				if (row.parentNode != null) {
					row.parentNode.removeChild(row);
					break;
				}
			} else {
				if (link.querySelector(".text-lg") == null && link.querySelector(".font-bold") == null) {
					continue;
				}
				let blockLink = document.createElement("a");
				blockLink.href = "#";
				blockLink.innerText = "Block";
				blockLink.style.paddingLeft = "5px";
				blockLink.addEventListener("click", e => {
					storage[stored] = "block";
					localStorage.BlockMod = JSON.stringify(storage);
					e.preventDefault();
					row.parentNode.removeChild(row);
					return false;
				}, false);
				link.addEventListener("mouseenter", () => {
					link.parentNode.insertBefore(blockLink, link.nextSibling);
				}, false);
				let timeout = -1;
				link.addEventListener("mouseleave", () => {
					if (timeout > -1) {
						window.clearTimeout(timeout);
					}
					timeout = window.setTimeout(() => {
						link.parentNode.removeChild(blockLink);
					}, 1000);
				}, false);
			}
		}
	});
})();
