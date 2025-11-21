import { AxiosError, type AxiosResponse } from "axios";

type ApiErrorResponse = {
    detail?: { error?: string } | string;
    error?: string;
    message?: string;
};

export async function apiRequest<T>(
    promise: Promise<AxiosResponse<T>>,
    defaultMessage: string
): Promise<{ ok: boolean; data?: T; message: string }> {

    try {
        const response = await promise;
        return {
            ok: true,
            data: response.data,
            message: "Operación realizada correctamente",
        };

    } catch (error) {
        console.error("API error:", error);

        return {
            ok: false,
            message: getErrorMessage(error, defaultMessage),
        };
    }
}

function getErrorMessage(error: unknown, defaultMessage: string): string {

    if (error && typeof error === "object" && "isAxiosError" in error) {
        const apiError = error as AxiosError<ApiErrorResponse>;
        const data = apiError.response?.data;

        if (!data) return defaultMessage;

        // detail como string
        if (typeof data.detail === "string") {
            return data.detail;
        }

        // detail como objeto { error: "..." }
        if (typeof data.detail === "object" && data.detail?.error) {
            return data.detail.error;
        }

        if (data.error) return data.error;
        if (data.message) return data.message;
    }

    return defaultMessage;
}
