"use client";

export default function Noise() {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
            <div
                className="absolute inset-[-200%] w-[400%] h-[400%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain"
            />
        </div>
    );
}
