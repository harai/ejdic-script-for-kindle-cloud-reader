// ==UserScript==
// @name           EJDic Script for Kindle Cloud Reader
// @version        1.0
// @namespace      https://github.com/harai/
// @description    Kindle Cloud Readerで、Dictionary.comの代わりにWeblioのリンクを表示するスクリプト。
// @include        https://read.amazon.com/*
// ==/UserScript==

if (window.top == window.self)  //don't run on top window
    return;

var stateTemplate = function(args) {
    var name = args.name ? args.name : "anonymous state";
    return function() {
        // console.debug(">>> on " + name);
        if (args.initialize) {
            args.initialize();
        }

        var observer = new MutationObserver(function() {
            // console.debug(">>> on " + name + " mutation found");
            if (args.continueObserving) {
                if (args.continueObserving()) {
                    return;
                }
            }

            observer.disconnect();

            if (args.postObserving) {
                args.postObserving();
            }
            
            if (args.nextState) {
                var nextState = args.nextState();
                nextState();
            }
        });
        observer.observe(args.observingNode(), args.observingType);
    };
};

var contextMenu = null;

var observingPopupState = stateTemplate({
    name: "observingPopupState",
    observingNode: function() {
        return contextMenu;
    },
    observingType: { childList: true, attributes: true, subtree: true, characterData: true },
    continueObserving: function() {
        var entry = contextMenu.querySelector(".dictionary > .term > span.entry");
        if (!entry) {
            return true;
        }
        var dicUrl = "http://ejje.weblio.jp/content/" + entry.textContent;
        
        var link = contextMenu.querySelector(".dictionary > .reference > a.view_full_link");
        if (!link) {
            return true;
        }
        // removing this will cause infinite looping
        if (link.href == dicUrl) {
            return true;
        }
        link.href = dicUrl;
        
        var logo = contextMenu.querySelector(".dictionary > .reference > a.view_full_link > .view_full_logo");
        if (!logo) {
            return true;
        }
        logo.style.backgroundImage = "none";
        logo.style.fontWeight = "bold";
        logo.style.fontSize = "25px";
        logo.style.marginLeft = "5px";
        logo.style.width = "auto";
        logo.textContent = "Weblio";

        return true;
    },
    postObserving: function() {
    },
    nextState: function() {
        throw "no next state";
    }
});

var initState = stateTemplate({
    name: "initState",
    observingNode: function() {
        return document.body;
    },
    observingType: { childList: true, subtree: true, attributes: true, characterData: true },
    continueObserving: function() {
        return !(contextMenu = document.getElementById("kindleReader_menu_contextMenu"));
    },
    postObserving: function() {
    },
    nextState: function() {
        return observingPopupState;
    }
});

initState();
