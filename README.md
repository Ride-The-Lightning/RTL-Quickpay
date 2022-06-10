## RTL-Quickpay
RTL-Quickpay is a browser extension, to make lightning payments quickly via [RTL](https://github.com/ShahanaFarooqui/RTL) running on your *local network*.

Browsers Supported:
* Chrome
* Firefox

### Prerequisites
[RTL](https://github.com/ShahanaFarooqui/RTL) running on your local network and connected to LND/Core-lightning/Eclair node.

### Install
* Chrome Webstore [link](https://chrome.google.com/webstore/detail/rtl-quick-pay/bnlpaipkkgfdojfdlmakgjngbiepghof)
* Firefox Add-ons [link](https://addons.mozilla.org/en-US/firefox/addon/rtl-quickpay)

### Configure
To use RTL-Quickpay, just enter the RTL server URL on the extension and the password configured for RTL.
The server URL will be saved for re-use and can be updated as required.
If you are running multiple nodes via RTL, the extension will list all the nodes. You can select the node you want to make the payment from.

### Build Instructions
* npm install - It will install required dependencies.
* npm run build - Build script that executes all necessary technical steps. It will bundle at ./dist folder and zip the build as <root>/RTL-Quickpay-v<version>.zip.

### OS & other requirements
* Windows OS
* NodeJS version 8 and above
* npm version 6 and above
