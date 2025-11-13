"use client";

import { Draw } from "@/components/draw";
import { useState, useEffect } from "react";
import SaveConfirmDialog from "@/components/save-confirm-dialog";

import { Undo2, Redo2, Eraser, PenLine } from 'lucide-react';
import Image from "next/image";

import "./edit.css";


type Props = {
    params: Promise<{ id: string }>;
}

type GetInstaxRes = {
    success: boolean;
    message: string;
    data: {
        id: number;
        user_id: string;
        maid_id: string;
        image_url: string | null;
        created_at: string;
    }
}

export default function Page({ params }: Props) {
    const [penColor, setPenColor] = useState("#fff5f8");
    const [drawOption, setDrawOption] = useState(2);
    const [lineWidth, setLineWidth] = useState(30);
    const [isSave, setIsSave] = useState(false);
    const [isUndo, setIsUndo] = useState(false);
    const [isRedo, setIsRedo] = useState(false);
    const [isClear, setIsClear] = useState(false);
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [imgUrl, setImgUrl] = useState('');
    const [instaxId, setInstaxId] = useState<string>('');

    async function getInstax(apiKey: string, id: string): Promise<GetInstaxRes> {
        const request = await fetch("https://api.kdgn.tech/api/instax/" + String(id), {
            headers: {
                "x-api-key": apiKey,
            }
        });
        return request.json()
    }

    useEffect(() => {
        const apiKey = String(localStorage.getItem("apiKey") || '');

        (async () => {
            try {
                const { id } = await params;
                setInstaxId(id);
                const d = await getInstax(apiKey || '', id);
                setImgUrl(d.data.image_url ?? '')
            } catch (err) {
                console.error(err);
            }
        })();
    }, [params])

    const colors = [
        "#fff5f8", // ミルキーホワイト
        "#ff0000", // 赤
        "#ffff00", // 黄
        "#ff6f91", // ローズピンク
        "#0099ff", // ピュアブルー
        "#9ee7f8", // アクアマリン
        "#fff8b5", // レモンクリーム
        "#b8ebd0", // ミントグリーン
        "#c8a2c8", // ラベンダー
        "#ffb7e5", // コットンキャンディ
        "#a97458", // ミルクチョコ
    ];

    const pens = [
        0,
        1,
        2
    ];

    return (
        <div>
            <SaveConfirmDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                imgData={imgData}
                instaxId={instaxId}
                onClose={() => setShowDialog(false)}
            />
            <div className="flex flex-4 justify-center items-center">
                <div className="flex flex-col gap-2">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setPenColor(color)}
                            className={`
                                w-8 h-8 rounded-full border
                                ${penColor === color ? "border-4 border-gray-700" : "border-gray-400"}
                                `}
                            style={{ backgroundColor: color }}
                        />
                    ))}

                    <input
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="w-8 h-8 rounded-full border"
                    />
                </div>

                <input
                    type="range"
                    min="5"
                    max="60"
                    step="0.1"
                    value={lineWidth}
                    className="vertical"
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                />
                <Draw
                    src={imgUrl}
                    penColor={penColor}
                    drawOption={drawOption}
                    lineWidth={lineWidth}
                    isSave={isSave}
                    isUndo={isUndo}
                    isRedo={isRedo}
                    isClear={isClear}
                    setImgData={setImgData}
                ></Draw>
            </div>

            <div className="flex gap-4 p-4 justify-center items-center">
                <button
                    className="p-2 py-2 rounded-xl bg-pink-300 text-black"
                    onClick={() => {
                        setIsUndo(!isUndo);
                    }}
                >
                    <Undo2 />
                </button>

                <button
                    className="p-2 py-2 rounded-xl bg-pink-300 text-black"
                    onClick={() => {
                        setIsRedo(!isRedo);
                    }}
                >
                    <Redo2 />
                </button>

                <div className="grid grid-cols-3 gap-x-4 gap-3">
                    {pens.map((pen) => (
                        <button
                            key={pen}
                            onClick={() => setDrawOption(pen)}
                            className={`
                            w-8 h-8 border
                            ${drawOption === pen ? "border-4 border-gray-700" : "border-gray-400"}
                            `}
                        >
                            {pen === 0 && <Image className="m-auto" src="/eraser.svg" alt="Eraser" width={24} height={24} />}
                            {pen === 1 && <Image className="m-auto" src="/pen.svg" alt="Pen" width={24} height={24} />}
                            {pen === 2 && <Image className="m-auto" src="/glow.svg" alt="Glow" width={24} height={24} />}
                        </button>
                    ))}
                </div>

                <button
                    className="p-2 py-2 rounded-xl bg-pink-300 text-black"
                    onClick={() => {
                        setIsSave(true);
                        setShowDialog(true);
                    }}
                >
                    できた
                </button>
            </div>
        </div>
    )
}