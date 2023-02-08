# Patch Notes

## Version 3.4.3

- Fix journal webviews not working.

## Version 3.4.0

- Add initial experimental implementation of scene control in a webviewer scene.

## Version 3.3.1

- Add forgotten import.

## Version 3.3.0

- Add support for scene webviewers.

## Version 3.2.1

- Fix another v9 api issue.
- Split up code for better readability.

## Version 3.2.0

- Fix v9 api issue.

- **Drop support for Foundry 0.7 and earlier**

## Version 3.1.1

- Improve header buttons, thanks to [@saif-ellafi](https://github.com/saif-ellafi)

## Version 3.1.0

- Add youtube support.

## Version 3.0.3

- Hopefully fix export to journal.

## Version 3.0.2

- Add option to add HTML properties to the iframe element.
- Bugfix.

## Version 3.0.1

- Re-add 0.7 compatibility.
- Add extension docs.

## Version 3.0.0

- 0.8.\* compatibility.
- Hopefully fix false virus scanner positives.

## Version 2.2.4

- Added [browser extension](https://github.com/ardittristan/FoundryVTT-Inline-Webviewer-Extension) support.

## Version 2.2.3

- Hotfix.

## Version 2.2.2

- Add export to journal for compat with GM Screen.

## Version 2.2.1

- Fix module not working when installed fresh.
- Fix not all data being saved in settings.

## Version 2.2.0

- Add remove button to settings, oops, kinda forgot about this one.
- Make help images smaller in file size.

## Version 2.1.0

- Add the new features to api and share dialog.
- Fix some bugs.

## Version 2.0.1

- Hotfix remove localhost url.

## Version 2.0.0

**Warning**: as this is a major version stuff might break, I recommend making a copy of this modules' settings.

- Revamped settings.
- Added possibility to remove elements from containers using css selectors.

&nbsp;  
Todo:

- Add new capabilities to "share" popup.
- Add new capabilities to api.

## Version 1.5.1

- Add size parameters to macro function, non-macro functionality will come at a later date.

## Version 1.5.0

- Add option to select users to send webview to via share dialog.
- Add share button to viewer.

## Version 1.4.5

- Fix localization for confirmation.

## Version 1.4.4

- Add confirmation on closure of viewer.

## Version 1.4.3

- Fix html incompatible characters being encoded by handlebars.
- Add ability to share url via macro.
- Add forgotten localization.

## Version 1.4.2

- Push compatible core version.

## Version 1.4.1

- Make module work without colorsettings lib.

## Version 1.4.0

- Added the ability for the gm to send an url to open up at all players.

## Version 1.3.4

- Switched from google analytics to just logging domain names with compatibility mode to improve privacy while still being able to prevent abuse.

## Version 1.3.3

- Updated ColorPicker library to use module dependency instead of build in.

## Version 1.3.2

- Fixed some spelling and made analytics usage more clear for compatibility mode.

## Version 1.3.1

- Fix buttons for personal containers not showing up when there are no global containers.
- Remove leftover debug console logs.

## Version 1.3.0

- Changed compability mode to work with more sites.

## Version 1.2.0

- Added clientside setting so you can have personal windows.
- Added the option to change the journal name.

## Version 1.1.0

- Add compability mode, fixes some iframe issues for some sites, works for dndbeyond, not for google.

## Version 1.0.1

- Remove Google from example since it's CORS doesn't allow webview.

## Version 1.0.0

- Initial release
