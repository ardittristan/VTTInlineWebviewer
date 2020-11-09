Hooks.once("init", () => {
  game.settings.register("inlinewebviewer", "webviewers", {
    name: "inlineView.webviewers.name",
    hint: "inlineView.webviewers.hint",
    scope: "world",
    config: true,
    type: String,
    restricted: true,
    default: "",
    onChange: () => window.location.reload(),
  });

  game.settings.register("inlinewebviewer", "privateWebviewers", {
    name: "inlineView.webviewers.privateName",
    hint: "inlineView.webviewers.hint",
    scope: "client",
    config: true,
    type: String,
    restricted: true,
    default: "",
    onChange: () => window.location.reload(),
  });

  game.settings.register("inlinewebviewer", "journalName", {
    name: "inlineView.journal.name",
    hint: "inlineView.journal.hint",
    scope: "world",
    config: true,
    type: String,
    restricted: true,
    default: "Containers",
    onChange: () => window.location.reload(),
  });

  game.settings.register("inlinewebviewer", "useJournal", {
    name: "inlineView.useJournal.name",
    hint: "inlineView.useJournal.hint",
    scope: "world",
    config: true,
    type: Boolean,
    restricted: true,
    default: false,
    onChange: () => window.location.reload(),
  });

  game.settings.register("inlinewebviewer", "confirmExit", {
    name: "inlineView.confirmExit.name",
    hint: "inlineView.confirmExit.hint",
    scope: "client",
    restricted: false,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("inlinewebviewer", "sendUrl", {
    scope: "world",
    config: false,
    type: String,
    default: "",
    onChange: (text) => {
      if (text.length != 0) {
        let userList = game.settings.get("inlinewebviewer", "sendUrlUsers")[0];
        if (userList !== undefined || userList.length !== 0 || userList.includes(game.user._id)) {
          let vars = text.split("]");
          let webView = new InlineViewer({
            baseApplication: "GM Popup",
            classes: ["GM-Popup"],
            width: 512,
            height: 512,
            minimizable: true,
            title: "GM Popup",
            url: vars[0],
            compat: vars[1] === "true",
          });
          webView.render(true);
        }
      }
    },
  });

  game.settings.register("inlinewebviewer", "sendUrlUsers", {
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  if (typeof window?.Ardittristan?.ColorSetting === "function") {
    new window.Ardittristan.ColorSetting("inlinewebviewer", "webviewColor", {
      name: "inlineView.webviewColor.name",
      hint: "inlineView.webviewColor.hint",
      label: "inlineView.webviewColor.label",
      restricted: false,
      defaultColor: "#383838a1",
      scope: "client",
    });
  } else {
    game.settings.register("inlinewebviewer", "webviewColor", {
      name: "inlineView.webviewColor.name",
      hint: "inlineView.webviewColor.hint",
      restricted: false,
      default: "#383838a1",
      type: String,
      scope: "client",
      config: true,
    });
  }
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
    if (journal.data.name === game.settings.get("inlinewebviewer", "journalName") || journal.data.name === "Containers") {
      window.location.reload();
    }
  }
});

Hooks.on("getSceneControlButtons", (controls) => {
  /** @type {String} */
  let settingsString;
  let privateSettingsString = game.settings.get("inlinewebviewer", "privateWebviewers");

  if (!game.settings.get("inlinewebviewer", "useJournal")) {
    settingsString = game.settings.get("inlinewebviewer", "webviewers");
  } else {
    const journal = game.journal.getName(game.settings.get("inlinewebviewer", "journalName") || "Containers");
    if (journal == undefined) {
      if (privateSettingsString.length === 0) {
        return;
      }
      settingsString = "";
    } else {
      settingsString = journal.data.content;
    }
  }
  // check if settingsstring contains any value
  if (settingsString.length === 0 && privateSettingsString.length === 0) {
    return;
  }

  // init tools array for buttons
  let tools = [];

  // get seperate arrays of sites
  /** @type {String[]} */
  let settingsArray = settingsString.match(/\[.*?\]/g);
  if (privateSettingsString.length != 0) {
    if (settingsArray === null) {
      settingsArray = privateSettingsString.match(/\[.*?\]/g);
    } else {
      settingsArray = settingsArray.concat(privateSettingsString.match(/\[.*?\]/g));
    }
  }
  try {
    // add gm option to send url to everyone
    if (game.user.isGM) {
      tools = tools.concat([
        {
          name: "Send url to players",
          title: "Send url to Players",
          icon: "fas fa-upload",
          button: true,
          onClick: () => {
            new UrlShareDialog().render(true);
          },
        },
      ]);
    }

    for (let settings of settingsArray) {
      settings = settings.replace(/\[|\]/g, "");

      // get args for the setting
      const settingsVars = settings.split(",");

      let compat = true;
      if (settingsVars[3] === undefined) {
        compat = false;
      }

      // init webview
      let webView = new InlineViewer({
        baseApplication: settingsVars[1].trim(),
        classes: [settingsVars[1].trim().replace(" ", "-")],
        width: 512,
        height: 512,
        minimizable: true,
        title: settingsVars[1].trim(),
        url: settingsVars[0].trim(),
        compat: compat,
      });

      // if no icon, set default icon
      if (settingsVars[2] === undefined) {
        settingsVars[2] = "fas fa-external-link-alt";
      } else if (settingsVars[2].trim().toLowerCase() === "none") {
        settingsVars[2] = "fas fa-external-link-alt";
      }

      // add to button list
      tools = tools.concat([
        {
          name: settingsVars[1].trim(),
          title: settingsVars[1].trim(),
          icon: settingsVars[2].trim(),
          button: true,
          onClick: () => webView.render(true),
        },
      ]);
    }
  } catch {
    if (game.user.isGM || privateSettingsString.length != 0) {
      ui.notifications.info(game.i18n.localize("inlineView.notifications.settingsError"));
    }
  }

  // create button list
  controls.push({
    name: "webviews",
    title: "inlineView.button",
    layer: "ControlsLayer",
    icon: "far fa-window-maximize",
    tools: tools,
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
      url: null,
      compat: false,
    });
    return options;
  }

  /* -------------------------------------------- */
  /** @override */
  async getData(options) {
    const data = super.getData(options);
    data.siteUrl = this.options.url;
    data.compat = this.options.compat;
    return data;
  }

  /* -------------------------------------------- */
  /**
   * @override
   * @private
   */
  _getHeaderButtons() {
    return [
      ...(() => {
        if (game.user.isGM) {
          return [
            {
              label: "Share",
              class: "share",
              icon: "fas fa-share-square",
              onclick: (ev) => {
                new UrlShareDialog({ url: this.options.url, compat: this.options.compat }).render(true);
              },
            },
          ];
        }
        return [];
      })(),
      ...[
        {
          label: "Close",
          class: "close",
          icon: "fas fa-times",
          onclick: (ev) => {
            if (game.settings.get("inlinewebviewer", "confirmExit")) {
              Dialog.confirm({
                title: game.i18n.localize("inlineView.confirmExit.title"),
                content: `<p>${game.i18n.localize("inlineView.confirmExit.content")}</p>`,
                yes: () => {
                  this.close();
                },
                defaultYes: false,
              });
            } else {
              this.close();
            }
          },
        },
      ],
    ];
  }
}

class UrlShareDialog extends Application {
  constructor(src, options = {}) {
    super(src, options);
    this.objects = new PIXI.Container();

    /** @type {HTMLElement} */
    this.form = null;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;

    mergeObject(options, {
      template: "modules/inlinewebviewer/templates/urlShareDialog.html",
      baseApplication: "UrlShareDialog",
      classes: ["webviewer-dialog"],
      minimizable: false,
      title: "Send url",
      editable: true,
      resizable: false,
      popOut: true,
      shareable: false,
      url: "",
      compat: false,
    });

    return options;
  }

  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    this.form = html[0];
    return html;
  }

  async getData(options) {
    const data = super.getData(options);
    data.users = game.users.filter((user) => user.active);
    data.url = this.options.url;
    data.compat = this.options.compat;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.form.onsubmit = (e) => {
      e.preventDefault();

      /** @type {string} */
      let url = jQuery(e.target).find("#shareUrl").prop("value");
      /** @type {boolean} */
      let compat = jQuery(e.target).find("#compat").prop("checked");

      let userList = jQuery(e.target)
        .find("input[data-dtype=Checkbox]")
        .toArray()
        .filter((el) => el.checked)
        .map((el) => el.dataset.userid);

      game.settings.set("inlinewebviewer", "sendUrlUsers", userList);

      this.close();

      this.sendUrl(url, compat);
    };
    this.form.onreset = (e) => {
      e.preventDefault();

      this.close();
    };
  }

  /**
   * @param {String} url
   * @param {boolean} [compat=false]
   */
  sendUrl(url, compat = false) {
    game.settings.set("inlinewebviewer", "sendUrl", url + "]" + String(compat));
    setTimeout(() => {
      game.settings.set("inlinewebviewer", "sendUrl", "");
    }, 1000);
  }
}

window.Ardittristan = window.Ardittristan || {};
window.Ardittristan.InlineViewer = window.Ardittristan.InlineViewer || {};
window.Ardittristan.InlineViewer.sendUrl = UrlShareDialog.prototype.sendUrl;
