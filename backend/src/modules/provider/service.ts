import {
    AbstractPaymentProvider,
    BigNumber,
    MedusaError
} from "@medusajs/framework/utils"

import axios, { AxiosResponse } from "axios"

import { CreatePaymentProviderSession, Logger, PaymentProviderError, PaymentProviderSessionResponse, PaymentSessionStatus, ProviderWebhookPayload, UpdatePaymentProviderSession, WebhookActionResult } from "@medusajs/framework/types"

import {
    authorizePayment,
    cancelPayment,
    capturePayment,
    getStatus,
    refundPayment,
    init,
    refund,
    retrieve,
    update
} from "./client"

interface TapInitiatePaymentResponse {
    id: string;
    status: string;
    redirect: {
        url: string;
    };
}

class MyPaymentProviderService extends AbstractPaymentProvider<{}> {
    static identifier = "my-payment"

    private baseUrl: string;
    private secretKey: string;


    constructor() {
        // @ts-ignore
        super(...arguments)

        this.baseUrl = "https://api.tap.company/v2";
        this.secretKey = "sk_test_ckCgMW3YKxqS4Ho0z67vypwO";
    }


    static validateOptions(options: Record<any, any>) {
        // if (!options.apiKey) {
        //     throw new MedusaError(
        //         MedusaError.Types.INVALID_DATA,
        //         "API key is required in the provider's options."
        //     )
        // }
    }



    // {
    //     context: { session_id: 'payses_01JFEZKKZ34HE388J0X3EBKYZE' },
    //     amount: 10,
    //     currency_code: 'eur'
    //   }

    async initiatePayment(
        context: CreatePaymentProviderSession
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {

        // const {
        //     amount,
        //     currency_code
        // } = context

        try {
            const response: AxiosResponse<TapInitiatePaymentResponse> = await axios.post(
                `${this.baseUrl}/charges`,
                {
                    "amount": 100,
                    "currency": "KWD",
                    "source": {
                        "id": "src_all"
                    },
                    "customer": {
                        "first_name": "deepak",
                        "email": "deepak@gmail.com"
                    },
                    "redirect": {
                        "url": "/"
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Initiate Payment Response:", response);
            // @ts-ignore
            // return { id: response.data.id, session_data: response.data };

            return {
                data: {
                    id: "apple"
                }
            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }



    async capturePayment(
        paymentData: Record<string, unknown>
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        const externalId = paymentData.id

        console.log(paymentData)

        try {
            // const newData = await capturePayment(externalId)

            return {
                // ...newData,
                id: externalId
            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }


    async authorizePayment(
        paymentSessionData: Record<string, unknown>,
        context: Record<string, unknown>
    ): Promise<
        PaymentProviderError | {
            status: PaymentSessionStatus
            data: PaymentProviderSessionResponse["data"]
        }
    > {
        const externalId = paymentSessionData.id



        try {
            // const paymentData = await authorizePayment(externalId)


            console.log("<<< authorize payment", paymentSessionData, context)

            return {
                data: {
                    // ...paymentData,
                    id: externalId
                },
                status: "authorized"
            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }

    async cancelPayment(
        paymentData: Record<string, unknown>
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        const externalId = paymentData.id

        try {
            const paymentData = await cancelPayment(externalId)
            return {}
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }




    async deletePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProviderError | PaymentProviderSessionResponse["data"]
    > {
        const externalId = paymentSessionData.id

        try {
            await cancelPayment(externalId)
            return {

            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }


    async getPaymentStatus(
        paymentSessionData: Record<string, unknown>
    ): Promise<PaymentSessionStatus> {
        const externalId = paymentSessionData.id

        try {
            const status = await getStatus(externalId)

            switch (status) {
                case "requires_capture":
                    return "authorized"
                case "success":
                    return "captured"
                case "canceled":
                    return "canceled"
                default:
                    return "pending"
            }
        } catch (e) {
            return "error"
        }
    }


    async refundPayment(
        paymentData: Record<string, unknown>,
        refundAmount: number
    ): Promise<
        PaymentProviderError | PaymentProviderSessionResponse["data"]
    > {
        const externalId = paymentData.id

        try {
            const newData = await refund(
                externalId,
                // refundAmount
            )

            return {
                ...newData,
                id: externalId
            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }


    async retrievePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProviderError | PaymentProviderSessionResponse["data"]
    > {
        const externalId = paymentSessionData.id

        try {
            return await retrieve(externalId)
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }


    async updatePayment(
        context: UpdatePaymentProviderSession
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
        const {
            amount,
            currency_code,
            context: customerDetails,
            data
        } = context
        const externalId = data.id

        try {
            const response = await update(
                externalId,
                // {
                //     amount,
                //     currency_code,
                //     customerDetails
                // }
            )

            return {
                ...response,
                data: {
                    id: response.id
                }
            }
        } catch (e) {
            return {
                error: e,
                code: "unknown",
                detail: e
            }
        }
    }




    async getWebhookActionAndData(
        payload: ProviderWebhookPayload["payload"]
    ): Promise<WebhookActionResult> {
        const {
            data,
            rawData,
            headers
        } = payload

        try {
            switch (data.event_type) {
                case "authorized_amount":
                    return {
                        action: "authorized",
                        data: {
                            session_id: (data.metadata as Record<string, any>).session_id,
                            amount: new BigNumber(data.amount as number)
                        }
                    }
                case "success":
                    return {
                        action: "captured",
                        data: {
                            session_id: (data.metadata as Record<string, any>).session_id,
                            amount: new BigNumber(data.amount as number)
                        }
                    }
                default:
                    return {
                        action: "not_supported"
                    }
            }
        } catch (e) {
            return {
                action: "failed",
                data: {
                    session_id: (data.metadata as Record<string, any>).session_id,
                    amount: new BigNumber(data.amount as number)
                }
            }
        }
    }
}

export default MyPaymentProviderService