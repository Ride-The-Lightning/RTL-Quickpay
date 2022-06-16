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
}

// getInfo 

// getTransactions

// send Payments

// keysend