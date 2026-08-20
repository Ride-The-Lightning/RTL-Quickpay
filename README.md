# ⚠️ Deprecated — this project is no longer maintained

RTL-Quickpay was a browser extension for making quick lightning payments via
[RTL](https://github.com/Ride-The-Lightning/RTL) running on your local network.
It has been unmaintained since 2022 and this repository is now **archived**.

**Do not install the old store builds.** The extension is built on Manifest V2,
which modern Chrome can no longer load, and the published packages date from
2020. An extension this old that handles your node's RTL password should not be
trusted with a live node.

### Alternatives

* [RTL](https://github.com/Ride-The-Lightning/RTL) itself remains actively
  maintained and is the recommended way to manage and pay from your LND,
  Core Lightning, or Eclair node.
* For paying lightning invoices directly from the browser, use a
  [WebLN](https://webln.dev)-compatible extension such as
  [Alby](https://getalby.com), which can connect to your own node.

The code below is preserved for reference only.

---

## RTL-Quickpay
RTL-Quickpay is a browser extension, to make lightning payments quickly via [RTL](https://github.com/Ride-The-Lightning/RTL) running on your *local network*.

Browsers Supported:
* Chrome
* Firefox

### Prerequisites
[RTL](https://github.com/Ride-The-Lightning/RTL) running on your local network and connected to LND or C-lightning node.

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
