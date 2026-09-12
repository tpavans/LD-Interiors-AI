"use client";
import { useEffect, useRef } from 'react';

export default function Woodgrain3DHeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Particles representing floating golden teakwood grain dust & ambient light
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 500 + 100, // 3D Depth z-axis
      size: Math.random() * 3 + 1.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2, // Float upwards
      opacity: Math.random() * 0.6 + 0.2,
      goldenHue: Math.random() > 0.5 ? '#F59E0B' : '#D97706',
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle 3D Perspective Light Cone
      const focalLength = 400;
      const centerX = width / 2;
      const centerY = height / 2;

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX + (mouseX - centerX) * 0.0002;
        p.y += p.speedY + (mouseY - centerY) * 0.0002;
        p.z -= 0.3;

        if (p.y < 0 || p.z < 10) {
          p.x = Math.random() * width;
          p.y = height + 20;
          p.z = 500;
        }

        // 3D Projection Math
        const scale = focalLength / (focalLength + p.z);
        const projectedX = (p.x - centerX) * scale + centerX;
        const projectedY = (p.y - centerY) * scale + centerY;
        const projectedSize = p.size * scale * 1.5;

        // Draw 3D glowing particle
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
        ctx.fillStyle = p.goldenHue;
        ctx.globalAlpha = p.opacity * scale;
        ctx.shadowBlur = 12 * scale;
        ctx.shadowColor = p.goldenHue;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70" 
    />
  );
}
