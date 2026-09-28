import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function Card3D({ children, className = '', depth = 40, borderGlow = true }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Emil Kowalski spring physics configuration
  const springConfig = { damping: 20, stiffness: 260, mass: 0.4 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // 3D rotation angles
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  // Dynamic light glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['10%', '90%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['10%', '90%']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    x.set(clientX / width - 0.5);
    y.set(clientY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className={`relative group rounded-2xl border border-white/10 bg-[#0c0c10]/90 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-emerald-500/10 ${className}`}
      >
        {/* Meng To Specular Ambient Glare */}
        {borderGlow && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(600px circle at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 70%)`
            }}
          />
        )}

        {/* 3D Depth Layer */}
        <div style={{ transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }} className="w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default Card3D;