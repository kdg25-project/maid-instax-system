type SaveInstaxRequest = {
    instax_id: number;
    image_file: FormData;
}

type SaveInstaxResponse = {
    success: true;
    messeage: string;
    data: {
        id: number;
        user_id: string;
        maid_id: string;
        image_url: string;
    }
} | {
    success: false;
    message: string;
    details: string;
}

export async function saveInstax(requestData: SaveInstaxRequest): Promise<SaveInstaxResponse> {
    const apiUrl = `https://api.kdgn.tech/api/instax`
    try {
        const apiKey = localStorage.getItem("apiKey") || ""

        const FormData = requestData.image_file;
        FormData.append("instax_id", String(requestData.instax_id));

        const response = await fetch(apiUrl, {
            method: "PATCH",
            headers: {
                "x-api-key": apiKey,
            },
            body: FormData,
        });

        const data = await response.json();

        return data as SaveInstaxResponse;
    } catch (err) {
        return {
            success: false,
            message: "チェキ保存に失敗しました",
            details: String(err),
        };
    }
}