import Image from "next/image";
import { fetchInstaxImage } from "@/api/instax-show";

type Props = {
    params: Promise<{ userId: string }>;
};

async function getUser(userId: string) {
    const res = await fetch(`https://api.kdgn.tech/api/users/${userId}`, {
        method: "GET",
    });
    return res.json();
}

export default async function Page({ params }: Props) {
    const { userId } = await params;
    const imagesrc = await fetchInstaxImage(userId);
    const user = await getUser(userId);
    return (
        <div>
            
            <div className="fixed bottom-0 bg-[#FFE8E9] w-full h-50">
                <p className="text-black text-[32px] font-bold pt-[40] text-center">行ってらっしゃいませ</p>
                <div className="w-full flex justify-center font-bold text-[32px] gap-2">
                    { user.data.honorific == "ご主人様" ? (
                        <p className="text-[#0055FF]">{user.data.name}ご主人様</p>
                    ) : (user.data.honorific == "お嬢様") ? (
                        <p className="text-[#FF00D9]">{user.data.name}お嬢様</p>
                    ) : (
                        <p className="text-black">{user.data.name}</p>
                    ) }
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
            
            <div className="w-full h-[calc(100vh-364px)] mt-[164px] relative">
                <Image src={imagesrc} alt="チェキ画像" fill className="object-contain bg-[#FFE8E9]"/>
            </div>
        </div>
    );
}
