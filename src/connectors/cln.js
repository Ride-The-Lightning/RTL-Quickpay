const GetInfoResponse = require('./connectors.interface.js');

class Cln{
    init() {
        return Promise.resolve();
      }
    
    unload() {
    return Promise.resolve();
    }

    getInfo() {
        return this.request("GET", "/v1/getinfo", undefined, {}).then((data) => {
            return {
                data: {
                    alias: data.alias,
                    pubkey: data.identity_pubkey,
                    color: data.color,
                },
            };
        });
    }
}

export default Cln;