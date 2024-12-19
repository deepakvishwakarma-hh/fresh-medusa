
import axios, { AxiosInstance } from "axios";
const apiKey = "sk_test_XKokBfNWv6FIYuTMg5sLPjhJ", baseUrl = "https://api.tap.company/v2"

export const tapPaymentAxiosClient = axios.create({
    baseURL: baseUrl,
    headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    },
});

export const init: methodType = async (payload) => {
    console.log("<<<<< init", payload)
    // create authorize here..
}

type methodType = (payload: any) => Promise<any>

export const authorizePayment: methodType = async (payload) => {
    console.log("<<<<< authorizePayment", payload)
}

export const capturePayment: methodType = async (payload) => {
    console.log("<<<<< capturePayment", payload)
}

export const refundPayment: methodType = async (payload) => {
    console.log("<<<<< refundPayment", payload)
}

export const cancelPayment: methodType = async (payload) => {
    console.log("<<<<< cancelPayment", payload)
}

export const getStatus: methodType = async (payload) => {
    console.log("<<<<< getStatus", payload)
}



export const refund: methodType = async (payload) => {
    console.log("<<<<< refund", payload)
}

export const retrieve: methodType = async (payload) => {
    console.log("<<<<< retrieve", payload)
}

export const update: methodType = async (payload) => {
    console.log("<<<<< update", payload)
}






