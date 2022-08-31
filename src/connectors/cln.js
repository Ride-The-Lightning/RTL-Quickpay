const GetInfoResponse = require('./connectors.interface.js');
import utils from "../shared/utils";

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

    sendPayment(args) {
        return this.request("POST", "/v1/channels/transactions", {
            payment_request: args.paymentRequest,
        }, {}).then((data) => {
            if (data.payment_error) {
                throw new Error(data.payment_error);
            }
            return {
                data: {
                    preimage: utils.base64ToHex(data.payment_preimage),
                    paymentHash: utils.base64ToHex(data.payment_hash),
                    route: data.payment_route,
                },
            };
        });
    }

    makeInvoice(args) {
        return this.request("POST", "/v1/invoices", {
            memo: args.memo,
            value: args.amount,
        }).then((data) => {
            return {
                data: {
                    paymentRequest: data.payment_request,
                    rHash: utils.base64ToHex(data.r_hash),
                },
            };
        });
    }

    getAddress() {
        return this.request("POST", "/v2/wallet/address/next", undefined, {});
    }

    async getInvoices() {
        const data = await this.request("GET", "/v1/invoices", { reversed: true });
        const invoices = data.invoices
            .map((invoice, index) => {
            const custom_records = invoice.htlcs[0] && invoice.htlcs[0].custom_records;
            return {
                custom_records,
                id: `${invoice.payment_request}-${index}`,
                memo: invoice.memo,
                preimage: invoice.r_preimage,
                settled: invoice.settled,
                settleDate: parseInt(invoice.settle_date) * 1000,
                totalAmount: invoice.value,
                type: "received",
            };
        })
            .reverse();
        return {
            data: {
                invoices,
            },
        };
    }

    async request(method, path, args, defaultValues) {
        const url = new URL(this.config.url);
        url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
        let body = null;
        const headers = new Headers();
        headers.append("Accept", "application/json");
        if (method === "POST") {
            body = JSON.stringify(args);
            headers.append("Content-Type", "application/json");
        }
        else if (args !== undefined) {
            url.search = new URLSearchParams(args).toString();
        }
        if (this.config.macaroon) {
            headers.append("Grpc-Metadata-macaroon", this.config.macaroon);
        }
        const res = await fetch(url.toString(), {
            method,
            headers,
            body,
        });
        if (!res.ok) {
            let errBody;
            try {
                errBody = await res.json();
                // map it over for now.
                if (errBody.message && !errBody.error) {
                    errBody.error = errBody.message;
                    delete errBody.message;
                }
                if (!errBody.error) {
                    throw new Error("Something went wrong");
                }
            }
            catch (err) {
                throw new Error(res.statusText);
            }
            console.error(errBody);
            throw new Error(errBody.error);
        }
        let data = await res.json();
        if (defaultValues) {
            data = Object.assign(Object.assign({}, defaultValues), data);
        }
        return data;
    }
}

export default Cln;