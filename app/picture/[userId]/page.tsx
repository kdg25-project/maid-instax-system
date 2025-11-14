import { fetchInstaxImage } from "@/api/instax-show";
import InstaxCard from "@/components/instax-3d-card";
import Image from "next/image";
export const fetchCache = "only-no-store";

type Props = {
    params: Promise<{ userId: string }>;
};
type UserRes = {
    succe_s: boolean,
    message: string,
    data: {
        id: string,
        name: string,
        honorific: string,
        status: string,
        maid_id: string,
        instax_maid_id: string | null,
        instax_id: number,
        seat_id: number,
        is_valid: boolean,
        created_at: string,
        updated_at: string
    }
}
type MaidRes = {
    success: boolean,
    message: string,
    data: {
        id: string,
        name: string,
        image_url: string,
        is_instax_available: boolean,
        is_active: boolean
    }
}
async function getUser(userId: string) {
    const res = await fetch(`https://api.kdgn.tech/api/users/${userId}`, {
        method: "GET",
    });
    return res.json();
}
async function getMaid(maidId: string) {
    const res = await fetch(`https://api.kdgn.tech/api/maids/${maidId}`, {
        method: "GET",
    });
    return res.json();
}

export default async function Page({ params }: Props) {
    const { userId } = await params;
    const imagesrc = await fetchInstaxImage(userId);
    const user: UserRes = await getUser(userId);
    const maidRes: MaidRes = await getMaid(user.data.maid_id);

    const isReady = Boolean(user.data.status == "instax_complete" || user.data.status == "leaving");

    const statusMessage = isReady
        ? "ご体験いただきありがとうございました！"
        : "";

    return (
        <div className="min-h-screen bg-fixed bg-linear-to-bl from-[#A8EAEF] via-[#E7D1D9] to-[#FBAFB7]">
            <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-8 sm:max-w-lg sm:px-6 sm:py-10">
                <section className="p-6 pb-3">
                    <div className="flex flex-col gap-6">
                        <div className="m-auto">
                            <Image src={"/Maid-Cafe_Logo.png"} alt="Maid Cafe Logo" width={200} height={80} className="mx-auto sm:mx-0" />
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden">
                    <div className="relative z-0 mx-auto aspect-3/4 w-full h-full overflow-hidden">
                        <InstaxCard
                            imageSrc={imagesrc}
                            isReady={isReady}
                            maidName={maidRes.data.name}
                            userName={user.data.name + user.data.honorific}
                        />
                    </div>
                </section>

                <section className="p-6 text-center">
                    <div className="space-y-3">
                        {isReady && (
                            <p className="text-xl font-bold text-[#000000] tracking-wide sm:text-2xl">行ってらっしゃいませ！</p>
                        )}
                        <p className={`text-base ${isReady ? "text-[#7A4E4E]" : "text-[#E54268] animate-pulse"}`}>
                            {statusMessage}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
