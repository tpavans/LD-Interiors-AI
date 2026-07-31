"use client";
import { useState } from 'react';
import { Sparkles, Eye, X, Smartphone, Layers, Check, RotateCw, ZoomIn, Camera } from 'lucide-react';

export default function ARRoomViewerModal({ product, onClose }) {
  const [activeFinish, setActiveFinish] = useState('natural');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [arCameraActive, setArCameraActive] = useState(false);

  const finishes = [
    { id: 'natural', name: 'Natural Burma Teak', color: '#D4A373', filter: 'none' },
    { id: 'walnut', name: 'Dark Walnut Polish', color: '#583101', filter: 'sepia(0.8) hue-rotate(-30deg) brightness(0.7)' },
    { id: 'rosewood', name: 'Royal Rosewood Shade', color: '#3D0C02', filter: 'sepia(0.9) hue-rotate(-50deg) saturate(1.5) brightness(0.6)' },
    { id: 'pu_gloss', name: 'High-Gloss PU Finish', color: '#FAEDCD', filter: 'contrast(1.2) brightness(1.1)' }
  ];

  const currentFinishObj = finishes.find(f => f.id === activeFinish) || finishes[0];

  const handleLaunchARCamera = () => {
    setArCameraActive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-left flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-sky-100 text-[#008DDA] px-3 py-1 rounded-full border border-sky-200">
              WebXR 3D & AR Room Studio
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#008DDA]" />
              360° Interactive View & AR Simulator
            </h3>
            <p className="text-xs text-slate-500 font-medium">{product?.title || 'Custom Teakwood Design'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Interactive 360 Canvas */}
          <div className="lg:col-span-8 bg-slate-950 p-6 flex flex-col items-center justify-center relative min-h-[340px]">
            {arCameraActive ? (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-slate-900 text-white rounded-2xl border border-sky-500/30">
                <Camera className="h-12 w-12 text-sky-400 animate-pulse mb-3" />
                <h4 className="text-sm font-bold text-white">AR Smartphone Camera Mode Active</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  Point your mobile phone camera at your entrance wall or bedroom floor to place this 3D model in real scale!
                </p>
                <button
                  onClick={() => setArCameraActive(false)}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 rounded-full border border-sky-400/40"
                >
                  Exit AR Camera
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden py-4 select-none">
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

                {/* 360 Control Overlay Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-white text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRotationAngle(prev => prev - 45)}
                      className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Rotate</span>
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => (prev === 1 ? 1.25 : 1))}
                      className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>{zoomLevel === 1 ? 'Zoom 1.25x' : 'Reset Zoom'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400">{currentFinishObj.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Finish Selector & AR Launch Controls */}
          <div className="lg:col-span-4 p-6 bg-slate-50 border-l border-slate-200 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#008DDA]" />
                <span>Wood Finish Simulator</span>
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
                <Smartphone className="h-4 w-4" />
                <span>See Design in Your Room (AR)</span>
              </button>

              <p className="text-[10px] text-slate-500 font-medium text-center">
                Compatible with iOS QuickLook & Android WebXR AR view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
