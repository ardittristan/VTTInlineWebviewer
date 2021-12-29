import { insertAfter, safeRegex } from "../inlineviewer.js";
import { HelpPopup } from "./HelpPopup.js";

/** @type {Handlebars.Template} */
let settingsEntry;

Hooks.once("init", async () => {
  settingsEntry = await getTemplate("modules/inlinewebviewer/templates/partials/settingsEntry.html");
});

export class InlineSettingsApplication extends FormApplication {
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
    data.entries = game.settings.get("inlinewebviewer", this.settingIdentifier) || [];

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
    /** @type {String} */
    let properties = html.find("#newEntry-Properties")[0]?.value;
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
      name,
      safeName,
      url,
      compat,
      icon,
      width,
      height,
      customCSS,
      id,
      properties,
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
