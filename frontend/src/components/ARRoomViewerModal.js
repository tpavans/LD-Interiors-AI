"use client";
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Eye, X, Smartphone, Layers, Check, RotateCw, ZoomIn, Camera, VideoOff, Move, Maximize2, RefreshCw } from 'lucide-react';

export default function ARRoomViewerModal({ product, onClose }) {
  const [activeFinish, setActiveFinish] = useState('natural');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [arCameraActive, setArCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const finishes = [
    { id: 'natural', name: 'Natural Burma Teak', color: '#D4A373', filter: 'none' },
    { id: 'walnut', name: 'Dark Walnut Polish', color: '#583101', filter: 'sepia(0.8) hue-rotate(-30deg) brightness(0.7)' },
    { id: 'rosewood', name: 'Royal Rosewood Shade', color: '#3D0C02', filter: 'sepia(0.9) hue-rotate(-50deg) saturate(1.5) brightness(0.6)' },
    { id: 'pu_gloss', name: 'High-Gloss PU Finish', color: '#FAEDCD', filter: 'contrast(1.2) brightness(1.1)' }
  ];

  const currentFinishObj = finishes.find(f => f.id === activeFinish) || finishes[0];

  // Stop camera stream when component unmounts or AR exits
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleLaunchARCamera = async () => {
    setCameraError(null);
    setArCameraActive(true);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported on this browser.');
      return;
    }

    try {
      // Request real rear environment camera on mobile or default webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Please allow camera access in your browser settings to see furniture in your room.');
    }
  };

  const handleExitAR = () => {
    stopCamera();
    setArCameraActive(false);
  };

  // Touch/Mouse dragging handlers for placing furniture in AR view
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-left flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/80">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-sky-100 text-[#008DDA] px-3 py-1 rounded-full border border-sky-200">
              WebXR AR Studio
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#008DDA]" />
              360° View & Live AR Room Camera
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
              {product?.title || 'Custom Teakwood Design'}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Visualizer Area */}
          <div className="lg:col-span-8 bg-slate-950 p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
            {arCameraActive ? (
              /* REAL LIVE CAMERA STREAM WITH AR OVERLAY */
              <div
                className="relative w-full h-full min-h-[340px] flex items-center justify-center overflow-hidden rounded-2xl bg-black"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                {cameraError ? (
                  <div className="p-6 text-center text-white space-y-3">
                    <VideoOff className="h-10 w-10 text-red-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">{cameraError}</p>
                    <button
                      onClick={handleExitAR}
                      className="px-4 py-2 bg-slate-800 text-xs font-bold text-sky-300 rounded-full border border-sky-400/40"
                    >
                      Return to 3D View
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Live Mobile Camera Stream */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Drag-to-Position AR Furniture Overlay */}
                    <div
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleMouseDown}
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                        filter: currentFinishObj.filter,
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      className="relative z-10 select-none touch-none transition-transform duration-75"
                    >
                      <img
                        src={product?.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                        alt={product?.title || ''}
                        className="max-h-64 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] pointer-events-none"
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 whitespace-nowrap">
                        <Move className="h-3 w-3 text-sky-400" /> Touch & Drag to Move
                      </span>
                    </div>

                    {/* AR Live Controls Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                      <span className="bg-red-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        Live AR Camera Stream
                      </span>

                      <button
                        onClick={handleExitAR}
                        className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-black text-white text-xs font-bold rounded-full border border-white/20 shadow-lg cursor-pointer"
                      >
                        Exit AR Camera
                      </button>
                    </div>

                    {/* Bottom Scale & Rotate Controls */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold">
                      <button
                        onClick={() => setRotationAngle(prev => prev + 30)}
                        className="flex items-center gap-1 hover:text-sky-300 cursor-pointer"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Rotate 30°</span>
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => setZoomLevel(prev => (prev >= 1.5 ? 0.75 : prev + 0.25))}
                        className="flex items-center gap-1 hover:text-sky-300 cursor-pointer"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                        <span>Size: {zoomLevel.toFixed(2)}x</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* STANDARD 360 INTERACTIVE WOOD FINISH VIEWER */
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden py-6 select-none">
                <img
                  src={product?.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                  alt={product?.title || ''}
                  style={{
                    transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                    filter: currentFinishObj.filter,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="max-h-72 object-contain rounded-xl shadow-2xl drop-shadow-2xl"
                />

                {/* Controls Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setRotationAngle(prev => prev + 45)}
                      className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Rotate</span>
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => (prev === 1 ? 1.3 : 1))}
                      className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>{zoomLevel === 1 ? 'Zoom 1.3x' : 'Reset'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">{currentFinishObj.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Finish Selector & AR Launch Controls */}
          <div className="lg:col-span-4 p-6 bg-slate-50 border-l border-slate-200 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#008DDA]" />
                <span>Wood Polish & Shade Selector</span>
              </h4>

              <div className="space-y-2.5">
                {finishes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFinish(f.id)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      activeFinish === f.id
                        ? 'border-[#008DDA] bg-white font-extrabold text-slate-900 shadow-md ring-2 ring-[#008DDA]/20'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-4 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: f.color }} />
                      <span>{f.name}</span>
                    </div>
                    {activeFinish === f.id && <Check className="h-4 w-4 text-[#008DDA]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleLaunchARCamera}
                className="w-full py-3.5 bg-gradient-to-r from-[#008DDA] to-[#0077B6] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>{arCameraActive ? 'Reset Camera View' : 'See Design in Your Room (AR Camera)'}</span>
              </button>

              <p className="text-[10px] text-slate-500 font-medium text-center leading-relaxed">
                Uses real mobile camera to place & drag furniture over your room floor or wall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
