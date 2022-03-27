import { InlineSettingsApplication } from "./modules/InlineSettingsApplication.js";
import { PrivateInlineSettingsApplication } from "./modules/PrivateInlineSettingsApplication.js";
import { SceneViewerSettingsApplication } from "./modules/SceneViewerSettingsApplication.js";

Hooks.once("init", () => {
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

  game.settings.register("inlinewebviewer", "sceneViewers", {
    scope: "world",
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register("inlinewebviewer", "experimentalControllableScene", {
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    name: "Enable experimental scene control",
    hint: "If you don't want to see the grid set it's opacity to 0, background also best at color #000000",
  });

  game.settings.registerMenu("inlinewebviewer", "sceneSettings", {
    name: "inlineView.menus.scene",
    label: "inlineView.menus.label",
    type: SceneViewerSettingsApplication,
    restricted: true,
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
});

/**
 * @param {String} settingId
 */
function migrateSettings(settingId) {
  let out = [];
  const settingsString = game.settings.get("inlinewebviewer", settingId);

  if (typeof settingsString !== "string") return;

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
