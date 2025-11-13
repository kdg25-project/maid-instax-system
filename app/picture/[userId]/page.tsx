import { fetchInstaxImage } from "@/api/instax-show";
import InstaxCard from "@/components/instax-3d-card";

type Props = {
    params: Promise<{ userId: string }>;
};

async function getUser(userId: string) {
    const res = await fetch(`https://api.kdgn.tech/api/users/${userId}`, {
        method: "GET",
    });
    return res.json();
}

function getHonorificColor(honorific?: string) {
    if (honorific === "ご主人様") return "from-[#A8D5FF] to-[#C8E6FF]";
    if (honorific === "お嬢様") return "from-[#FF5CA1] to-[#FF9AB5]";
    return "from-[#2D1B13] to-[#4A3326]";
}

export default async function Page({ params }: Props) {
    const { userId } = await params;
    const imagesrc = await fetchInstaxImage(userId);
    const user = await getUser(userId);

    const honorificColor = getHonorificColor(user.data.honorific);
    const isReady = Boolean(user.complete && user.is_valid);
    const statusMessage = isReady
        ? "またのご帰宅をお待ちしております！"
        : "ただいまチェキを仕上げています...";

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

                <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#FF9AB5]/75 to-[#FFB8E2]/55">
                    <div className="relative z-0 mx-auto aspect-3/4 w-full h-full overflow-hidden">
                        <InstaxCard imageSrc={imagesrc} isReady={isReady} />
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
