import { NextRequest, NextResponse } from 'next/server';

type InstaxShowResponse = {
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const apiUrl = `https://api.kdgn.tech/api/users/${userId}/instax`;
        
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_KEY || ""
            },
        });

        const data: InstaxShowResponse = await response.json();
        
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {
                success: false,
                message: "チェキ取得に失敗しました",
                details: err instanceof Error ? err.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
