"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkle } from "lucide-react";
import type { CSSProperties } from "react";

type Props = {
    imageSrc: string;
    isReady: boolean;
    maidName: string;
    userName: string;
};

type InstaxDimensions = {
    width: number;
    height: number;
    depth: number;
};

type CardMetrics = {
    frameOuterWidth: number;
    frameOuterHeight: number;
    cardWidth: number;
    cardHeight: number;
};

type StageProps = {
    imageSrc: string;
    isReady: boolean;
    pairingLabel?: string;
};

type InstaxMeshProps = {
    texture: THREE.Texture;
    dimensions: InstaxDimensions;
    pairingLabel?: string;
};

type CardBaseProps = {
    metrics: CardMetrics;
    backTexture: THREE.Texture;
};

type SparklePoint = {
    id: string;
    delay: number;
    size: number;
    position: CSSProperties;
};

const ASPECT_RATIO = 3 / 4;
const CARD_HEIGHT = 3.8;
const CARD_DEPTH = 0.1;
const FRAME_PADDING_X = 0.2;
const FRAME_PADDING_Y = 0.32;
const CARD_MARGIN = 0.22;
const BOTTOM_MARGIN = 1.5;
const BASE_CARD_DEPTH = 0.01;
const SWING_DURATION = 4; // 往復の片道時間
const SWING_ANGLE = Math.PI / 18; // 左右の最大角度(10度)
const ANIMATION_DURATION = 4;

const DIMENSIONS: InstaxDimensions = {
    width: CARD_HEIGHT * ASPECT_RATIO,
    height: CARD_HEIGHT,
    depth: CARD_DEPTH,
};

const CAMERA_CONFIG = {
    position: [0, 0, 15.5] as [number, number, number],
    fov: 30,
};

const ORBIT_CONTROLS_CONFIG = {
    enableZoom: false,
    enablePan: false,
    enableDamping: true,
    dampingFactor: 0.08,
    rotateSpeed: 1,
    minPolarAngle: Math.PI / 3.4 - 0.35,
    maxPolarAngle: Math.PI / 1.4 + 0.35,
};

const SPARKLES: SparklePoint[] = [
    { id: "top-left", size: 14, delay: 0, position: { top: "20%", left: "0%" } },
    { id: "top-right", size: 10, delay: 0.1, position: { top: "12%", right: "2%" } },
    { id: "mid-left", size: 12, delay: 0.18, position: { bottom: "30%", left: "-6%" } },
    { id: "bottom-left", size: 9, delay: 0.27, position: { bottom: "10%", left: "1%" } },
    { id: "bottom-right", size: 13, delay: 0.35, position: { bottom: "6%", right: "-4%" } },
    { id: "mid-right", size: 11, delay: 0.42, position: { top: "42%", right: "-2%" } },
];

// Main
export default function InstaxCard({ imageSrc, isReady, maidName, userName }: Props) {
    const pairingLabel = maidName && userName ? `${maidName} ♡ ${userName}` : maidName || userName || undefined;

    return (
        <>
            <div className="absolute inset-0 z-10">
                <div className="relative h-full w-full">
                    <div
                        className={`h-full w-full transition-all duration-700 ease-out ${isReady ? "blur-0 opacity-100" : "blur-lg opacity-60"}`}
                    >
                        <Canvas
                            camera={CAMERA_CONFIG}
                            dpr={[1, 1.8]}
                            gl={{ antialias: true, alpha: true }}
                            onCreated={({ gl }) => {
                                gl.setClearColor(0x000000, 0);
                            }}
                        >
                            <ambientLight intensity={1.2} color="#FFFFFF" />
                            <directionalLight position={[0, 0, 10]} intensity={0.8} color="#FFFFFF" />
                            <directionalLight position={[0, 0, -10]} intensity={0.8} color="#FFFFFF" />
                            <directionalLight position={[0, 8, 0]} intensity={0.6} color="#FFFFFF" />
                            <directionalLight position={[0, -8, 0]} intensity={0.6} color="#FFFFFF" />

                            <Suspense fallback={<Loader />}>
                                <Stage imageSrc={imageSrc} isReady={isReady} pairingLabel={pairingLabel} />
                            </Suspense>

                            <OrbitControls
                                makeDefault
                                enabled={isReady}
                                {...ORBIT_CONTROLS_CONFIG}
                            />
                        </Canvas>
                    </div>

                    {!isReady && (
                        <>
                            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                                <div className="scan h-full w-full" />
                            </div>
                            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 text-center text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.45)]">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold tracking-[0.5em] text-white/75">
                                        JUST A MOMENT
                                    </p>
                                    <p className="text-xl font-bold">魔法をかけています...</p>
                                    <p className="text-xs font-medium text-white/80 sm:text-sm">
                                        もうちょっとまっててね♪
                                    </p>
                                </div>
                                <div
                                    className="relative h-56 w-40 overflow-hidden rounded-3xl border border-white/35 bg-white/10 px-6 py-5 shadow-xl backdrop-blur-md"
                                    style={{
                                        "--paper-animation-duration": `${ANIMATION_DURATION}s`,
                                    } as CSSProperties}
                                >
                                    <div className="absolute inset-x-8 top-6 h-2 rounded-full bg-white/35 z-50" />
                                    <div className="absolute bottom-6 left-8 right-8 h-2 rounded-full bg-white/35 z-50" />
                                    <div className="paper absolute inset-x-8 bottom-6 h-28 rounded-2xl border border-white/45 bg-linear-to-b from-white to-white/50" />
                                    <div className="paper-sparkles pointer-events-none absolute inset-x-4 bottom-6 top-10">
                                        {SPARKLES.map(({ id, delay, size, position }) => (
                                            <span
                                                key={id}
                                                className="paper-sparkle"
                                                style={{
                                                    ...position,
                                                    animationDelay: `${delay}s`,
                                                }}
                                            >
                                                <Sparkle size={size} className="text-white fill-white" />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// Stage
function Stage({ imageSrc, isReady, pairingLabel }: StageProps) {
    const { texture, dimensions } = useInstaxTexture(imageSrc);
    const backTexture = useTexture('/logo.svg');
    const metrics = useMemo(() => calculateCardMetrics(dimensions), [dimensions]);
    const groupRef = useRef<THREE.Group>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const timeRef = useRef(0);
    const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInteractionEnd = () => {
        setIsUserInteracting(true);
        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
        }
        
        // ユーザー操作終了1秒後にアニメーション再開
        resumeTimeoutRef.current = setTimeout(() => {
            setIsUserInteracting(false);
        }, 1000);
    };

    useFrame((state, delta) => {
        if (!isReady || !groupRef.current || isUserInteracting) return;
        timeRef.current += delta;
        const progress = (timeRef.current % (SWING_DURATION * 2)) / SWING_DURATION;
        const angle = Math.sin(progress * Math.PI) * SWING_ANGLE;
        
        groupRef.current.rotation.y = angle;
    });

    return (
        <group
            ref={groupRef}
            onPointerDown={() => setIsUserInteracting(true)}
            onPointerUp={handleInteractionEnd}
            onPointerLeave={handleInteractionEnd}
        >
            <CardBase metrics={metrics} backTexture={backTexture} />
            <InstaxMesh texture={texture} dimensions={dimensions} pairingLabel={pairingLabel} />
        </group>
    );
}

function useInstaxTexture(imageSrc: string) {
    const [dimensions, setDimensions] = useState<InstaxDimensions>({ ...DIMENSIONS });

    const texture = useTexture(imageSrc, (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.anisotropy = 8;
        loadedTexture.generateMipmaps = true;

        const source =
            (loadedTexture.source?.data as { width?: number; height?: number } | undefined) ||
            (loadedTexture.image as { width?: number; height?: number } | undefined);

        if (source?.width && source?.height) {
            const aspect = source.width / source.height;
            const height = CARD_HEIGHT;
            const width = height * aspect;
            const nextDimensions = { width, height, depth: CARD_DEPTH };

            setDimensions((prev) =>
                prev.width === nextDimensions.width &&
                prev.height === nextDimensions.height &&
                prev.depth === nextDimensions.depth
                    ? prev
                    : nextDimensions,
            );
        }
    });

    return { texture, dimensions };
}

function calculateCardMetrics(dimensions: InstaxDimensions): CardMetrics {
    const frameOuterWidth = dimensions.width + FRAME_PADDING_X * 2;
    const frameOuterHeight = dimensions.height + FRAME_PADDING_Y * 2;
    const cardWidth = frameOuterWidth + CARD_MARGIN;
    const cardHeight = frameOuterHeight + CARD_MARGIN + BOTTOM_MARGIN;

    return { frameOuterWidth, frameOuterHeight, cardWidth, cardHeight };
}

function InstaxMesh({ texture, dimensions, pairingLabel }: InstaxMeshProps) {
    const { width, height, depth } = dimensions;
    const photoOffsetY = BOTTOM_MARGIN / 1.8;
    const labelPositionY = photoOffsetY - height / 2 - 0.2;

    return (
        <>
            <mesh position={[0, photoOffsetY, depth - 0.09]}>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial
                    map={texture}
                    metalness={0.1}
                    roughness={0.4}
                    toneMapped
                    side={THREE.FrontSide}
                />
            </mesh>
            {pairingLabel && (
                <Html
                    position={[0, labelPositionY, depth - 0.09]}
                    transform
                    distanceFactor={6}
                    wrapperClass="pointer-events-none select-none"
                    occlude
                >
                    <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-[#1A1A1A]">
                        {pairingLabel}
                    </p>
                </Html>
            )}
        </>
    );
}

function CardBase({ metrics, backTexture }: CardBaseProps) {
    const source = backTexture.source?.data as { width?: number; height?: number } | undefined;
    const imageAspect = source?.width && source?.height ? source.width / source.height : 1;
    const logoWidth = 1 * imageAspect;

    const materialProps = {
        color: "#FFFFFF",
        roughness: 0.3,
        metalness: 0.05,
        side: THREE.FrontSide,
        emissive: "#FFFFFF",
        emissiveIntensity: 0.1,
    };

    return (
        <>
            {/* 表面 */}
            <mesh position={[0, 0, BASE_CARD_DEPTH / 2]}>
                <planeGeometry args={[metrics.cardWidth, metrics.cardHeight]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 裏面 */}
            <mesh position={[0, 0, -BASE_CARD_DEPTH / 2]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[metrics.cardWidth, metrics.cardHeight]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 裏面ロゴ */}
            <mesh position={[0, 0, -BASE_CARD_DEPTH / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[logoWidth, 1]} />
                <meshStandardMaterial
                    map={backTexture}
                    roughness={0.3}
                    metalness={0.05}
                    side={THREE.FrontSide}
                    transparent
                />
            </mesh>
        </>
    );
}

function Loader() {
    return (
        <Html center>
            <div className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
                LOADING
            </div>
        </Html>
    );
}
