export default class WebLNProvider {
  constructor() {
      this.enabled = false;
      this.isEnabled = false; 
      this.executing = false;
  }
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
      if (!this.enabled) {
          throw new Error("Provider must be enabled before calling getInfo");
      }
      return this.execute("getInfo");
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(action, args) {
      return new Promise((resolve, reject) => {
          // post the request to the content script. from there it gets passed to the background script and back
          // in page script can not directly connect to the background script
          window.postMessage({
              application: "RTL",
              prompt: true,
              action: `${action}`,
              args,
          }, "*" // TODO use origin
          );
          function handleWindowMessage(messageEvent) {
              // check if it is a relevant message
              // there are some other events happening
              if (!messageEvent.data ||
                  !messageEvent.data.response ||
                  messageEvent.data.application !== "LBE") {
                  return;
              }
              if (messageEvent.data.data.error) {
                  reject(new Error(messageEvent.data.data.error));
              }
              else {
                  // 1. data: the message data
                  // 2. data: the data passed as data to the message
                  // 3. data: the actual response data
                  resolve(messageEvent.data.data.data);
              }
              // For some reason must happen only at the end of this function
              window.removeEventListener("message", handleWindowMessage);
          }
          window.addEventListener("message", handleWindowMessage);
      });
  }
}