"use client";

import {Draw} from "@/components/draw";
import {useState, useEffect} from "react";

export default function Page () {
    const [penColor, setPenColor] = useState("#fff5f8");
    const [drawOption, setDrawOption] = useState(1);
    const [lineWidth, setLineWidth] = useState(30);
    const [isSave, setIsSave] = useState(false);
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [showPalette, setShowPalette] = useState(false);

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

    return (
        <div>
            <Draw
            src="/huji.jpeg"
            penColor={penColor}
            drawOption={drawOption}
            lineWidth={lineWidth}
            isSave={isSave}
            setImgData={setImgData}
            ></Draw>

            <div
            className="flex gap-4">
                <button
                    className="p-2 py-8 rounded-xl bg-pink-300 text-black"
                    onClick={() => setShowPalette((prev) => !prev)}
                >
                    カラー
                </button>

                {showPalette && (
                    <div className="grid grid-cols-6 gap-x-0 gap-3">
                        {colors.map((color) => (
                            <button
                            key={color}
                            onClick={() => setPenColor(color)}
                            className={`
                                w-8 h-8 rounded-full border
                                ${penColor === color ? "border-4 border-gray-700" : "border-gray-400"}
                                `}
                            style={{backgroundColor:color}}
                            />
                        ))}
                        <input
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="w-8 h-8 rounded-full border"
                        />
                    </div>
                )}

                <select
                name="drawoption"
                value={drawOption}
                onChange={(e) => setDrawOption(Number(e.target.value))}
                >
                    <option value="0">消しゴム</option>
                    <option value="1">ペン</option>
                    <option value="2">グロー</option>
                </select>

                <input
                type="range"
                min="0"
                max="100"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                />

                <button
                className="p-2 py-8 rounded-xl bg-pink-300 text-black"
                onClick={() => {
                    setIsSave(true);
                }}
                >
                    できた
                </button>
            </div>
        </div>
    )
}