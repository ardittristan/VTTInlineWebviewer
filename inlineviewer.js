/** @type {Handlebars.Template} */
let settingsEntry;
const safeRegex = /[~!@$%^&*()+=,./';:"?><[\]\\{}|`# ]/g;

Hooks.once("init", () => {
  (async () => {
    settingsEntry = await getTemplate("modules/inlinewebviewer/templates/partials/settingsEntry.html");
  })();

  game.settings.register("inlinewebviewer", "webviewers", {
    scope: "world",
    config: false,
    type: String,
    restricted: true,
    default: "",
  });

  game.settings.register("inlinewebviewer", "privateWebviewers", {
    scope: "client",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("inlinewebviewer", "webviewersNew", {
    scope: "world",
    config: false,
    type: Array,
    restricted: true,
    default: [],
  });

  game.settings.register("inlinewebviewer", "privateWebviewersNew", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
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

  game.settings.register("inlinewebviewer", "localMigrate", {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("inlinewebviewer", "worldMigrate", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.registerMenu("inlinewebviewer", "worldSettings", {
    name: "inlineView.menus.global",
    label: "inlineView.menus.label",
    type: InlineSettingsApplication,
    restricted: true,
  });

  game.settings.registerMenu("inlinewebviewer", "privateSettings", {
    name: "inlineView.menus.private",
    label: "inlineView.menus.label",
    type: PrivateInlineSettingsApplication,
    restricted: false,
  });

  //

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

  // if old version update values
  if (!game.settings.get("inlinewebviewer", "localMigrate")) {
    migrateSettings("privateWebviewers");
    game.settings.set("inlinewebviewer", "localMigrate", true);
  }
  Hooks.once("ready", () => {
    if (game.user.isGM && !game.settings.get("inlinewebviewer", "worldMigrate")) {
      migrateSettings("webviewersNew");
      game.settings.set("inlinewebviewer", "worldMigrate", true);
    }
  });

  // listen for iframes
  window.addEventListener("message", (e) => {
    if (typeof e.data !== "string") return;

    let element = $(`iframe#${e.data}`);

    if (!(element.length > 0)) return;

    element.each(function () {
      this.contentWindow.postMessage(this.dataset.customcss, "*");
    });
  });

  // socket
  game.socket.on("module.inlinewebviewer", (data) => {
    if (data.name && data.url) {
      if (data.userList === undefined || data.userList.length === 0 || data.userList.includes(game.user._id)) {
        new InlineViewer({
          baseApplication: data.name.trim(),
          classes: [data.name.trim().replace(" ", "-")],
          width: data.width || 512,
          height: data.height || 512,
          minimizable: true,
          title: game.i18n.localize("inlineView.gmShare.popup"),
          url: data.url.trim(),
          compat: data.compat || false,
          customCSS: data.customcss,
        }).render(true);
      }
    }
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

Hooks.on("getSceneControlButtons", (controls) => {
  let privateSettings = game.settings.get("inlinewebviewer", "privateWebviewersNew")?.[0] || [];
  let settings = game.settings.get("inlinewebviewer", "webviewersNew")?.[0] || [];

  // check if settingsstring contains any value
  if (!game.user.isGM && settings.length === 0 && privateSettings.length === 0) {
    return;
  }

  // init tools array for buttons
  let tools = [];

  // get seperate arrays of sites
  if (privateSettings.length != 0) {
    if (!(settings?.length > 0)) {
      settings = privateSettings;
    } else {
      settings = settings.concat(privateSettings);
    }
  }
  try {
    // add gm option to send url to everyone
    if (game.user.isGM) {
      tools = tools.concat([
        {
          name: game.i18n.localize("inlineView.gmShare.tools.name"),
          title: game.i18n.localize("inlineView.gmShare.tools.title"),
          icon: "fas fa-upload",
          button: true,
          onClick: () => {
            new UrlShareDialog().render(true);
          },
        },
      ]);
    }

    for (let setting of settings) {
      if (!setting.name) {
        setting.name = "Inline Webview";
      }

      // init webview
      let webView = new InlineViewer({
        baseApplication: setting.name.trim(),
        classes: [setting.name.trim().replace(" ", "-")],
        width: setting.width || 512,
        height: setting.height || 512,
        minimizable: true,
        title: setting.name.trim(),
        url: setting.url.trim(),
        compat: setting.compat || false,
        customCSS: setting.customcss,
      });

      // add to button list
      tools = tools.concat([
        {
          name: setting.name.trim(),
          title: setting.name.trim(),
          icon: setting.icon || "fas fa-external-link-alt",
          button: true,
          onClick: () => webView.render(true),
        },
      ]);
    }
  } catch (e) {
    if (privateSettings.length != 0 || settings.length != 0) {
      console.error(e);
      Hooks.once("ready", () => {
        ui.notifications.info(game.i18n.localize("inlineView.notifications.settingsError"));
      });
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
    this._exportToJournal = this._exportToJournal.bind(this);
    this.objects = new PIXI.Container();
    /** @type {Event} */
    this.eventListener;
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
    data.safeUrl = this.options.url.match(/https?:\/\/.*?(\/|$)/)[0].replace(safeRegex, "");
    data.customCSS = encodeURIComponent(this.options.customCSS);
    return data;
  }

  _exportToJournal() {
    const siteUrl = this.options.url;
    const safeUrl = this.options.url.match(/https?:\/\/.*?(\/|$)/)[0].replace(safeRegex, "");
    const customCSS = encodeURIComponent(this.options.customCSS);

    JournalEntry.create(
      {
        name: safeUrl,
        content: this.options.compat
          ? `
<p style="top: 0; bottom: 0; left: 0; right: 0; position: absolute;">
  <iframe
    is="x-frame-bypass"
    id="${safeUrl}"
    width="100%"
    height="100%"
    src="https://cors-anywhere.ardittristan.xyz:9123/vtt/${siteUrl}"
    style="border: none;"
    data-customcss="${customCSS}"
  </iframe>
</p>`
          : `
<p style="top: 0; bottom: 0; left: 0; right: 0; position: absolute;">
  <iframe
    id="${safeUrl}"
    width="100%"
    height="100%"
    src="${siteUrl}"
    style="border: none;"
</p>
`,
      },
      {
        renderSheet: true,
      }
    );
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
              label: game.i18n.localize("inlineView.headers.share"),
              class: "share",
              icon: "fas fa-share-square",
              onclick: (ev) => {
                new UrlShareDialog({
                  url: this.options.url,
                  compat: this.options.compat,
                  w: this.options.width,
                  h: this.options.height,
                  customCSS: this.options.customCSS,
                }).render(true);
              },
            },
            {
              label: game.i18n.localize("inlineView.headers.export"),
              class: "export",
              icon: "fas fa-book",
              onclick: (ev) => {
                Dialog.confirm({
                  title: game.i18n.localize("inlineView.confirmExport.title"),
                  content: `<p>${game.i18n.localize("inlineView.confirmExport.content")}</p>`,
                  yes: () => {
                    this._exportToJournal();
                  },
                });
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

class HelpPopup extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;

    mergeObject(options, {
      id: "inline-webviewer-help",
      template: "modules/inlinewebviewer/templates/helpPopup.html",
      baseApplication: "inlineviewerHelp",
      classes: ["sheet"],
      title: game.i18n.localize("inlineView.help.title"),
      popOut: true,
      resizable: true,
      width: 618,
      height: 863,
    });

    return options;
  }
}

class UrlShareDialog extends FormApplication {
  constructor(options) {
    super({}, options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "modules/inlinewebviewer/templates/urlShareDialog.html",
      baseApplication: "UrlShareDialog",
      classes: ["webviewer-dialog"],
      minimizable: false,
      title: game.i18n.localize("inlineView.urlShare.title"),
      editable: true,
      resizable: true,
      popOut: true,
      shareable: false,
      url: "",
      compat: false,
      w: 512,
      h: 512,
      name: undefined,
      customCSS: "",
    });
  }

  async getData(options) {
    const data = super.getData(options);

    data.users = game.users.filter((user) => user.active);
    data.url = this.options.url;
    data.compat = this.options.compat;
    data.name = this.options.name;
    data.width = this.options.w;
    data.height = this.options.h;
    data.customcss = this.options.customCSS;

    return data;
  }

  /** @param {JQuery} html */
  activateListeners(html) {
    super.activateListeners(html);

    // textarea visibility according to compat
    html.find("#shareCompat").on("click", function () {
      if (this.checked) {
        html.find(".input")[0].style.setProperty("--compatDisplay", "inline-block");
      } else {
        html.find(".input")[0].style.setProperty("--compatDisplay", "none");
      }
    });

    // textarea visibility according to compat init
    if (html.find("#shareCompat")[0].checked || false) {
      html.find(".input")[0].style.setProperty("--compatDisplay", "inline-block");
    } else {
      html.find(".input")[0].style.setProperty("--compatDisplay", "none");
    }

    // close button
    html.find("button[type=button]").on("click", () => {
      this.close();
    });
  }

  /**
   * @param {Event} event
   * @param {Object} formData
   */
  async _updateObject(event, formData) {
    let userList = [];
    Object.keys(formData).forEach((key) => {
      if (formData[key] === true && key.includes("shareCheckbox")) {
        userList.push(key.replace("shareCheckbox", ""));
      }
    });

    this.close();

    this.sendUrl(formData.shareUrl, formData.shareCompat, formData.shareWidth, formData.shareHeight, formData.shareName, formData.shareCustomCSS, userList);
  }

  /**
   * @param {String} url
   * @param {Boolean} compat
   * @param {Number} w
   * @param {Number} h
   * @param {String} name
   * @param {String} customCSS
   * @param {String[]} userList
   */
  sendUrl(url, compat = false, w = 512, h = 512, name, customCSS, userList) {
    game.socket.emit("module.inlinewebviewer", {
      name: name,
      url: url,
      width: w,
      height: h,
      compat: compat,
      customcss: customCSS,
      userList: userList,
    });
    if (userList === undefined || userList.length === 0 || userList.includes(game.user._id)) {
      new InlineViewer({
        baseApplication: name.trim(),
        classes: [name.trim().replace(" ", "-")],
        width: w || 512,
        height: h || 512,
        minimizable: true,
        title: game.i18n.localize("inlineView.gmShare.popup"),
        url: url.trim(),
        compat: compat || false,
        customCSS: customCSS,
      }).render(true);
    }
  }

  _getHeaderButtons() {
    return [
      ...[
        {
          label: game.i18n.localize("inlineView.help.title"),
          class: "help",
          icon: "far fa-question-circle",
          onclick: (ev) => {
            new HelpPopup().render(true);
          },
        },
      ],
      ...super._getHeaderButtons(),
    ];
  }
}

class InlineSettingsApplication extends FormApplication {
  constructor(object, options) {
    super(object, options);

    this.settingIdentifier = "webviewersNew";

    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "inline-viewer-settings",
      classes: ["sheet"],
      template: "modules/inlinewebviewer/templates/settingsPopup.html",
      resizable: true,
      minimizable: false,
      title: game.i18n.localize("inlineView.settings.title"),
    });
  }

  async getData(options) {
    const data = super.getData(options);
    data.entries = game.settings.get("inlinewebviewer", this.settingIdentifier)?.[0] || [];

    return data;
  }

  /**
   * @param {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);
    const _this = this;

    // submit button
    html.find("button[type=submit]").on("click", () => {
      let valid = true;
      let values = []; //list of different values
      html.find("input:text[id$=Name]").each(function () {
        if (values.indexOf(this.value) >= 0) {
          //if this value is already in the list, marks
          html.find(this).css("border-color", "red");
          valid = false;
        } else {
          html.find(this).css("border-color", ""); //clears since last check
          values.push(this.value); //insert new value in the list
        }
      });
      if (!valid) ui.notifications.warn(game.i18n.localize("inlineView.settings.duplicate"));
      return valid;
    });

    // cancel button
    html.find("button#cancelButton").on("click", () => {
      this.close();
    });

    // add entry button logic
    html.find("button#addButton").on("click", () => {
      this.addEntry(html);
    });

    // textarea visibility according to compat
    html.find("input[id$=Compat]").on("click", function () {
      if (this.checked) {
        this.closest(".fields").style.setProperty("--compatDisplay", "inline-block");
      } else {
        this.closest(".fields").style.setProperty("--compatDisplay", "none");
      }
    });

    // textarea visibility according to compat init
    html.find(".fields").each(function () {
      let state = $(this).find("input[id$=Compat]")[0].checked || false;
      if (state) {
        this.style.setProperty("--compatDisplay", "inline-block");
      } else {
        this.style.setProperty("--compatDisplay", "none");
      }
    });

    html.find("button.upButton").on("click", function () {
      _this.handleUp(this);
    });

    html.find("button.downButton").on("click", function () {
      _this.handleDown(this);
    });

    html.find("button.deleteButton").on("click", function () {
      _this.handleDelete(this, html);
    });

    html.find("#newEntry input").on("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        html.find("#newEntry #addButton").trigger("click");
      }
    });
  }

  /**
   * @param {HTMLButtonElement} element
   * @param {JQuery} html
   */
  handleDelete(element, html) {
    const settingsElement = element.closest(".settingsEntry");
    const thisId = Number(settingsElement.getElementsByClassName("orderId")[0].value);
    html.find(".orderId").each(function () {
      if (this.value > thisId) {
        this.value--;
      }
    });
    settingsElement.remove();
  }

  /**
   * @param {HTMLButtonElement} element
   */
  handleUp(element) {
    let settingElement = element.closest(".settingsEntry");
    /** @type {Number} */
    let index = Array.prototype.indexOf.call(settingElement.parentElement.children, settingElement);

    if (index === 0 || index === -1) return;

    settingElement.getElementsByClassName("orderId")[0].value = Number(settingElement.getElementsByClassName("orderId")[0].value) - 1;
    settingElement.previousElementSibling.getElementsByClassName("orderId")[0].value =
      Number(settingElement.previousElementSibling.getElementsByClassName("orderId")[0].value) + 1;

    settingElement.parentNode.insertBefore(settingElement, settingElement.previousElementSibling);
  }

  /**
   * @param {HTMLButtonElement} element
   */
  handleDown(element) {
    let settingElement = element.closest(".settingsEntry");
    let index = Array.prototype.indexOf.call(settingElement.parentElement.children, settingElement);

    if (index === settingElement.parentElement.children.length - 1 || index === -1) return;

    settingElement.getElementsByClassName("orderId")[0].value = Number(settingElement.getElementsByClassName("orderId")[0].value) + 1;
    settingElement.nextElementSibling.getElementsByClassName("orderId")[0].value =
      Number(settingElement.nextElementSibling.getElementsByClassName("orderId")[0].value) - 1;

    insertAfter(settingElement, settingElement.nextElementSibling);
  }

  /**
   * @param {JQuery} html
   */
  addEntry(html) {
    const _this = this;

    /** @type {String} */
    let name = html.find("#newEntry-Name")[0]?.value;
    let safeName = name.replace(safeRegex, "");
    /** @type {String} */
    let url = html.find("#newEntry-Url")[0]?.value;
    /** @type {Boolean} */
    let compat = html.find("#newEntry-Compat")[0]?.checked;
    /** @type {String} */
    let icon = html.find("#newEntry-Icon")[0]?.value;
    /** @type {Number} */
    let width = html.find("#newEntry-Width")[0]?.value;
    /** @type {Number} */
    let height = html.find("#newEntry-Height")[0]?.value;
    /** @type {String} */
    let customCSS = html.find("#newEntry-CustomCSS")[0]?.value;
    if (!this._validateEntry(safeName, url, html)) return;

    // id
    /** @type {Number} */
    let id;
    let lastEntry = html.find("#entryList > .settingsEntry").last();
    if (lastEntry.length === 1) {
      id = Number(lastEntry.find(".orderId")[0].value) + 1;
    } else {
      id = 1;
    }

    // make html from input
    /** @type {String} */
    let compiledTemplate = settingsEntry({
      name: name,
      safeName: safeName,
      url: url,
      compat: compat,
      icon: icon,
      width: width,
      height: height,
      customCSS: customCSS,
      id: id,
    });

    html.find("#entryList").append(compiledTemplate);
    let addedElement = html.find(`#${safeName}-Entry`);

    // compat checkbox
    addedElement.find("input[id$=Compat]").on("click", function () {
      if (this.checked) {
        addedElement[0].style.setProperty("--compatDisplay", "inline-block");
      } else {
        addedElement[0].style.setProperty("--compatDisplay", "none");
      }
    });

    if (compat) {
      addedElement[0].style.setProperty("--compatDisplay", "inline-block");
    } else {
      addedElement[0].style.setProperty("--compatDisplay", "none");
    }

    // empty boxes
    html.find("#newEntry-Name")[0].value = "";
    html.find("#newEntry-Url")[0].value = "";
    html.find("#newEntry-Icon")[0].value = "";
    html.find("#newEntry-Width")[0].value = "";
    html.find("#newEntry-Height")[0].value = "";
    html.find("#newEntry-CustomCSS")[0].value = "";

    // up and down
    addedElement.find("button.upButton").on("click", function () {
      _this.handleUp(this);
    });
    addedElement.find("button.downButton").on("click", function () {
      _this.handleDown(this);
    });
  }

  /**
   * @param {String} name
   * @param {String} url
   * @param {JQuery} html
   */
  _validateEntry(name, url, html) {
    const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    let hasName = name?.length > 0;
    let hasUrl = url?.length > 0 && pattern.test(url);

    this._updateInputColor(hasName, html.find("#newEntry-Name")[0]);
    this._updateInputColor(hasUrl, html.find("#newEntry-Url")[0]);

    return hasName && hasUrl;
  }

  /**
   * @param {Boolean} bool
   * @param {HTMLElement} element
   */
  _updateInputColor(bool, element) {
    element.style.border = bool ? "" : "2px solid red";
  }

  /**
   * @param {Event} event
   * @param {Object} formData
   */
  async _updateObject(event, formData) {
    let settingsArray = [];

    Object.keys(formData).forEach((key) => {
      const array = key.split("-");
      const prop = array.pop().toLowerCase();
      const name = array.join("-");
      const id = formData[name + "-Id"];

      if (!settingsArray[id]) settingsArray[id] = {};

      settingsArray[id][prop] = formData[key];
      if (!settingsArray[id].safename) settingsArray[id].safename = name.replace(safeRegex, "");
    });

    settingsArray.shift();

    game.settings.set("inlinewebviewer", this.settingIdentifier, settingsArray);
  }

  _getHeaderButtons() {
    return [
      ...[
        {
          label: game.i18n.localize("inlineView.help.title"),
          class: "help",
          icon: "far fa-question-circle",
          onclick: (ev) => {
            new HelpPopup().render(true);
          },
        },
      ],
      ...super._getHeaderButtons(),
    ];
  }
}

class PrivateInlineSettingsApplication extends InlineSettingsApplication {
  constructor(object, options) {
    super(object, options);

    this.settingIdentifier = "privateWebviewersNew";
  }
}

/**
 * @param {String} settingId
 */
function migrateSettings(settingId) {
  let out = [];
  const settingsString = game.settings.get("inlinewebviewer", settingId);

  if (!settingsString) return;

  let settingsArray = settingsString.match(/\[.*?\]/g) || [];

  let i = 0;
  for (let settings of settingsArray) {
    i++;
    settings = settings.replace(/\<|\>/g, "");

    // get args for the setting
    const settingsVars = settings.split(",");

    const settingsObject = {
      id: i,
      url: settingsVars?.[0],
      name: settingsVars?.[1],
      icon: settingsVars?.[2],
      compat: settingsVars?.[3],
    };

    out.push(settingsObject);
  }

  game.settings.set("inlinewebviewer", settingId + "New", out);
}

/**
 * @param {Element} newNode
 * @param {Element} referenceElement
 */
function insertAfter(newNode, referenceElement) {
  referenceElement.parentElement.insertBefore(newNode, referenceElement.nextElementSibling);
}

window.Ardittristan = window.Ardittristan || {};
window.Ardittristan.InlineViewer = window.Ardittristan.InlineViewer || {};
window.Ardittristan.InlineViewer.sendUrl = UrlShareDialog.prototype.sendUrl;
