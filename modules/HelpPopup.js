export class HelpPopup extends Application {
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
      height: 950,
    });

    return options;
  }
}
