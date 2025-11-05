"use client";
import React, { use, useRef, useState, useEffect, Dispatch, SetStateAction } from "react";

/*
drawOption

1 = ペン
2 = 消しゴム

*/

interface DrawProps {
    className?: string;
    src: string;
    penColor?: string;
    drawOption: number;
    lineWidth: number;
    isSave: boolean;
    setImgData: Dispatch<SetStateAction<FormData | null>>;
}

export const Draw = ({ className,src, penColor = "white", drawOption = 1, lineWidth = 3, isSave, setImgData }: DrawProps) => {
    const [viewCanvasSize, setViewCanvasSize] = useState({width:1280, height:720});
    const [imgSize, setImgSize] = useState({width:1280, height:720});
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const x = useRef(0);
    const y = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctxRef.current = ctx;


        const imgCanvas = imgCanvasRef.current;
        if (!imgCanvas) return;
        const imgCtx = imgCanvas.getContext("2d");
        if (!imgCtx) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
            // 画像のアスペクト比を維持して表示サイズを計算
            const imgWidth = img.width;
            const imgHeight = img.height;
            setImgSize({width: imgWidth, height: imgHeight});
            let finalWidth = 1280;
            let finalHeight = 720;

            if (imgHeight > 720) {
                finalHeight = 720;
                finalWidth = (imgWidth / imgHeight) * finalHeight;
            } else if (finalWidth > 1280) {
                finalWidth = 1280;
                finalHeight = (imgHeight / imgWidth) * finalWidth;
            } else {
                finalWidth = imgWidth;
                finalHeight = imgHeight;
            }

            setViewCanvasSize({width: finalWidth, height: finalHeight});

            // 画像をcanvasに描画
            imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
        };
    }, []);

    useEffect(() => {
        if (isSave) {
            saveImage();
        }
    }, [isSave]);

    const getCoordinate = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // 座標変換
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        x.current = (clientX - rect.left) * scaleX;
        y.current = (clientY - rect.top) * scaleY;
    };
    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        getCoordinate(e);
        isDrawingRef.current = true;
    };

    const handleEnd = () => {
        isDrawingRef.current = false;
    };

    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        if (!isDrawingRef.current) return;

        const oldX = x.current;
        const oldY = y.current;

        getCoordinate(e);

        drawLine(ctx, oldX, oldY, x.current, y.current);
    };

    // 線を描く関数
    function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {

        // -----描画オプション-----
        switch (drawOption) {
            case 1: // ペン
                ctx.globalCompositeOperation = "source-over";
                break;
            case 2: // 消しゴム
                ctx.globalCompositeOperation = "destination-out";
                break;
            default:
                ctx.globalCompositeOperation = "source-over";
        }
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        // ----------------------

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    };

    // 画像保存
    const saveImage = () => {
        const imgCanvas = imgCanvasRef.current;
        const drawCanvas = canvasRef.current;
        if (!imgCanvas || !drawCanvas) return;

        // 結合用canvas
        const mergedCanvas = document.createElement("canvas");
        mergedCanvas.width = imgSize.width;
        mergedCanvas.height = imgSize.height;
        const mergedCtx = mergedCanvas.getContext("2d");
        if (!mergedCtx) return;

        // 背景画像
        mergedCtx.drawImage(imgCanvas, 0, 0, mergedCanvas.width, mergedCanvas.height);

        // 描画内容
        mergedCtx.drawImage(drawCanvas, 0, 0, mergedCanvas.width, mergedCanvas.height);

        // formDataに変換して親コンポーネントに渡す
        mergedCanvas.toBlob((blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("image", blob, `drawing-${Date.now()}.png`);
            setImgData(formData);

        }, "image/png");
    };

    return (
        <div className={className}>
            <div className="mx-auto relative " style={{ width: `${viewCanvasSize.width}px`, height: `${viewCanvasSize.height}px` }}>
                {/* 背景画像用Canvas */}
                <canvas
                    ref={imgCanvasRef}
                    width={1280}
                    height={720}
                    className="absolute top-0 left-0"
                    style={{
                        width: `${viewCanvasSize.width}px`,
                        height: `${viewCanvasSize.height}px`
                    }}
                ></canvas>
                {/* 描画用Canvas */}
                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="absolute top-0 left-0 border-white border-1"
                    style={{
                        width: `${viewCanvasSize.width}px`,
                        height: `${viewCanvasSize.height}px`
                    }}
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onMouseMove={handleMove}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                    onTouchMove={handleMove}
                ></canvas>
            </div>
        </div>
    )
}