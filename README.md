![GitHub All Releases](https://img.shields.io/github/downloads/ardittristan/VTTInlineWebviewer/total)
[![Donate](https://img.shields.io/badge/Donate-PayPal-Green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TF3LJHWV9U7HN)

# Inline Webviewer

## Installation

To install, import this [Manifest](https://raw.githubusercontent.com/ardittristan/VTTInlineWebviewer/master/module.json) into your module browser.

Make sure you've also have the [ColorSettings](https://raw.githubusercontent.com/ardittristan/VTTColorSettings/master/module.json) library installed!

## Usage

### As HUD button

To create a new webview, add an entry to the `Containers` setting, _or if you have the journal setting enabled a journal with the name that you gave it in the settings._  
An entry is formatted like this:

<code>[\<site url\>, \<button\/window name\>, \<[font awesome](https://fontawesome.com/icons/code?style=solid) icon name \(optional\)\>, \<compatibility mode \(optional\)\>\]</code>  
_If you don't include a font awesome icon or name it `none` it uses the <a href=""><img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/external-link-alt.svg" alt="" height="16" /></a> icon._

Here is an example entry:  

```plaintext
[https://foundryvtt.com/api/, Foundry API, fas fa-code], [https://foundryvtt.com, Foundry], [https://dndbeyond.com, DnDBeyond, none, true]
```

_Keep in mind that when working in a journal everything inside a `[ ]` entry should be on the same line._

All webviews appear on the left HUD under the <a href=""><img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/regular/window-maximize.svg" alt="" height="16" /></a> menu.

### When sending popup as GM

For GMs, a <a href=""><img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/upload.svg" alt="" height="16" /></a> should be visible in the <a href=""><img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/regular/window-maximize.svg" alt="" height="16" /></a> menu. If clicked on, the GM can enter an url. This url will pop up on the screen of all players inside a webviewer.

&nbsp;  
You can also use this in a macro, it functions the same as the popup, but can be called as a function:

```js
// without compatibility mode
window.Ardittristan.InlineViewer.sendUrl("https://google.com");

// with compatibility mode
window.Ardittristan.InlineViewer.sendUrl("https://google.com", true);

// with window dimensions
window.Ardittristan.InlineViewer.sendUrl("https://google.com", true, 1920, 1080);
```

## Troubleshooting

* If the site disallows embedding in iframes you can try enabling compatibility mode, compatibility mode might not fully fix the issue and logs domain names to prevent abuse.

* If your url has a \[ or \] in it it will break the module.

## Example

![Preview](https://i.imgur.com/5E36O9u.gif)

## Changelog

Check the [Changelog](https://github.com/ardittristan/VTTInlineWebviewer/blob/master/CHANGELOG.md)
