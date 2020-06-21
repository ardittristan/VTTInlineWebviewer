# Inline Webviewer

## Installation

To install, import this [Manifest](https://raw.githubusercontent.com/ardittristan/VTTInlineWebviewer/master/module.json) into your module browser.

## Usage

To create a new webview, add an entry to the `Containers` setting, _or if you have the journal setting enabled a journal with the name that you gave it in the settings._  
An entry is formatted like this:

`[<site url>, <button/window name>, <font awesome icon name (optional)>, <compability mode (optional)>]`  
_If you don't include a font awesome icon or name it `none` it uses the <a href=""><img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/1147d199a35293b391152ee85e2d30988439157f/svgs/solid/external-link-alt.svg" alt="" height="16" /></a> icon._

Here is an example entry:  

```plaintext
[https://foundryvtt.com/api/, Foundry API, fas fa-code], [https://foundryvtt.com, Foundry], [https://dndbeyond.com, DnDBeyond, none, true]
```  

_Keep in mind that when working in a journal everything inside a `[ ]` entry should be on the same line._

## Troubleshooting

* If the site disallows embedding in iframes you can try enabling compability mode, compability mode might not fully fix the issue and will spam the console with errors.

* If your url has a \[ or \] in it it will break the module.

## Example

![Preview](https://i.imgur.com/5E36O9u.gif)

## Changelog

Check the [Changelog](https://github.com/ardittristan/VTTInlineWebviewer/blob/master/CHANGELOG.md)
