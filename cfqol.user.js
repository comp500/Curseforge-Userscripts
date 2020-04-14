// ==UserScript==
// @name         Curseforge QOL Fixes
// @version      0.14
// @description  Various Quality of Life improvements to the Curseforge website
// @author       comp500
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/cfqol.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/cfqol.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
	"use strict";

	// Change the Browse link and the default Minecraft tab (from other links) to /minecraft/mc-mods
	let regexBrowse = /^http:\/\/bit.ly\/2Lzpfsl|https:\/\/www.curseforge.com\/minecraft\/?$/;
	Array.from(document.getElementsByTagName("a"))
		.filter(a => regexBrowse.test(a.href))
		.forEach(a => {
			a.href = "https://www.curseforge.com/minecraft/mc-mods";
		});

	// Add a search box
	let searchBoxContainer = document.createElement("div");
	searchBoxContainer.className = "flex mr-4 items-center";
	// Get the current assets path
	let styleSheet = Array.from(document.styleSheets).find(s => /\/Content\/([\d\-]+)\//.test(s.href));
	let assetsPath = styleSheet == null ? "2-0-7179-35052" : /\/Content\/([\d\-]+)\//.exec(styleSheet.href)[1];
	searchBoxContainer.innerHTML = `<form action="/minecraft/mc-mods/search" method="get" novalidate="novalidate" autocomplete="false" style="width:100%">
    <div class="flex flex-col h-full justify-between">
         <div class="input input--icon" style="color: #000">
            <i class="search textgray-900 flex items-center justify-center">
                <svg class="icon" viewBox="0 0 20 20" width="16" height="16"><use xlink:href="/Content/${assetsPath}/Skins/CurseForge/images/twitch/Object/Search.svg#Object/Search"></use></svg>
            </i>
            <input type="text" name="search" id="cfqolTopbarSearch" placeholder="Search Mods">
        </div>
    </div></form>`;
	let insertLocation = document.querySelector(".curseforge-header .ml-auto > div");
	if (insertLocation != null && insertLocation.firstChild != null) {
		// @Inject(method = "the navbar", at = @At("HEAD"))
		insertLocation.insertBefore(searchBoxContainer, insertLocation.firstChild);

		// Make the search box magically grow
		let searchBox = searchBoxContainer.querySelector("#cfqolTopbarSearch");
		if (searchBox != null) {
			// Fix stupid flexboxes - set to flex-grow 1 flex-shrink 0
			searchBoxContainer.style.flex = "1 0";
			searchBoxContainer.parentNode.parentNode.style.flex = "1 0";

			let navLinksContainer = document.querySelector(".top-nav__nav-link").parentNode;
			navLinksContainer.style.transition = "opacity 0.4s, max-width 0.3s";
			navLinksContainer.style.overflowX = "hidden";
			searchBox.style.transition = "";
			searchBox.addEventListener("focus", e => {
				navLinksContainer.style.opacity = 0;
				navLinksContainer.style.maxWidth = "0";
			});
			searchBox.addEventListener("blur", e => {
				navLinksContainer.style.opacity = 1;
				navLinksContainer.style.maxWidth = "2000px";
			});
			// Make the search icon focus the search box
			let searchIcon = searchBoxContainer.querySelector(".search");
			if (searchIcon != null) {
				searchIcon.addEventListener("click", e => {
					searchBox.focus();
				});
			}
		}
	}

	// Hide useless links, to save space
	let uselessLinks = ["Minecraft Forums"];
	Array.from(document.querySelectorAll(".top-nav__nav-link"))
		.filter(n => uselessLinks.includes(n.innerText))
		.forEach(n => n.parentNode.removeChild(n));

	// Add an "All Files" tab for mods
	let modPathMatches = /\/minecraft\/mc-mods\/([a-z][\da-z\-_]{0,127})/.exec(document.location.pathname);
	let filesTab = document.getElementById("nav-files");
	if (modPathMatches != null && modPathMatches.length == 2 && filesTab != null) {
		let modSlug = modPathMatches[1];
		let modAllFiles = document.createElement("li");
		let isAllFilesPage = /\/minecraft\/mc-mods\/[a-z][\da-z\-_]{0,127}\/files\/all/.test(
			document.location.pathname
		);
		if (isAllFilesPage) {
			modAllFiles.className =
				"border-b-2 border-primary-500 b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
			filesTab.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
		} else {
			modAllFiles.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
		}
		modAllFiles.innerHTML = `<a href="/minecraft/mc-mods/${modSlug}/files/all" class="text-${
			isAllFilesPage ? "primary" : "gray"
		}-500 hover:no-underline">
            <span class="b-list-label">
                All Files
            </span>
        </a>`;
		filesTab.parentNode.insertBefore(modAllFiles, filesTab.nextSibling);
	}

  // Add an "All Files" tab for modpacks
  let packPathMatches = /\/minecraft\/modpacks\/([a-z][\da-z\-_]{0,127})/.exec(document.location.pathname);
  if (packPathMatches != null && packPathMatches.length == 2 && filesTab != null) {
	  let packSlug = packPathMatches[1];
	  let packAllFiles = document.createElement("li");
	  let isAllFilesPage = /\/minecraft\/modpacks\/[a-z][\da-z\-_]{0,127}\/files\/all/.test(
		  document.location.pathname
	  );
	  if (isAllFilesPage) {
		  packAllFiles.className =
			  "border-b-2 border-primary-500 b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
		  filesTab.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
	  } else {
		  packAllFiles.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
	  }
	  packAllFiles.innerHTML = `<a href="/minecraft/modpacks/${packSlug}/files/all" class="text-${
		  isAllFilesPage ? "primary" : "gray"
	  }-500 hover:no-underline">
		  <span class="b-list-label">
			  All Files
		  </span>
	  </a>`;
	  filesTab.parentNode.insertBefore(packAllFiles, filesTab.nextSibling);
  }

	// Add pagination to the bottom of the page in dependency lists
	let dependenciesPage = document.querySelector(".project-dependencies-page > div");
	if (dependenciesPage != null) {
		let paginationTop = document.querySelector(".project-dependencies-page > div .pagination-top");
		if (paginationTop != null) {
			dependenciesPage.appendChild(paginationTop.parentNode.cloneNode(true)).classList.remove("mb-4");
		}
	}

	// Skip download countdowns
	let downloadScript = Array.from(document.scripts).find(s => s.innerText != null && s.innerText.includes("PublicProjectDownload.countdown"));
	if (downloadScript != null && downloadScript.innerText != null) {
		let matches = downloadScript.innerText.match(/countdown\("(.+)"\)/);
		if (matches != null && matches[1] != null) {
			// Break the existing script
			let countdownEl = document.querySelector("span[data-countdown-seconds]");
			if (countdownEl != null) {
				// UNSAFE if grant != none! For some reason jQuery stores data in itself rather than attrs?!
				jQuery.removeData(countdownEl, "countdown-seconds");
			}
			
			let downloadText = document.querySelector("p[data-countdown-timer]");
			if (downloadText != null) {
				downloadText.innerText = "Downloading now...";
			}
			
			window.location.href = matches[1];
		}
	}
	// Better method for skipping, if links contain file ID already
	let regexDownloadLink = /^https:\/\/www.curseforge.com\/.*\/download\/\d+$/;
	Array.from(document.getElementsByTagName("a"))
		.filter(a => regexDownloadLink.test(a.href))
		.forEach(a => {
			a.href = a.href + "/file";
		});

	// Readd download buttons for modpacks
	Array.from(document.querySelectorAll("a.button")).filter(l => 
		l.pathname.startsWith("/minecraft/modpacks") && l.href.endsWith("?client=y")
	).map(link => {
		let newHref = link.href.slice(0, -9);
		if (regexDownloadLink.test(newHref)) {
			newHref = newHref + "/file";
		}

		if (link.classList.contains("button--icon-only")) {
			// All Files list

			let newLink = link.cloneNode(true);
			newLink.href = newHref;
			newLink.classList.add("button--hollow");
			newLink.classList.add("mr-2");

			let icon = newLink.querySelector(".icon");
			if (icon != null) {
				icon.parentNode.innerHTML = `<svg class="icon icon-fixed-width icon-margin" viewBox="0 0 20 20" width="18" height="18">
					<use xlink:href="/Content/${assetsPath}/Skins/CurseForge/images/twitch/Action/Download.svg#Action/Download"></use>
				</svg>`;
			}
			if (link.parentNode != null) {
				link.parentNode.insertBefore(newLink, link);
			}
		} else if (link.querySelector(".button__text") != null) {
			// Full text buttons

			let newButton = link.parentNode.cloneNode(true);
			// "Main file" buttons have ml-2 on the right button, while the rest have px-1 on both
			if (link.parentNode.classList == null || !link.parentNode.classList.contains("px-1")) {
				link.parentNode.classList.add("ml-2");
			}
			let newLink = newButton.querySelector("a.button");
			newLink.classList.add("button--hollow");
			newLink.href = newHref;

			// Buttons at the top of the page have mr-1 on the install icon, and no icon on the Download button
			let svgEl = newLink.querySelector("svg.mr-1");
			if (svgEl == null) {
				newLink.innerHTML = `<span class="button__text">
					<svg class="icon icon-margin" viewBox="0 0 20 20" width="18" height="18">
						<use xlink:href="/Content/${assetsPath}/Skins/CurseForge/images/twitch/Action/Download.svg#Action/Download"></use>
					</svg> Download
				</span>`;
			} else {
				svgEl.parentNode.removeChild(svgEl);
				let newText = newLink.querySelector(".button__text");
				if (newText != null) {
					newText.innerText = "Download";
				}
			}
			link.parentNode.parentNode.insertBefore(newButton, link.parentNode);
		}
	});

	// Minecraft version-specific files list
	Array.from(document.querySelectorAll(".cf-recentfiles-credits-wrapper")).filter(
		w => w.firstChild == null || (w.childNodes.length == 1 && w.firstChild.nodeType != Node.ELEMENT_NODE)
	).forEach(wrapper => {
		let link = wrapper.parentNode.querySelector("a");

		if (link != null) {
			let newHref = link.href.replace("files", "download");
			if (regexDownloadLink.test(newHref)) {
				newHref = newHref + "/file";
			}
			wrapper.innerHTML = `<a href="${newHref}" class="button button--icon-only button--sidebar">
				<span class="button__text">
					<svg class="icon icon-fixed-width icon-margin" viewBox="0 0 20 20" width="16" height="16"><use xlink:href="/Content/${assetsPath}/Skins/CurseForge/images/twitch/Action/Download.svg#Action/Download"></use></svg>
				</span>
			</a>`;
		}
	});
})();
