"use client";
import Image from "next/image";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Cookies from 'js-cookie';

export default function Home() {
    const [id, setId] = useState(0);
    const [isError, setIsError] = useState(false);
    const router = useRouter();
    const [isNeedPassword, setIsNeedPassword] = useState(() => !Cookies.get('maid_api_key'));
    const [password, setPassword] = useState(() => Cookies.get('maid_api_key') ?? '');

    async function handleSubmit() {
        if (isNeedPassword) {
            Cookies.set('maid_api_key', password, { expires: 7, path: '/' });
            setIsNeedPassword(false)
        } else {
            const request = await fetch("https://api.kdgn.tech/api/instax/"+String(id), {
                headers: {
                    "x-api-key": password,
                }
            })
        if (request.ok) {
            router.push("/edit/"+String(id));
        } else {
            setIsError(true)
        }
        }
    }

    return (
    <div className="flex items-center justify-center flex-col p-10 gap-4">
        <h1>{isNeedPassword ? 'パスワード' : 'ID'}を入力してください</h1>
        <input
        className="border p-2 rounded-2xl" type={isNeedPassword ? 'password' : 'number'}
        onChange={(e) => {
            if (isNeedPassword) {
                setPassword(e.target.value)
            } else {
                setId(Number(e.target.value));
            }
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