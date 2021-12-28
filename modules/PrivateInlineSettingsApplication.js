import { InlineSettingsApplication } from "./InlineSettingsApplication.js";

export class PrivateInlineSettingsApplication extends InlineSettingsApplication {
  constructor(object, options) {
    super(object, options);

    this.settingIdentifier = "privateWebviewersNew";
  }
}
