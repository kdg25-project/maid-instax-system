"use client";

import { Draw } from "@/components/draw";
import { useState, useEffect } from "react";
import SaveConfirmDialog from "@/components/save-confirm-dialog";

import { Undo2, Redo2, Check } from 'lucide-react';
import Image from "next/image";
import { Slider } from "@/components/ui/slider"
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
        "#ff6f91", // ローズピンク
        "#ffb7e5", // コットンキャンディ
        "#fff8b5", // レモンクリーム
        "#b8ebd0", // ミントグリーン
        "#9ee7f8", // アクアマリン
        "#0099ff", // ピュアブルー
        "#c8a2c8", // ラベンダー
        "#a97458", // ミルクチョコ
    ];

    const vividColors = [
        "#ff0000", // 赤
        "#FF700A", // 橙
        "#ffff00", // 黄
        "#77FF00", // 黄緑
        "#00C010", // 緑
        "#00D0FF", // 水色
        "#0044FF", // 青
        "#2000AF", // 紺
        "#BB00FF", // 紫
        "#FF00B7", // ピンク
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
            <div className="flex flex-4 justify-center items-center mt-[30px]">
                <div className="flex flex-col gap-2 bg-[#FFF89A] p-2 rounded-full mr-4">
                    {vividColors.map((vivid) => (
                        <button
                            key={vivid}
                            onClick={() => setPenColor(vivid)}
                            className={`
                                w-8 h-8 rounded-full border
                                ${penColor === vivid ? "border-4 bg-gray-200 ring-2 ring-gray-400" : "border-white border-3"}
                                `}
                            style={{ backgroundColor: vivid }}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-2 bg-[#FFF89A] p-2 rounded-full items-center">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setPenColor(color)}
                            className={`
                                w-8 h-8 rounded-full border
                                ${penColor === color ? "border-4 bg-gray-200 ring-2 ring-gray-400" : "border-white border-3"}
                                `}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <div className="inline-flex w-fit rounded-full p-[3px] shrink-0 rainbow-border">
                        <input
                            type="color"
                            value={penColor}
                            onChange={(e) => setPenColor(e.target.value)}
                            className="rainbow-input w-8 h-8 rounded-full"
                        />
                    </div>
                </div>
                <div className="h-[300px]">
                    <Slider
                        min={5}
                        max={60}
                        step={0.1}
                        value={[lineWidth]}
                        className="w-8 flex-1 mx-4"
                        orientation="vertical"
                        onValueChange={(value) => setLineWidth(value[0])}
                    />
                </div>

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
                <div className="bg-[#FFF89A] p-2 rounded-full flex gap-2">
                    <button
                        className="p-2 py-2 rounded-full bg-white text-black"
                        onClick={() => {
                            setIsUndo(!isUndo);
                        }}
                    >
                        <Undo2 />
                    </button>

                    <button
                        className="p-2 py-2 rounded-full bg-white text-black"
                        onClick={() => {
                            setIsRedo(!isRedo);
                        }}
                    >
                        <Redo2 />
                    </button>
                </div>

                <div className="bg-[#FFF89A] p-2 rounded-full flex gap-2">
                    <div className="grid grid-cols-3 gap-x-4 gap-3">
                        {pens.map((pen) => (
                            <button
                                key={pen}
                                onClick={() => setDrawOption(pen)}
                                className={`
                            rounded-full bg-white p-1
                            ${drawOption === pen ? "bg-gray-200 ring-2 ring-gray-400" : ""}
                            `}
                            >
                                {pen === 0 && <Image className="m-auto" src="/eraser.svg" alt="Eraser" width={32} height={32} />}
                                {pen === 1 && <Image className="m-auto" src="/pen.svg" alt="Pen" width={32} height={32} />}
                                {pen === 2 && <Image className="m-auto" src="/glow.svg" alt="Glow" width={32} height={32} />}
                            </button>
                        ))}
                    </div>

                    <button
                        className="p-2 py-2 rounded-full bg-white text-black"
                        onClick={() => {
                            setIsSave(true);
                            setShowDialog(true);
                        }}
                    >
                        <Check />
                    </button>
                </div>
            </div>
        </div>
    )
}