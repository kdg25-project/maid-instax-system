export type InstaxShowResponse = {
    success: true;
    message: string;
    data: {
        id: number,
        user_id: string,
        maid_id: string,
        image_url: string
    }
} | {
    success: false;
    message: string;
    details: string;
}

export function instaxShow(userId: string): Promise<InstaxShowResponse> {
    const apiUrl = `/api/instax/${userId}`;
    return fetch(apiUrl, {
        method: "GET",
    })
        .then((res) => res.json())
        .catch((err) => {
            console.warn(err);
            return {
                success: false,
                message: "チェキ取得に失敗しました",
                details: err.message
            };
        })
}