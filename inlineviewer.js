import ColorSetting from "./lib/colorSetting.js";

Hooks.once("init", () => {
    game.settings.register("inlinewebviewer", "webviewers", {
        name: "inlineView.webviewers.name",
        hint: "inlineView.webviewers.hint",
        scope: "world",
        config: true,
        type: String,
        restricted: true,
        default: "",
        onChange: () => window.location.reload()
    });

    game.settings.register("inlinewebviewer", "useJournal", {
        name: "inlineView.useJournal.name",
        hint: "inlineView.useJournal.hint",
        scope: "world",
        config: true,
        type: Boolean,
        restricted: true,
        default: false,
        onChange: () => window.location.reload()
    });

    new ColorSetting("inlinewebviewer", "webviewColor", {
        name: "inlineView.webviewColor.name",
        hint: "inlineView.webviewColor.hint",
        label: "inlineView.webviewColor.label",
        restricted: false,
        defaultColor: "#383838a1",
        scope: "client"
    });
});

Hooks.on("renderInlineViewer", (inlineViewer) => {
    // sets background color of site window
    /** @type {HTMLElement} */
    let element = inlineViewer.element[0];
    for (let elem of element.children) {
        if (elem.classList.contains("window-content")) {
            elem.classList.add("inline-viewer");
        }
    }
    jQuery(".inline-viewer").css("background-color", game.settings.get("inlinewebviewer", "webviewColor"));
});

Hooks.on("updateJournalEntry", (journal) => {
    if (game.settings.get("inlinewebviewer", "useJournal")) {
        if (journal.data.name === "Containers" || journal.data.name === "containers") {
            window.location.reload();
        }
    }
});

Hooks.on("getSceneControlButtons", controls => {
    /** @type {String} */
    let settingsString;
    if (!game.settings.get("inlinewebviewer", "useJournal")) {
        settingsString = game.settings.get("inlinewebviewer", "webviewers");
    } else {
        const journal = game.journal.getName("Containers" || "containers");
        if (journal == undefined) { return; }
        settingsString = journal.data.content;
    }
    // check if settingsstring contains any value
    if (settingsString === "") { return; }

    // init tools array for buttons
    let tools = [];

    // get seperate arrays of sites
    let settingsArray = settingsString.match(/\[.*?\]/g);
    try {
        for (let settings of settingsArray) {
            settings = settings.replace(/\[|\]/g, "");

            // get args for the setting
            const settingsVars = settings.split(",");

            // init webview
            let webView = new InlineViewer({
                baseApplication: settingsVars[1].trim(),
                classes: [settingsVars[1].trim().replace(" ", "-")],
                width: 512,
                height: 512,
                minimizable: true,
                title: settingsVars[1].trim(),
                url: settingsVars[0].trim()
            });

            // if no icon, set default icon
            if (settingsVars[2] === undefined) { settingsVars[2] = "fas fa-external-link-alt"; }

            // add to button list
            tools = tools.concat([{
                name: settingsVars[1].trim(),
                title: settingsVars[1].trim(),
                icon: settingsVars[2].trim(),
                button: true,
                onClick: () => webView.render(true)
            }]);
        }
    } catch{
        if (game.user.isGM) {
            ui.notifications.info(game.i18n.localize("inlineView.notifications.settingsError"));
        }
    }

    // create button list
    controls.push({
        name: "webviews",
        title: "inlineView.button",
        layer: "ControlsLayer",
        icon: "far fa-window-maximize",
        tools: tools
    });
});



class InlineViewer extends Application {
    constructor(src, options = {}) {
        super(src, options);
        this.objects = new PIXI.Container();
    }
    /* -------------------------------------------- */
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            template: "modules/inlinewebviewer/templates/inlineViewer.html",
            editable: false,
            resizable: true,
            popOut: true,
            shareable: false,
            url: null
        });
        return options;
    }

    /* -------------------------------------------- */
    /** @override */
    async getData(options) {
        const data = super.getData(options);
        data.siteUrl = this.options.url;
        return data;
    }
}
