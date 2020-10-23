Hooks.once("init", function () {
  game.settings.register("colorsettings", "showWarning", {
    config: true,
    type: Boolean,
    default: true,
    name: "Show Error",
    hint: "Enable or disable error if main module missing.",
  });
  if (window?.Ardittristan?.initialColorSettingRun === undefined) {
    if (game.modules.has("colorsettings")) {
      if (game.modules.get("colorsettings").active) {
        return;
      } else {
        game.settings.register("colorsettings", "autoEnable", {
          config: false,
          type: Boolean,
          default: true,
        });
        Hooks.once("canvasReady", () => {
          if (game.user.isGM && game.settings.get("colorsettings", "autoEnable")) {
            Dialog.confirm({
              title: "Enable Color Settings module?",
              content: "<p>You seem to have Color Settings installed already, do you want to enable it?</p>",
              yes: () =>
                game.settings.set("core", ModuleManagement.CONFIG_SETTING, {
                  ...game.settings.get("core", ModuleManagement.CONFIG_SETTING),
                  ...{ colorsettings: true },
                }),
              no: () => game.settings.set("colorsettings", "autoEnable", false),
              defaultYes: false,
            });
          }
        });
      }
    }

    Hooks.once("ready", function () {
      if (game.settings.get("colorsettings", "showWarning")) {
        ui.notifications.notify("A module is missing the color picker library. For best results, please install and enable the Lib-Color Settings module.", "warning");
      }
    });
    console.log("ColorSettings | initializing fallback mode");
  }
});
