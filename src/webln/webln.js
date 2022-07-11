class WebLNProvider {   // Connect to the web browser
    enable() {
        if (this.enabled) {
            return Promise.resolve({ enabled: true });
          }
          return this.execute("enable").then((result) => {
            if (typeof result.enabled === "boolean") {
              this.enabled = result.enabled;
              this.isEnabled = result.enabled;
            }
            return result;
          });
    }

    getInfo() {
      return this.enable()
        .then(() => this._prompt(REQUEST_GETINFO))
        .then(info => ({
          node: {
            alias: info.alias,
            pubkey: info.id,
            color: info.color
          }
        }))
    }

    sendPayment(invoice) {
      return this.enable()
        .then(() => this._prompt(PROMPT_PAYMENT, {invoice}))
        .then(preimage => ({preimage}))
    }

    _prompt(type, params) {
      return this._sendMessage({type, ...params})
    }
}

// getTransactions

// send Payments

// keysend