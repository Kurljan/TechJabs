"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScanLine, Sparkles, Box, Search, Zap, Camera, CameraOff, FlipHorizontal, X, CheckCircle2 } from "lucide-react";

type ScanResult = {
  name: string;
  category: string;
  confidence: number;
};

export default function AIScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    stopCamera();
    setScanResult(null);
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API is not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setPermissionDenied(false);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  }, [facingMode, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const flipCamera = async () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  // Simulated AI scan (in production, you'd send a canvas frame to an AI API)
  const performScan = async () => {
    if (!cameraActive) return;
    setScanning(true);
    setScanResult(null);

    // Simulate capture and AI analysis (2s)
    await new Promise((r) => setTimeout(r, 2000));

    // Simulate a random AI result for demo purposes
    const mockResults: ScanResult[] = [
      { name: "AMD Ryzen 5 5600X Processor", category: "Components", confidence: 94 },
      { name: "Kingston 8GB DDR4 RAM", category: "Components", confidence: 89 },
      { name: "Logitech MX Master 3 Mouse", category: "Peripherals", confidence: 97 },
      { name: "WD Blue 1TB SSD", category: "Storage", confidence: 91 },
      { name: "ASUS RTX 4060 GPU", category: "Components", confidence: 88 },
    ];

    setScanResult(mockResults[Math.floor(Math.random() * mockResults.length)]);
    setScanning(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-[26px] font-bold text-slate-900 mb-0.5">AI Scanner</h1>
        <p className="text-slate-500 text-sm">Instantly identify products with your camera</p>
      </div>

      {/* Camera Viewfinder */}
      <div className="relative w-full aspect-[3/4] sm:aspect-video bg-slate-900 rounded-[24px] overflow-hidden shadow-xl">

        {/* Video element */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Inactive state */}
        {!cameraActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Camera className="w-10 h-10 text-white/60" />
            </div>
            <p className="text-white/70 text-sm">Tap to activate camera</p>
            <button
              onClick={() => startCamera()}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          </div>
        )}

        {/* Permission denied state */}
        {permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
            <CameraOff className="w-12 h-12 text-red-400" />
            <p className="text-sm font-medium text-red-300">Camera Access Denied</p>
            <p className="text-xs text-white/60 leading-relaxed">{cameraError}</p>
          </div>
        )}

        {/* Error state */}
        {cameraError && !permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
            <CameraOff className="w-12 h-12 text-orange-400" />
            <p className="text-sm text-white/70">{cameraError}</p>
          </div>
        )}

        {/* Active camera overlay */}
        {cameraActive && (
          <>
            {/* Animated scan line */}
            {scanning && (
              <div className="absolute left-8 right-8 h-0.5 bg-primary-400 shadow-[0_0_12px_4px_rgba(96,165,250,0.5)] animate-[scanline_1.5s_ease-in-out_infinite]" />
            )}

            {/* Corner brackets */}
            <div className="absolute inset-8">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-xl opacity-80" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-xl opacity-80" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-xl opacity-80" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-xl opacity-80" />
            </div>

            {/* Center hint when idle */}
            {!scanning && !scanResult && (
              <div className="absolute inset-x-0 bottom-16 flex justify-center">
                <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full">
                  Point at a product, then tap Scan
                </div>
              </div>
            )}

            {/* Scanning indicator */}
            {scanning && (
              <div className="absolute inset-x-0 bottom-16 flex justify-center">
                <div className="bg-primary-600/80 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Analyzing product...
                </div>
              </div>
            )}

            {/* Camera controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={flipCamera}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={stopCamera}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Scan Result Overlay */}
        {scanResult && cameraActive && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600 font-semibold mb-0.5">Product Detected ({scanResult.confidence}% match)</p>
                <p className="text-sm font-bold text-slate-900 leading-tight">{scanResult.name}</p>
                <p className="text-xs text-slate-500">{scanResult.category}</p>
              </div>
              <button onClick={() => setScanResult(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scan Button */}
      {cameraActive && (
        <button
          onClick={performScan}
          disabled={scanning}
          className="w-full bg-primary-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20"
        >
          <ScanLine className="w-5 h-5" />
          {scanning ? "Scanning..." : "Scan Product"}
        </button>
      )}

      {/* AI Benefits Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="text-base font-bold text-slate-900">Why use AI Scanning?</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Zap, label: "Instant", desc: "Identify products in seconds", color: "bg-blue-50 text-blue-600" },
            { icon: Search, label: "Accurate", desc: "1000s of hardware items", color: "bg-purple-50 text-purple-600" },
            { icon: Box, label: "Auto-Sort", desc: "AI assigns categories", color: "bg-emerald-50 text-emerald-600" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">{label}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
