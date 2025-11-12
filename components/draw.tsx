"use client";
import React, { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

/*
-- 説明 --

-- className --
任意のCSSクラス名
----------------
-- drawOption --

1 = 消しゴム
2 = ペン
3 = グロー
----------------
-- penColor --
whiteなどの色文字列または#ffffffのようなカラーコード
----------------
-- lineWidth --
線の太さ（数値）
----------------
-- isSave --
親コンポーネントから渡される保存トリガー用フラグ(state)
----------------
-- isUndo --
親コンポーネントから渡される元に戻すトリガー用フラグ(state)
----------------
-- isRedo --
親コンポーネントから渡されるやり直しトリガー用フラグ(state)
----------------
-- isClear --
親コンポーネントから渡されるクリアトリガー用フラグ(state)
----------------
-- setImgData --
親コンポーネントに画像データを渡すための関数(stateのsetter)
----------------


*/

interface DrawProps {
    className?: string;
    src: string;
    penColor?: string;
    drawOption: number;
    lineWidth: number;
    isSave: boolean;
    isUndo?: boolean;
    isRedo?: boolean;
    isClear?: boolean;
    setImgData: Dispatch<SetStateAction<FormData | null>>;
}


interface Stroke {
    start_x: number;
    start_y: number;
    end_x: number;
    end_y: number;
};

interface ItemHistory {
    penColor: string;
    drawOption: number;
    lineWidth: number;
    coordinates: Stroke[];
};

export const Draw = ({ className,src, penColor = "white", drawOption = 1, lineWidth = 3, isSave, isUndo, isRedo, isClear, setImgData }: DrawProps) => {
    const [viewCanvasSize, setViewCanvasSize] = useState({width:1280, height:720});
    const [imgSize, setImgSize] = useState({width:1280, height:720});

    // canvas関連 
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);

    // 描画中フラグ
    const isDrawingRef = useRef(false);

    // 座標系
    const olderX = useRef({old:0, older:0});
    const olderY = useRef({old:0, older:0});
    const x = useRef(0);
    const y = useRef(0);
    const historyRef = useRef<ItemHistory[]>([]);
    const redoHistoryRef = useRef<ItemHistory[]>([]);
    const strokeRef = useRef<Stroke[]>([]);

    // 画像保存
    const saveImage = useCallback(() => {
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
            formData.append("instax", blob, `drawing-${Date.now()}.png`);
            setImgData(formData);

        }, "image/png");
    }, [imgSize.width, imgSize.height, setImgData]);

    // 線を描く関数
    const drawLine = useCallback((
        ctx: CanvasRenderingContext2D, 
        x1: number, 
        y1: number, 
        x2: number, 
        y2: number,
        currentPenColor: string,
        currentDrawOption: number,
        currentLineWidth: number
    ) => {
        // -----描画オプション-----
        switch (currentDrawOption) {
            case 0: // 消しゴム
                ctx.globalCompositeOperation = "destination-out";
                ctx.strokeStyle = currentPenColor;
                break;
            case 1: // ペン
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = currentPenColor;
                break;
            case 2: // グロー
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = "#ffffff";
                ctx.shadowColor = currentPenColor;
                ctx.shadowBlur = 1.5 * currentLineWidth;
                break;
            default:
                ctx.globalCompositeOperation = "source-over";
        }
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = "round";
        // ----------------------

        // 線分の長さを計算
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const MIN_MOVE_DISTANCE = 4;

        if (distance <= MIN_MOVE_DISTANCE) {
            ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();

        // グロー効果のために直前の線分も描画
        if (currentDrawOption === 2) {
            ctx.shadowBlur = 0; // シャドウ効果をリセット
            ctx.beginPath();
            ctx.moveTo(olderX.current.older, olderY.current.older);
            ctx.lineTo(olderX.current.old, olderY.current.old);
            ctx.stroke();
            ctx.closePath();
        };
    }, []);

    // グローペンの時に、一度シャドウ以外の線を削除し中央の線のみ再描画
    const historyReDraw = useCallback((
        ctx: CanvasRenderingContext2D,
        history: ItemHistory[],
    ) => {
        ctx.strokeStyle = "white";
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "destination-out";
        ctx.shadowBlur = 0;
        
        const old_op = ctx.globalCompositeOperation
        const item = history.at(-1);

        if (item) {
            ctx.lineWidth = item.lineWidth;
            item.coordinates.forEach((coord) => {

                ctx.beginPath();
                ctx.moveTo(coord.start_x, coord.start_y);
                ctx.lineTo(coord.end_x, coord.end_y);
                ctx.stroke();
                ctx.closePath();
                ctx.globalCompositeOperation = "source-over";
                ctx.lineWidth = item.lineWidth;
                ctx.beginPath();
                ctx.moveTo(coord.start_x, coord.start_y);
                ctx.lineTo(coord.end_x, coord.end_y);
                ctx.stroke();
                ctx.closePath();
            });
            ctx.globalCompositeOperation = old_op;
        };
    }, []);

    const clearCanvas = useCallback((isReset = false) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isReset) {
            historyRef.current.splice(0);
        };
    }, []);

const reDraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    const history = historyRef.current;

    clearCanvas();
    // 履歴を元に再描画
    history.forEach((item) => {
        // 履歴に保存された設定値を使用
        const itemPenColor = item.penColor;
        const itemDrawOption = item.drawOption;
        const itemLineWidth = item.lineWidth;
        
        item.coordinates.forEach((coord, index) => {
            // 履歴の設定値を使用
            if (index % 2 === 1 && itemDrawOption === 2){
                olderX.current.old = coord.end_x;
                olderY.current.old = coord.end_y;

                olderX.current.older = coord.start_x;
                olderY.current.older = coord.start_y;
            } else {
                // 履歴の設定値を渡す
                drawLine(
                    ctx, 
                    coord.start_x, 
                    coord.start_y, 
                    coord.end_x, 
                    coord.end_y, 
                    itemPenColor,
                    itemDrawOption, 
                    itemLineWidth   
                );
            };
        });
    });
}, [clearCanvas, drawLine]);

    const undoRedo = useCallback((isUndoed: boolean) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;
        
        // 描画内容をクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 履歴から最後の操作を取り出してredo履歴に保存
        if (isUndoed){
            const lastAction = historyRef.current.pop();
            if (lastAction) {
                redoHistoryRef.current.push(lastAction);
            }
        } else {
            const redoAction = redoHistoryRef.current.pop();
            if (redoAction) {
                historyRef.current.push(redoAction);
            }

        }
        reDraw();
    }, [reDraw]);

    useEffect(() => {
        // タッチムーブイベントを無効化
        // passive: false で preventDefault() を有効化
        const preventScroll = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            // Canvas以外の要素でもスクロールを防止
            if (target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        };
        document.addEventListener('touchmove', preventScroll, { passive: false });


        return () => {
            document.removeEventListener('touchmove', preventScroll);
        };
    }, []);

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

        clearCanvas(true);
        const img = new Image();
        // クロスオリジンの画像をキャンバスに描画してエクスポートしたい場合は
        // crossOrigin を設定する必要があります（サーバ側で CORS 許可が必要）。
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
            // 画像のアスペクト比を維持して表示サイズを計算
            const imgWidth = img.width;
            const imgHeight = img.height;
            img.onerror = (e) => {
                console.error("Failed to load image for canvas:", src, e);
            };
            setImgSize({width: imgWidth, height: imgHeight});
            let finalWidth = 1280;
            let finalHeight = 720;
            const maxWidth = window.innerWidth - 200;
            const maxHeight = window.innerHeight - 200;

            finalWidth = imgWidth;
            finalHeight = imgHeight;

            if (imgHeight > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = (imgWidth / imgHeight) * finalHeight;
            } 
            if (finalWidth > maxWidth) {
                finalWidth = maxWidth;
                finalHeight = (imgHeight / imgWidth) * finalWidth;
            }

            setViewCanvasSize({width: finalWidth, height: finalHeight});

            // 画像をcanvasに描画
            imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
        };
    }, [src, clearCanvas]);

    // セーブ、クリア、undo、redo用のuseEffect
    useEffect(() => {
        if (isSave) {
            saveImage();
        }
    }, [isSave, saveImage]);

    useEffect(() => {
        clearCanvas(true)
    }, [isClear, clearCanvas])

    useEffect(() => {
        undoRedo(true)
    }, [isUndo, undoRedo])

    useEffect(() => {
        undoRedo(false)
    }, [isRedo, undoRedo])

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

        // 以前の座標を保存
        olderX.current.older = olderX.current.old;
        olderX.current.old = x.current;
        olderY.current.older = olderY.current.old;
        olderY.current.old = y.current;

        x.current = (clientX - rect.left) * scaleX;
        y.current = (clientY - rect.top) * scaleY;
    };

    // 描画開始
    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        if ('touches' in e) {
            e.preventDefault();
        }

        redoHistoryRef.current.splice(0)

        getCoordinate(e);
        olderX.current.old = x.current;
        olderY.current.old = y.current;
        olderX.current.older = x.current;
        olderY.current.older = y.current;
        isDrawingRef.current = true;

        strokeRef.current = []
    };

    // 描画終了
    const handleEnd = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = false;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        if ('touches' in e) {
            e.preventDefault();
        }

        // 描画履歴に追加
        historyRef.current.push({
            penColor: penColor,
            drawOption: drawOption,
            lineWidth: lineWidth,
            coordinates: strokeRef.current,
        });
        if (drawOption === 2) {
            historyReDraw(ctx, historyRef.current);
        };
    };

    // 描画中
    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        if (!isDrawingRef.current) return;

        getCoordinate(e);

        drawLine(ctx, olderX.current.old, olderY.current.old, x.current, y.current, penColor, drawOption, lineWidth);
        strokeRef.current.push({
            start_x: olderX.current.old,
            start_y: olderY.current.old,
            end_x: x.current,
            end_y: y.current,
        });
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
                    className="absolute top-0 left-0 border-white border-2"
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