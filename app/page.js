"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FaEye, FaRocket, FaChartLine } from "react-icons/fa";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.25 } },
};

const neonPulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    boxShadow: [
      "0 0 10px rgba(99, 102, 241, 0.4)",
      "0 0 20px rgba(99, 102, 241, 0.7)",
      "0 0 10px rgba(99, 102, 241, 0.4)",
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const hologramEffect = {
  initial: { opacity: 0.8, scale: 0.95, y: 10 },
  animate: {
    opacity: [0.8, 1, 0.8],
    scale: [0.95, 1, 0.95],
    y: [10, 0, 10],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

const iconPulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [focusAnimation, setFocusAnimation] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let tiltNodes = [];

    fetch("/animations/FocusAnimation.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => isMounted && setFocusAnimation(data))
      .catch((error) => console.error("Error loading focus animation:", error));

    const initTilt = async () => {
      if (typeof window === "undefined") return;
      try {
        const { default: VanillaTilt } = await import("vanilla-tilt");
        if (!isMounted) return;
        tiltNodes = Array.from(document.querySelectorAll(".cyber-card"));
        if (!tiltNodes.length) return;
        VanillaTilt.init(tiltNodes, {
          max: 15,
          speed: 400,
          glare: true,
          "max-glare": 0.3,
        });
      } catch (error) {
        console.error("Error loading VanillaTilt:", error);
      }
    };

    initTilt();

    return () => {
      isMounted = false;
      tiltNodes.forEach((node) => node.vanillaTilt?.destroy());
    };
  }, []);

  const handleImageError = (e, src) => {
    console.error(`Image load error for ${src}:`, e);
    setImageError(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 text-gray-800 overflow-x-hidden font-inter flex flex-col">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "linear-gradient(45deg, #c3dafe, #e9d5ff, #f9c2ff)",
            "linear-gradient(45deg, #f9c2ff, #c3dafe, #e9d5ff)",
            "linear-gradient(45deg, #e9d5ff, #f9c2ff, #c3dafe)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {/* Particle Effects */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-indigo-400 opacity-60"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 0.8, 0.4],
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.div>
        ))}
      </motion.div>

      {/* Sticky Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md py-4 px-6 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold text-indigo-600"
            whileHover={{ scale: 1.05 }}
          >
            DeepWork AI
          </motion.h1>
          <div className="space-x-4">
            <Link href="/dashboard">
              <Button className="bg-indigo-500 text-white hover:bg-indigo-600 transition-all duration-300">
                Dashboard
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-300">
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-grow">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Text and Animation */}
            <div className="text-center lg:text-left space-y-6">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 leading-tight tracking-tighter"
                variants={fadeInUp}
              >
                DeepWork AI: Unleash Your Flow
              </motion.h1>

              {/* Focus Animation with Hologram Effect */}
              {focusAnimation && (
                <motion.div
                  variants={hologramEffect}
                  className="flex justify-center lg:justify-start"
                >
                  <div className="relative w-64 h-64 md:w-80 md:h-80">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-2xl"
                      variants={neonPulse}
                      animate="animate"
                    />
                    <Lottie animationData={focusAnimation} loop={true} />
                  </div>
                </motion.div>
              )}

              <motion.p
                className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                variants={fadeInUp}
              >
                Elevate your productivity with <span className="font-semibold text-indigo-500">AI-driven tools</span> inspired by 4DX principles, designed to keep you in the zone.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                variants={fadeInUp}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {isHovered ? "Launch Your Focus!" : "Start Now"}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Side: Holographic Cartoon Image */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center items-center"
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/25 to-purple-500/25 blur-2xl"
                  variants={neonPulse}
                  animate="animate"
                />
                {!imageError ? (
                  <motion.div
                    className="relative z-10"
                    variants={hologramEffect}
                  >
                    <Image
                      src="/ll.png"
                      alt="Holographic Robot Mascot"
                      width={384}
                      height={384}
                      className="object-contain"
                      onError={(e) => handleImageError(e, "/ll.png")}
                      priority
                    />
                  </motion.div>
                ) : (
                  <div className="relative z-10 w-full h-full flex items-center justify-center bg-gray-100/60 rounded-3xl">
                    <p className="text-gray-500 text-base">Image unavailable</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Single Container for Cards and Call to Action */}
        <div className="space-y-24">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1: AI Focus Tracking */}
            <motion.div
              variants={fadeInUp}
              className="cyber-card relative p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-200 hover:border-indigo-400 transition-all duration-500"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-indigo-100/30 opacity-0 hover:opacity-100 transition-opacity duration-500"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-t-2xl" />
              <motion.div
                className="flex justify-center mb-4"
                variants={iconPulse}
                animate="animate"
              >
                <FaEye className="text-indigo-500 text-4xl" />
              </motion.div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-3 tracking-tight text-center">AI Focus Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                Stay locked in with real-time AI monitoring to banish distractions.
              </p>
            </motion.div>

            {/* Feature 2: Smart Goal Planning */}
            <motion.div
              variants={fadeInUp}
              className="cyber-card relative p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-200 hover:border-purple-400 transition-all duration-500"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-purple-100/30 opacity-0 hover:opacity-100 transition-opacity duration-500"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-300 rounded-t-2xl" />
              <motion.div
                className="flex justify-center mb-4"
                variants={iconPulse}
                animate="animate"
              >
                <FaRocket className="text-purple-500 text-4xl" />
              </motion.div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3 tracking-tight text-center">Smart Goal Planning</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                Transform dreams into reality with AI-crafted, actionable plans.
              </p>
            </motion.div>

            {/* Feature 3: Dynamic Analytics */}
            <motion.div
              variants={fadeInUp}
              className="cyber-card relative p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-pink-200 hover:border-pink-400 transition-all duration-500"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-pink-100/30 opacity-0 hover:opacity-100 transition-opacity duration-500"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-300 rounded-t-2xl" />
              <motion.div
                className="flex justify-center mb-4"
                variants={iconPulse}
                animate="animate"
              >
                <FaChartLine className="text-pink-500 text-4xl" />
              </motion.div>
              <h3 className="text-xl font-semibold text-pink-600 mb-3 tracking-tight text-center">Dynamic Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                Fuel motivation with vivid, AI-powered progress insights.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative cyber-card p-10 rounded-2xl bg-white/90 backdrop-blur-md text-center"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-200/50 to-purple-200/50"
              animate={{ opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-indigo-600 tracking-tight">Ready to Dominate Your Goals?</h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Join DeepWork AI and wield futuristic tools to skyrocket your productivity.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Get Started Button at Bottom */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {isHovered ? "Ignite Your Journey!" : "Get Started"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Wave at the Bottom */}
      <motion.div
        className="fixed bottom-0 left-0 w-full overflow-hidden opacity-50 z-0"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          className="w-full h-40 text-indigo-100"
          fill="currentColor"
          viewBox="0 0 1440 120"
        >
          <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,0,320Z" />
        </svg>
      </motion.div>

      {/* Tailwind and Font Imports */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .cyber-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .cyber-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}
