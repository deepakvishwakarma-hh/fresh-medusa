type TapAuthorizePayload = {
    amount: number;
    currency: string;
    customer_initiated: boolean;
    threeDSecure: boolean;
    save_card: boolean;
    statement_descriptor: string;
    metadata: {
        udf1?: string;
        udf2?: string;
        udf3?: string;
        [key: string]: any; // For additional fields
    };
    reference: {
        transaction: string;
        order: string;
    };
    receipt: {
        email: boolean;
        sms: boolean;
    };
    customer: {
        first_name: string;
        middle_name: string;
        last_name: string;
        email: string;
        phone: {
            country_code: string;
            number: string;
        };
    };
    merchant: {
        id: string;
    };
    source: {
        id: string;
    };
    authorize_debit: boolean;
    auto: {
        type: string; // VOID or other types
        time: number;
    };
    post: {
        url: string;
    };
    redirect: {
        url: string;
    };
};
