"use client";
import { Draw } from "@/components/draw";
import { useState } from "react";

export default function TestPage() {
    const [drawOption, setDrawOption] = useState(1);
    const [penColor, setPenColor] = useState("#ffffff");
    const [lineWidth, setLineWidth] = useState(3);
    const [isSave, setIsSave] = useState(false);
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [imgSrc, setImgSrc] = useState("/test-image.jpg");

    const handleSave = () => {
        setIsSave(true);
        setTimeout(() => setIsSave(false), 100);
    };

    const handleDownload = () => {
        if (imgData) {
            const blob = imgData.get("image") as Blob;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "drawing.png";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImgSrc(url);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <h1 className="text-white text-3xl font-bold mb-8 text-center">
                Drawコンポーネント テスト
            </h1>

            {/* コントロールパネル */}
            <div className="max-w-4xl mx-auto mb-6 bg-gray-800 p-6 rounded-lg">
                {/* 画像選択 */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <label className="block text-white mb-2 font-semibold">
                        画像を選択
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-300
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-500 file:text-white
                            hover:file:bg-blue-600
                            file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                        現在の画像: {imgSrc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 描画オプション */}
                    <div>
                        <label className="block text-white mb-2 font-semibold">
                            描画オプション
                        </label>
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded ${
                                    drawOption === 1
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-600 text-gray-300"
                                }`}
                                onClick={() => setDrawOption(1)}
                            >
                                ペン
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${
                                    drawOption === 0
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-600 text-gray-300"
                                }`}
                                onClick={() => setDrawOption(0)}
                            >
                                消しゴム
                            </button>
                            <button
                                className={`px-4 py-2 rounded ${
                                    drawOption === 2
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-600 text-gray-300"
                                }`}
                                onClick={() => setDrawOption(2)}
                            >
                                グロー
                            </button>
                        </div>
                    </div>

                    {/* ペンの色 */}
                    <div>
                        <label className="block text-white mb-2 font-semibold">
                            ペンの色
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={penColor}
                                onChange={(e) => setPenColor(e.target.value)}
                                className="w-16 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={penColor}
                                onChange={(e) => setPenColor(e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>

                    {/* 線の太さ */}
                    <div>
                        <label className="block text-white mb-2 font-semibold">
                            線の太さ: {lineWidth}px
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* 保存ボタン */}
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                        >
                            保存
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!imgData}
                            className={`flex-1 px-6 py-2 rounded font-semibold transition ${
                                imgData
                                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            ダウンロード
                        </button>
                    </div>
                </div>

                {/* 状態表示 */}
                <div className="mt-4 p-4 bg-gray-700 rounded">
                    <p className="text-white text-sm">
                        <span className="font-semibold">現在の設定:</span>{" "}
                        オプション={drawOption === 1 ? "ペン" : drawOption === 0 ? "消しゴム" : "グロー"}
                        , 色={penColor}, 太さ={lineWidth}px
                    </p>
                    {imgData && (
                        <p className="text-green-400 text-sm mt-2">
                            ✓ 画像が保存されました！ダウンロードボタンを押してください。
                        </p>
                    )}
                </div>
            </div>

            {/* Drawコンポーネント */}
            <Draw
                className="flex justify-center"
                src={imgSrc}
                penColor={penColor}
                drawOption={drawOption}
                lineWidth={lineWidth}
                isSave={isSave}
                setImgData={setImgData}
            />

            {/* 使い方説明 */}
            <div className="max-w-4xl mx-auto mt-8 bg-gray-800 p-6 rounded-lg">
                <h2 className="text-white text-xl font-bold mb-4">使い方</h2>
                <ul className="text-gray-300 space-y-2">
                    <li>• キャンバス上でマウスをドラッグ（またはタッチ）して描画できます</li>
                    <li>• ペン、消しゴム、グローから描画モードを選択できます</li>
                    <li>• カラーピッカーまたはテキスト入力で色を変更できます</li>
                    <li>• スライダーで線の太さを調整できます</li>
                    <li>• 保存ボタンで画像をFormDataに変換します</li>
                    <li>• ダウンロードボタンで画像をダウンロードできます</li>
                </ul>
            </div>
        </div>
    );
}
