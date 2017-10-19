# node-red-contrib-uibuilder

A Node-RED web user interface builder.

Designed as an alternative to the Node-RED Dashboard. See the *[Known Issues](#known-issues)*
and *[To Do](#to-do)* sections below for what might still need some work.

The idea is to allow users to use their own html/css/js/etc code to define a UI on a specific URL (end-point) that is defined in Node-RED by this node. Also to easily allow loading of external front-end libraries.

*Breaking Change in 0.4.0*: You must have at least `index.html` in your local override folder. For Socket.IO, you will also need to have `index.js`.

*Front-end changes in 0.4.2 & 0.4.5*: You will want the new master template files as they use a new library that makes your own custom code very much easier.

Eventually, you will be able to "compile" src files using webpack from a button in the nodes config.
That will let you using all manner of frameworks such as Vue, REACT, Foundation, etc.

The final evolution will be to provide configuration nodes to let you define framework or html/css/js files in Node-RED itself so that you won't need access to the servers file system at all.

This is rather the opposite of Node-RED's Dashboard. Whereas that is designed to make it very easy to create a UI but trades that off with some limitations, this is designed to let you do anything you can think of with any framework but at the trade off of greater complexity and a need to write your own front-end code. This node should also be a **lot** faster and more resource efficient in use than Dashboard though that obviously depends on what front-end libraries and frameworks you choose to use.

## Contents
<!-- TOC -->

- [node-red-contrib-uibuilder](#node-red-contrib-uibuilder)
    - [Contents](#contents)
    - [Additional Documentation](#additional-documentation)
    - [Out of the box](#out-of-the-box)
    - [Features](#features)
    - [Preference Tree](#preference-tree)
        - [Front-end path summary](#front-end-path-summary)
        - [Physical file/folder location summary](#physical-filefolder-location-summary)
    - [Known Issues](#known-issues)
    - [To Do](#to-do)
    - [Possibilities for further thought](#possibilities-for-further-thought)
    - [Changes](#changes)
    - [Dependencies](#dependencies)
    - [Install](#install)
    - [Node Instance Settings](#node-instance-settings)
    - [Discussions and suggestions](#discussions-and-suggestions)
    - [Contributing](#contributing)
    - [Developers/Contributors](#developerscontributors)

<!-- /TOC -->

## Additional Documentation

There is a little more information available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).
- [Example: Using MoonJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-MoonJS)
- [Example: Using RiotJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-RiotJS)
- [Sending Messages to Specific Client Instances](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances)
- [Use on Mobile Browsers](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Use-on-Mobile-Browsers)
- [Developing Front End Code](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Developing-front-end-code)

## Out of the box

Out of the box, you get a simple `index.html` template with matching `index.css` & `index.js` JavaScript.
These are automatically copied over from the module's master template folder to the instance's src folder when you first deploy so that you can override them.
If you want to reset, you can simply delete your local copies and the master templates will be copied back _when you restart Node-RED_.

JQuery is used in the default JavaScript to give dynamic updates to the web page. If all you need to do
is some simple dynamic updates of the page, JQuery is likely enough. Normalize.css is also provided to help you with
standard look and feel. Just remove the references in index.html and the code from index.js if you don't want them.

Any msg sent to the node is forwarded directly to the front-end and is available in the global `msg` variable
as it would be in Node-RED, use the `msgSend` function to send a message back to Node-RED that
will be passed downstream from the node.
The msg can contain script and style information that will be dynamically added to the web page if allowed by the settings.

You will want to change the front-end code to match your requirements since, by default, it displays some rough dynamic information using JQuery and reflects any received messages back to Node-RED (including control messages). You can find this in `~/.node-red/uibuilder/<url>` by default. As a minimum, you need an `index.html` file. But you need the `index.js` file as well if you want Socket.IO communications to work. You will also need `manifest.json` for mobile use.

The local `index.(html|js)` files are well documented and should show you how to get started with your own customisations. There are also some examples, with code, on the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).

_[back to top](#contents)_

## Features

- A single node is used to define an end-point (by its URL path).
  The node can be included in flows as many times as you like - but each instance **must** have a unique URL path name.

- Each node instance gets its own Socket.IO namespace matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.

- There is a front-end library `uibuilderfe.min.js` or `uibuilderfe.js` that hides all the complexities of using Socket.IO
  so that your own FE code is easy to write. The default `index.js` file has details and examples of use.

- Users can install front-end libraries using npm into their `userDir` folder.
  If using the `src` sub-folder, these can be accessed in front-end code via the "vendor" path, see below. The list of user libraries made available is given via Node-RED's settings.js file in `uibuilder.userVendorPackages` (Eventually, also via the nodes settings).

- The node's module contains default html, JavaScript and CSS master template files that are
  copied to your local src folder for you to edit as required.

- Any msg sent to a node instance is sent through to the UI via Socket.IO.
  If `topic` is set in settings and not in the `msg`, the version from settings will be added.
  NOTE that this may present security and/or performance issues. In particular, you should remove msg.res and msg.req objects as they are both very large and often contain circular references.

- Sent msg's can have a `msg.script` and `msg.style` property that will dynamically
  add that code to the web page - if allowed by the settings (default is off)

- Including a `_socketId` attribute on messages sent from Node-RED will send to that ID only.
  An ID is associated with a specific browser tab and is reset when the page is reloaded so this isn't too easy to use as yet (see [To Do list](to-do)).
  The `_socketId` attribute is added to any msg sent from the client to Node-RED.
  See [the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances) for more information.

- On deployment of the *first* instance of uibuilder,
  a new folder is created within your Node-RED user directory (typically `~/.node-red`) with a fixed name of `uibuilder`.

- On deployment of any new instance, a new sub-folder within `uibuilder` is created.
  The name is the same as the URL path specified in the node instance's settings. (defaults to `uibuilder`). `src` and `dist` sub-folders are also created.

- If the local `dist` folder contains an `index.html` file, the `dist` folder will be used,
  otherwise the `src` folder will be used.

- Any resource (html, css, js, image, etc) placed within the `dist`/`src` sub-folder
  is available to the browser client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above). That URL will load `index.html`

- Eventually, a link to webpack will be provided to enable packing/compiling
  of `src` code to `dist`.
  This will enable front-end code to use non-native libraries such as JSX, ES6, Foundation, etc.

You might like to try some lightweight front-end libraries (in addition to or instead of the included JQuery and Normalize.css):
- [MoonJS](http://moonjs.ga) is a minimal, blazing fast user interface library. Only 7kb.
  Based originally on the Vue API, uses a virtual DOM, possibly the simplest UI library to use. You can remove JQuery if you use this, it isn't needed.
- [RiotJS](http://riotjs.com/) is a lightweight UI library, REACT-like but only 10k.
- [Mini.CSS](http://minicss.org/index) is a minimal, responsive, style-agnostic CSS framework. Only 7kb. You can remove Normalize.css if you use this, it is built in.

Examples for using some of these are available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki)

_[back to top](#contents)_

## Preference Tree

The uibuilder node adds a number of statically served web resource locations (physical file-system locations) to the URL path (default `/uibuilder`) defined. It is up to the user to ensure that file/folder names do not clash.

Note that if using the local folders (1 or 2 below), the default/master folders (3/4) are also still available.

The order of preference is as follows:

1. The `dist` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/dist`)

   *only added if index.html exists in this folder*

2. The `src` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   In this case, an optional node configuration variable (`uibuilder.userVendorPackages`) is used to provide a list of package names that will be added to the `vendor` sub-path of the URL so that users can install their own front-end libraries. This is only added when not using the dist folder as that is expected to have all of the vendor code compiled together using webpack.

   If you want to *reset* any of the front-end files back to the master template, simply delete one or more of them from this folder. They will be copied back from the master _when you restart Node-RED_.

3. The node installations `dist` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/dist`)

   *only added if index.html exists in this folder*

4. The node installations `src` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   This folder currently only contains am `images` folder that contains: `logo-red.png`, `logo.png`, `node-red.ico`.

   Override these as needed using the local folders (1/2).

The `vendor` subpath will be always be available with some pre-installed vendor packages.
Currently `normalize.css` and `jquery` are always available.

In addition, this node uses the httpNodeMiddleware Node-RED setting allowing for ExpressJS middleware to be used. For example, implementing user security.

_[back to top](#contents)_

### Front-end path summary

Front-end files in `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src/` may use the url paths:

- `[/<httpNodeRoot>]/<url>/` - for most things
  e.g. `<script src="index.js"></script>`

- `vendor` - for things like normalize.css & JQuery and other front-end libraries installed using
  npm either by this module or as packages in your `userDir` e.g. `<link rel="stylesheet" href="vendor/normalize.css/normalize.css">`

- `<script src="/uibuilder/socket.io/socket.io.js"></script>` - for socket.io
  The static /uibuilder prefix is used here to ensure all instances of clients for this node use the same, correct, instance of socket.io

### Physical file/folder location summary

Folders and files for resources on the device running Node-RED are:

- `<userDir>/uibuilder/<url>/src/` - local source files for front-end use (e.g. html, js, css)
- `<userDir>/uibuilder/<url>/dist/` - local compiled files for front-end use
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/template/` -
  this modules master template source files for front-end use - copied to local folders on deployment
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/src/` -
  this modules source files for front-end use (e.g. html, js, css)
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/dist/` - this modules compiled files for front-end use
- `<userDir>/node_modules/<package-name>` - when included via the `uibuilder.userVendorPackages` global
  setting (in `settings.js`). Note that each package will have its own folder structure that you will need to understand in order to use the package in the browser. These are often poorly documented.

_[back to top](#contents)_

## Known Issues

I don't believe any of the current issues make the node unusable. They are mainly things to be aware of & that I'd like to tidy up at some point.

- **Socket.IO is not yet secured!** Do not use over the Internet unless you *really* don't care
  about the data you are passing back and forth. I would love some help with this so if you know how, please issue a pull request. It should use TLS encryption if your Node-RED site uses it but this has not yet been tested.

  You can work around this by using a proxy such as NGINX or HAproxy to be the TLS endpoint. Just make sure you proxy the websocket traffic as well as the standard web traffic.

- Uniqueness of the URL is not yet being validated for multiple instances, could cause
  some "interesting" effects!

- Modules to be used for front-end code (e.g. JQuery) **must** be installed under `<userDir>`.
  Some installs don't seem to be doing this for some reason.
  See [Issue 2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/2). Added some extra code to try and deal with this but it may
  not be 100% reliable.

_[back to top](#contents)_

## To Do

These would be nice to do at some point and would make the node more robust and a bit easier to use in places.

Please feel free to contribute a pull request if you would like to,

- Add validation to `url` setting
  Allow A-Z, a-z, 0-9, _, - and / only. Limit to 50 characters (maybe less)

- Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end
  Started: script/style is removed if disallowed in settings

- Add integrated ExpressJS security to Socket.IO

- Process `httpNodeAuth`

- Add feature to send a refresh indicator to FE when switching local
  folder use on/off so that FE auto-reloads

- Add ability to auto-install missing modules.

- Add ability to create resources from the Node-RED admin UI - currently all resources have
  to be created in the file system. Ideally, we would have editors in the node that allowed HMTL, JavaScript and CSS content to be created. We would also possibly allow such content to be passed on the msg though that could be somewhat dangerous so probably should be an option.

- Use webpack to "compile" resources into distribution folders upon (re)deployment -
  allowing for the use of more resource types such as: less/scss; UI frameworks such as Bootstrap, Foundation, Material UI; jsx or other dynamic templating; front-end frameworks such as VueJS, Angular or REACT.

- If using `dist` code, Add a check for new file changes in local `src` folder

## Possibilities for further thought
These are random thoughts that might make it into the To Do list but really need more thought before committing to them.

- Tidy up Socket.IO control messages so they add value. When the client receives its first
  control msg, it should respond so that the server can track the socketID's of connected clients (see "Show Connection" flag idea below).

- Add "Show Connection" flag to admin ui. Would output a message on each connection that would
  include the socketId. Allowing for processing of messages back to a specific client instance.

- Add Debug flag to admin ui. Pass throught to FE if set.

- Add sender IP address when sending msg from browser - so that Node-RED can
  differentiate where things are coming from.
  The `_socketId` obviously already identifies the originator technically but additional info might be helpful.
  _Possibly make this optional. Maybe have other optional data too such as device_

- _(Maybe compile template resources to dist folder?)_

- _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._


_[back to top](#contents)_

## Changes

v0.4.7

- CL: Added check and load Socket.IO for running via webpack.
- CL: Reinstate missing force (re)connection to Socket.IO check on initialisation.
- Fix typo in readme

v0.4.6

- Added ability to include `msg.script` and `msg.style` in messages sent to the front-end from Node-RED (over Socket.IO).
  These must contain valid javascript and CSS respectively in the form of strings or arrays of strings. Currently there is minimal validation so some caution should be used. I will be adding configuration flags to allow admins to block this.
- Added new node configuration flags to (dis-)allow scripts or styles to be input via incoming msg's.
- Added new node configuration flag to easily turn on/off debugging information in the front-end -
  check the browser developer console for the additional output if turned on. You can still override in `index.js` or at the browser developer console by using `uibuilder.debug(true)` etc.
- FIX: Bug that didn't correctly remove/re-apply Express static routes on (re)deploy has been fixed.

v0.4.5

**Note:** The master front-end template files have changed again. Specifically, they now use a minimised version of `uibuilderfe.min.js` & that code is better isolated, only the `uibuilder` function is exposed.

- Minimised and better isolated the front-end code.
- Some minor issues dealt with in the FE code.
- New FE function: `uibuilder.me()` that either returns the code version (if debug not set) or the complete function object for better debugging.
- `uibuilder.debug()` now returns the current debug state if no boolean parameter given. Parameter validated as boolean|undefined.
- Fixes for changes in new version of `get-installed-path`.
- Begun to add JSDoc throughout and added `// @ts-check` to better validate code.
- Update dependencies to latest.

v0.4.2

**Note:** The master front-end template files have changed significantly in this release. It is suggested that you rename your local folder (`~/.node-red/uibuilder/uibuilder`) - and let the node rebuild it for you with the latest template. Most of the message handling code is now hidden away in a JavaScript file that you don't need to deal with `uibuilderfe.js`. The new `index.html` automatically loads that for you and the new `index.js` shows you how to use it. The old templates still work but aren't as nice and may stop working correctly in the future.

- Restructure the front-end JavaScript.
  A single global object is created by `uibuilderfe.js` called `uibuilder`. This encapsulates all of the core logic. It has an `onChange` method that lets you monitor its attributes for changes and take action as appropriate.
  Debugging is also easier to turn on/off by the function `uibuilder.debug(true)`. It has `set` and `get` methods for writing/reading attributes; `set` disallows setting of core attributes.
  There is also a `uibuilder.send` method that sends a message back to Node-RED - e.g. `uibuilder.send({topic:'uibuilder',payload:'Smashing!'})`
- Fix for using `dist` folders instead of `src` ([Issue 13](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/13)). Also improved debug logs
- Changed logging so that, if not using the debug setting,
  produces only minimal output and that goes to the standard Node-RED log instead of the log file. Turning on debugging using the setting in `settings.js` will output to the log file `~/.node-red/uibuilder.log`
- Added default master src/index.html which covers the situation where you delete your live, local index.html from dist or src. You get a page that tells you how to fix it.
- Page icon changed from red to blue to help visual identification of the page amongst other Node-RED tabs
- More tidying of the documentation. Making sure it is consistent and removing to do entries now completed

v0.4.0

**Breaking Change**: You must have at least `index.html` in your local override folder. For Socket.IO, you will also need to have `index.js`.

- Copy template files to local override folder if not already existing - this will
  save users having to hunt down the template files which exist in this module.
- Move master front-end files from `src` to `templates` folder.
- Tweak front-end `index.js`, better Socket.IO reconnect logic
  (thanks to [Colin Law](https://github.com/colinl), [Issue 9](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/9), [Pull request #11)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/11).
  Also tidy code and start to extract JQuery specifics from core logic in preparation for a complete separation to make coding easier for users.
- Enable msg's to be sent from server to a specific client instance by adding `_socketId`
  attribute to the `msg`. The ID must match the appropriate client ID of course.
- Links to WIKI and table of contents added to README.
- Switch from using fs to use fs-extra node.js module. Initially for copying the template files but later on for refactoring all fs code.
- Remove config switch for "Use reproduces in custom folder" as this is always done now.
- Add connected state to default page template
  (thanks to [Colin Law](https://github.com/colinl), [Pull request #12](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/12))

See [CHANGELOG](CHANGELOG.md) for more detail.

_[back to top](#contents)_

## Dependencies

See the package.json file. Currently:

- [normalize.css](https://necolas.github.io/normalize.css/) - front-end only
- [JQuery](https://jquery.com/) - front-end only
- [Socket.IO](https://socket.io/) - front-end and server
- [serve.static](https://github.com/expressjs/serve-static) - server only
- [webpack v2](https://webpack.github.io/) - server only

## Install

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```
npm install node-red-contrib-uibuilder
```

Run Node-RED and add an instance of the UI Builder node. Set the required URL path and deploy.

The UI should then be available at the chosen path. The default would normally be <http://localhost:1880/uibuilder>
(if default Node-RED and node settings are used).

_[back to top](#contents)_

## Node Instance Settings

Each instance of the uibuilder node has the following settings available.

**`name` (optional)**

Only used in the Node-RED admin UI.

**`topic` (optional)**

Only used if an inbound msg does not contain a topic attribute. Passed on to client UI upon receipt of a msg.

**`url` (required, default = 'uibuilder')**

The path used to access the user interface that this node builds.
So on `localhost`, if none of the port nor `https` nor `httpRoot` settings are defined (in Node-RED's `settings.js` file), the URL of the default interface would be `http://localhost:1880/uibuilder`

**It is up to the flow author to ensure that no duplicate names are used, the node
does not check or enforce uniqueness.**

**Forward received messages direct to output? (default = false)**

Forwards a copy of every received message direct to the output.
Adds the topic from the above setting if one isn't present in the msg.

_Note_ that this may result in multiple output messages if your front-end code also auto-sends inbound messages.

**`userVendorPackages` (optional)**

A list of npm package names (as they appear in `node_modules`) that the node will make
available to front-end code under the `uibuilder/vendor` path.

All instances of this node will also use the `uibuilder.userVendorPackages` attribute of
`settings.js` unless defined in the node's settings.

**`debug` (optional, default=false)**

Only available using the `uibuilder.debug` attribute of
`settings.js`. Set to `true` to output additional debugging information.

_[back to top](#contents)_

## Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

## Contributing

If you would like to contribute to this node, you can contact Totally Information via GitHub or raise a request in the GitHub issues log.

If submitting code (preferably via a pull request), please use eslint to adhere to the same standards.

## Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)


- [Colin Law](https://github.com/colinl) - many thanks for testing, corrections and pull requests.


<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>


_[back to top](#contents)_
