import { fetchInstaxImage } from "@/api/instax-show";
import InstaxCard from "@/components/instax-3d-card";

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


function getHonorificColor(honorific?: string) {
    if (honorific === "ご主人様") return "from-[#66B8FF] to-[#3B82F6]";
    if (honorific === "お嬢様") return "from-[#FF5CA1] to-[#FF9AB5]";
    return "from-[#2D1B13] to-[#4A3326]";
}

export default async function Page({ params }: Props) {
    const { userId } = await params;
    const imagesrc = await fetchInstaxImage(userId);
    const user: UserRes = await getUser(userId);
    const maidRes: MaidRes = await getMaid(user.data.maid_id);

    const honorificColor = getHonorificColor(user.data.honorific);
    const isReady = Boolean(user.data.status == "instax_complete" || user.data.status == "leaving");

    const statusMessage = isReady
        ? "またのご帰宅をお待ちしております！"
        : "";

    return (
        <div className="min-h-screen">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#FFB8E2]/60 blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#FFCFE5]/60 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
            <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-8 sm:max-w-lg sm:px-6 sm:py-10">
                <section className="p-6">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-[#E54268] leading-tight tracking-tight sm:text-3xl">
                                <span className={`bg-linear-to-br ${honorificColor} bg-clip-text text-transparent`}>
                                    {user.data.name}
                                    {user.data.honorific}<br />
                                </span>
                                ご帰宅<br />
                                ありがとうございました！
                            </h1>
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
                            <p className="text-xl font-bold text-[#E54268] tracking-wide sm:text-2xl">行ってらっしゃいませ！</p>
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
