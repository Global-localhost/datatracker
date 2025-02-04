import {
    Tooltip as Tooltip,
    // Button as Button,
    // Collapse as Collapse,
    // ScrollSpy as ScrollSpy,
    Tab as Tab
} from "bootstrap";

import Cookies from "js-cookie";
import { populate_nav } from "./nav.js";
import "./select2.js";

const cookies = Cookies.withAttributes({ sameSite: "strict" });

// set initial point size from cookie before DOM is ready, to avoid flickering
const ptsize_var = "doc-ptsize-max";

function change_ptsize(ptsize) {
    document.documentElement.style.setProperty(`--${ptsize_var}`,
        `${ptsize}pt`);
    localStorage.setItem(ptsize_var, ptsize);
}

const ptsize = localStorage.getItem(ptsize_var);
change_ptsize(ptsize ? Math.min(Math.max(7, ptsize), 16) : 12);

document.addEventListener("DOMContentLoaded", function (event) {
    // handle point size slider
    document.getElementById("ptsize")
        .oninput = function () { change_ptsize(this.value) };

    // Use the Bootstrap tooltip plugin for all elements with a title attribute
    const tt_triggers = document.querySelectorAll(
        "[title]:not([title=''])");
    [...tt_triggers].map(tt_el => {
        const tooltip = Tooltip.getOrCreateInstance(tt_el);
        tt_el.addEventListener("click", el => {
            tooltip.hide();
            tt_el.blur();
        });
    });

    // Set up a nav pane
    const toc_pane = document.getElementById("toc-nav");
    populate_nav(toc_pane,
        `#content h2, #content h3, #content h4, #content h5, #content h6
         #content .h1, #content .h2, #content .h3, #content .h4, #content .h5, #content .h6`,
        ["py-0"]);

    // activate pref buttons selected by pref cookies or localStorage
    const in_localStorage = ["deftab"];
    document.querySelectorAll("#pref-tab-pane .btn-check")
        .forEach(btn => {
            const id = btn.id.replace("-radio", "");

            const val = in_localStorage.includes(btn.name) ?
                localStorage.getItem(btn.name) : cookies.get(btn.name);
            if (val == id) {
                btn.checked = true;
            }

            btn.addEventListener("click", el => {
                // only use cookies for things used in HTML templates
                if (in_localStorage.includes(btn.name)) {
                    localStorage.setItem(btn.name, id)
                } else {
                    cookies.set(btn.name, id);
                }
                window.location.reload();
            });
        });

    // activate tab selected in prefs
    let defpane;
    try {
        defpane = Tab.getOrCreateInstance(
            `#${localStorage.getItem("deftab")}-tab`);
    } catch (err) {
        defpane = Tab.getOrCreateInstance("#docinfo-tab");
    };
    defpane.show();
    document.activeElement.blur();
});
