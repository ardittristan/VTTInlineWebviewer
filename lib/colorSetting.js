// https://github.com/ardittristan/VTTColorSettings

import Picker from "./vanilla-picker.min.mjs";

var pickerShown = {};
var data = {};
var initialRun = false;

function runInit() {
    console.log("ColorSettings | initializing");

    // monkeypatch the onclick event of settings to allow for more settings types
    SettingsConfig.prototype._onClickSubmenu = function (event) {
        event.preventDefault();
        const menu = game.settings.menus.get(event.currentTarget.dataset.key);
        if (!menu) return ui.notifications.error("No submenu found for the provided key");
        try {
            const app = new menu.type();
            return app.render(true);
        } catch {
            const app = new menu.type(event);
            return app.render(true);
        }
    };
}

export default class ColorSetting {
    /**
     * @param  {String} module    The namespace under which the setting/menu is registered
     * @param  {String} key       The key name for the setting under the namespace module
     * @param  {{name: String, label: String, restricted: Boolean, defaultColor: String, scope: String, onChange: function(String)}} options   Configuration for setting data
     * @example
     * // Add a setting with a color picker
     * new ColorSetting("myModule", "myColorSetting", {
     *   name: "My Color Setting",      // The name of the setting in the settings menu
     *   hint: "Click on the button",   // A description of the registered setting and its behavior
     *   label: "Color Picker",         // The text label used in the button
     *   restricted: false,             // Restrict this setting to gamemaster only?
     *   defaultColor: "#000000ff",     // The default color of the setting
     *   scope: "client",               // The scope of the setting
     *   onChange: (value) => {}        // A callback function which triggers when the setting is changed
     * })
     */
    constructor(module, key, options = {}) {
        if (!initialRun) { runInit(); initialRun = true; }
        this.defaultOptions = {
            hint: undefined,
            name: "",
            label: "Color Picker",
            restricted: false,
            defaultColor: "#000000ff",
            scope: "client",
            onChange: undefined
        };
        this.options = { ...this.defaultOptions, ...options };
        this.module = module;
        this.key = key;

        data[`${this.module}.${this.key}`] = [this.module, this.key, this.options.label];

        game.settings.registerMenu(this.module, this.key, {
            hint: this.options.hint,
            name: this.options.name,
            label: this.options.label,
            icon: 'fas fa-tint',
            type: SettingsForm,
            restricted: this.options.restricted
        });

        // add onchange capability
        this.settingsOptions = {
            scope: this.options.scope,
            config: false,
            default: this.options.defaultColor,
            type: String
        };
        if (this.options.onChange != undefined) {
            this.settingsOptions = { ...this.settingsOptions, ...{ onChange: this.options.onChange } };
        }

        game.settings.register(this.module, this.key, this.settingsOptions);

        _settingsWatcher(this.module, this.key);

        pickerShown[`${this.module}.${this.key}`] = false;
    }
}


class SettingsForm extends FormApplication {
    constructor(event) {
        super();
        this.settings = data[event.currentTarget.dataset.key];
        this.module = this.settings[0];
        this.key = this.settings[1];
        this.label = this.settings[2];
    }

    render() {
        var x = document.querySelectorAll("div.settings-list div.form-group.submenu button");
        for (let element of x) {
            try {
                if (element.dataset.key.includes(`${this.module}.${this.key}`)) {
                    this._showPicker(element);
                }
            } catch{ }
        }
    }
    /**
     * @param  {Element} element
     */
    async _showPicker(element) {
        var picker = new Picker();
        if (pickerShown[`${this.module}.${this.key}`]) { return; }
        pickerShown[`${this.module}.${this.key}`] = true;
        picker.setOptions({
            parent: element.parentElement,
            popup: false,
            color: game.settings.get(this.module, this.key),
            onDone: (color) => {
                picker.destroy();
                pickerShown[`${this.module}.${this.key}`] = false;
                game.settings.set(this.module, this.key, color.hex);
                element.style.backgroundColor = color.hex;
                element.style.color = getTextColor(color.hex);
                element.style.maxWidth = "100%";
            }
        });
        picker.show();
        element.style.maxWidth = `${this.label.length * 1.25 + 4.5}%`;
    }
}

// settings formatting watcher
async function _settingsWatcher(module, key) {
    Hooks.on('renderSettingsConfig', () => {
        var x = document.querySelectorAll("div.settings-list div.form-group.submenu button");
        for (let element of x) {
            try {
                if (element.dataset.key.includes(`${module}.${key}`)) {
                    const color = game.settings.get(module, key);
                    element.style.backgroundColor = color;
                    element.style.color = getTextColor(color);
                }
            } catch{ }
        }
    });
}

// Hex to rgba
function _convertHexUnitTo256(hexStr) { return parseInt(hexStr.repeat(2 / hexStr.length), 16); }

/**
 * turn hex rgba into rgba string
 * @param {String} hex 8 long hex value in string form, eg: "#123456ff"
 * @returns Array of rgba[r, g, b, a]
 */
export function hexToRGBA(hex) {
    const hexArr = hex.slice(1).match(new RegExp(".{2}", "g"));
    const [r, g, b, a] = hexArr.map(_convertHexUnitTo256);
    return [r, g, b, Math.round((a / 256 + Number.EPSILON) * 100) / 100];
}

/**
 * makes text white or black according to background color
 * @param {String} rgbaHex 8 long hex value in string form, eg: "#123456ff"
 * @returns {String} "black" or "white"
 */
export function getTextColor(rgbaHex) {
    const rgba = hexToRGBA(rgbaHex);
    const brightness = Math.round((
        (rgba[0] * 299) +
        (rgba[1] * 587) +
        (rgba[2] * 114)
    ) / 1000);
    if (rgba[3] > 0.5) {
        return (brightness > 125) ? 'black' : 'white';
    } else {
        return 'black';
    }
}
