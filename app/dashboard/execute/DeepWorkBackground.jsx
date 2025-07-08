import { motion } from "framer-motion";
import React from "react";
import { FaSun, FaMoon, FaStar } from "react-icons/fa";

const particleVariants = {
  animate: (i) => ({
    scale: [0.8, 1.2, 0.8],
    opacity: [0.3, 0.7, 0.3],
    transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
  }),
};

const BackgroundAnimation = ({ mode }) => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
      {mode === "night" ? (
        // Night Mode: Cosmic Forest
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-black">
          {/* Starry Sky Background */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-50"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${Math.random() * 0.5 + 0.5})`,
                }}
              />
            ))}
          </motion.div>

          {/* Orbiting Particles (Thoughts/Neurons) */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-indigo-300 rounded-full opacity-70"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: `${Math.random() * 200 - 100}px ${Math.random() * 200 - 100}px`,
                }}
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>

          {/* Misty Fog Layer */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-indigo-900/30 to-transparent"
            animate={{ x: [-20, 20] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <svg className="w-full h-full text-indigo-800/50" fill="currentColor" viewBox="0 0 1440 120">
              <path
                opacity="0.6"
                d="M0,120 L0,80 C100,70 200,90 300,80 C400,70 500,90 600,80 C700,70 800,90 900,80 C1000,70 1100,90 1200,80 C1300,70 1400,90 1440,80 L1440,120 L0,120 Z"
              />
            </svg>
          </motion.div>

          {/* Majestic Glowing Trees */}
          <motion.div
            className="fixed bottom-0 left-0 w-full h-60 opacity-60"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-full h-full text-indigo-200" fill="currentColor" viewBox="0 0 1440 180">
              <defs>
                <filter id="treeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.path
                filter="url(#treeGlow)"
                d="M0,180 L0,120 C100,100 200,130 300,110 C400,90 500,120 600,100 C700,80 800,110 900,90 C1000,70 1100,100 1200,80 C1300,60 1400,90 1440,70 L1440,180 L720,180 C710,170 700,160 690,160 L670,160 C660,160 650,170 640,180 L360,180 C350,160 340,140 330,140 L310,140 C300,140 290,160 280,180 L0,180 Z"
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </div>
      ) : (
        // Day Mode: Blue-ish Gradient with Wave
        <div className="absolute inset-0">
          {/* Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(45deg, #c3dafe, #e9d5ff, #f9c2ff)",
                "linear-gradient(45deg, #f9c2ff, #c3dafe, #e9d5ff)",
                "linear-gradient(45deg, #e9d5ff, #f9c2ff, #c3dafe)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Animated Star Particles (No Rotation) */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-indigo-400 opacity-50"
              style={{ left: `${50 + (i - 2) * 10}%`, top: "50%" }}
              variants={particleVariants}
              animate="animate"
              custom={i}
            >
              <FaStar size={10} />
            </motion.div>
          ))}

          {/* Wave with Celestial Trees */}
          <motion.div
            className="fixed bottom-0 left-0 w-full overflow-hidden opacity-40"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-full h-20 text-indigo-100" viewBox="0 0 1440 60">
              <defs>
                <linearGradient id="twilightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#818CF8", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#C084FC", stopOpacity: 0.8 }} />
                </linearGradient>
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                fill="url(#twilightGradient)"
                d="M0,60 L0,45 Q50,35 100,40 Q150,30 200,35 Q250,25 300,30 Q350,20 400,25 Q450,15 500,20 Q550,25 600,20 Q650,15 700,20 Q750,25 800,20 Q850,15 900,20 Q950,25 1000,20 Q1050,15 1100,20 Q1150,25 1200,20 Q1250,15 1300,20 Q1350,25 1400,20 Q1430,15 1440,20 L1440,60 L1200,60 Q1195,50 1190,50 Q1185,50 1180,60 L900,60 Q895,45 890,45 Q885,45 880,60 L600,60 Q595,50 590,50 Q585,50 580,60 L300,60 Q295,40 290,40 Q285,40 280,60 L150,60 Q145,45 140,45 Q135,45 130,60 L0,60 Z"
              />
              <path
                fill="url(#twilightGradient)"
                opacity="0.5"
                d="M0,60 L0,50 Q70,45 140,48 Q210,43 280,45 Q350,40 420,43 Q490,38 560,40 Q630,35 700,38 Q770,33 840,35 Q910,30 980,33 Q1050,28 1120,30 Q1190,25 1260,28 Q1330,23 1400,25 Q1430,20 1440,23 L1440,60 L1050,60 Q1045,55 1040,55 Q1035,55 1030,60 L630,60 Q625,50 620,50 Q615,50 610,60 L210,60 Q205,50 200,50 Q195,50 190,60 L0,60 Z"
              />
              <circle cx="300" cy="30" r="2" fill="white" filter="url(#starGlow)" />
              <circle cx="500" cy="20" r="2" fill="white" filter="url(#starGlow)" />
              <circle cx="700" cy="20" r="2" fill="white" filter="url(#starGlow)" />
              <circle cx="900" cy="20" r="2" fill="white" filter="url(#starGlow)" />
              <circle cx="1100" cy="20" r="2" fill="white" filter="url(#starGlow)" />
              <circle cx="1300" cy="20" r="2" fill="white" filter="url(#starGlow)" />
            </svg>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const DeepWorkBackground = ({ mode, toggleMode }) => {
  return (
    <>
      <BackgroundAnimation mode={mode} />
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
          <motion.button
            onClick={toggleMode}
            className={`p-2 rounded-full ${mode === "night" ? "bg-indigo-500 text-white" : "text-gray-500"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaMoon size={16} />
          </motion.button>
          <motion.button
            onClick={toggleMode}
            className={`p-2 rounded-full ${mode === "day" ? "bg-yellow-500 text-white" : "text-gray-500"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaSun size={16} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default DeepWorkBackground;