import Image from "next/image";

type Props = {
    params: Promise<{ userId: string }>;
};

export default async function Page({ params }: Props) {
    const { userId } = await params;

    return (
        <div>
            <div className="fixed bottom-0 bg-[#FFE8E9] w-full h-50">
                <p className="text-brack text-[32px] font-bold pt-[40] text-center">行ってらっしゃいませ</p>
                <div className="w-full flex justify-center font-bold text-[32px] gap-2">
                    <p className="text-[#0055FF]">ご主人様</p>
                    <p className="text-black">/</p>
                    <p className="text-[#FF00D9]">お嬢様</p>
                    <h1>{userId}</h1>
                </div>
            </div>

            <div className="fixed top-0 w-full h-[164px] bg-[#FFE8E9] text-white font-bold pt-10">
                <div className="flex justify-center gap-4">
                    <div className="flex flex-col items-center text-[20px] bg-[#FFA9A9] rounded-[100px] h-20 w-70 pt-2">
                        <p>ご来店</p>
                        <p>ありがとうございました</p>
                    </div>
                </div>
            </div>
            <div className="bg-black/50 w-full h-[calc(100vh-364px)] mt-[164px]" />
        </div>
    );
}
