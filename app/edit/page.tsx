"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

export default function Home() {
    const [id, setId] = useState(0);
    const [isError, setIsError] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        const request = await fetch("https://api.kdgn.tech/api/instax/"+String(id))
        if (request.ok) {
            router.push("/edit/"+String(id));
        } else {
            setIsError(true)
        }
    }

  return (
    <div className="flex items-center justify-center flex-col p-10 gap-4">
        <h1>入力してください</h1>
        <input
        className="border p-2 rounded-2xl" type="number"
        onChange={(e) => {
          setId(Number(e.target.value));
        }}
        />
        <button 
        className="p-2 rounded-xl bg-amber-200 text-black"
        onClick={handleSubmit}
        >
            次へ
        </button>
        {isError && (
            <p className="text-red-400">IDが存在しません</p>
        )}
    </div>
  );
}