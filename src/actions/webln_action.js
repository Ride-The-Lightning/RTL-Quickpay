import lightningPayReq from "bolt11";
import utils from "~/common/lib/utils";

export const getInfo = async (message, sender) => {
    const connector = await state.getState().getConnector();
    const info = await connector.getInfo();
  
    return {
      data: {
        node: {
          alias: info.data.alias,
          pubkey: info.data.pubkey,
          color: info.data.color,
        },
      },
    };
};

export const makeInvoiceWithPrompt = async (message) => {
    const amount = message.args.amount || message.args.defaultAmount;
    const memo = message.args.memo || message.args.defaultMemo;
    const amountEditable = !message.args.amount;
    const memoEditable = !message.args.memo || message.args.memo === "";
    // If amount is not defined yet, let the user generate an invoice with an amount field.
    try {
        const response = await utils.openPrompt({
            origin: message.origin,
            action: "makeInvoice",
            args: {
                amountEditable,
                memoEditable,
                invoiceAttributes: {
                    amount,
                    memo,
                    minimumAmount: message.args.minimumAmount,
                    maximumAmount: message.args.maximumAmount,
                },
            },
        });
        return response;
    }
    catch (e) {
        return { error: e instanceof Error ? e.message : e };
    }
};

async function payWithPrompt(message) {
    try {
        const response = await utils.openPrompt(Object.assign(Object.assign({}, message), { action: "confirmPayment" }));
        return response;
    }
    catch (e) {
        console.error("Payment cancelled", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
}

export const signMessageOrPrompt = async (message) => {
    const messageToSign = message.args.message;
    if (typeof messageToSign !== "string") {
        return {
            error: "Message missing.",
        };
    }
    return signWithPrompt(message);
};

export {
    payWithPrompt,
}