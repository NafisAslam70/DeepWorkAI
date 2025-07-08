"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useAnimation } from "framer-motion";
import { usePathname } from "next/navigation";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function Sidebar() {
  const [isAnalyticsHovered, setIsAnalyticsHovered] = useState(false);
  const [studyAnimation, setStudyAnimation] = useState(null);
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    // Set active item based on the current pathname
    const pathMap = {
      "/dashboard/home": "Start Here",
      "/dashboard/execute": "Execute",
      "/dashboard/analytics/goal": "Analytics",
      "/dashboard/motivation": "Motivation",
    };
    const activeLabel = pathMap[pathname] || null;
    setActiveItem(activeLabel);
  }, [pathname]);

  useEffect(() => {
    fetch("/animations/StudyAnimation.json")
      .then((response) => response.json())
      .then((data) => setStudyAnimation(data))
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  const sidebarVariants = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hover: { scale: 1.1, y: -2, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const waveVariants = {
    animate: {
      x: [0, 10, -10, 0],
      transition: {
        x: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        },
      },
    },
  };

  const focusPulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      filter: ["blur(5px)", "blur(10px)", "blur(5px)"],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
      className="w-64 h-screen bg-gradient-to-b from-gray-900 via-[#231524] to-gray-800 text-white flex flex-col justify-between p-6 shadow-2xl z-10 backdrop-blur-sm relative"
    >
      {/* Focus Pulse Animation (Creative Deep Work Theme) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-full"
        variants={focusPulseVariants}
        animate="animate"
        style={{ zIndex: 0 }}
      />

      {/* Logo and DeepWorkAI Text (Top) */}
      <div className="flex flex-col items-center mb-10 relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <Image
            src="/logo6.png"
            width={146}
            height={90}
            alt="logo"
            className="object-contain drop-shadow-lg"
          />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 120 }}
          className="text-3xl font-extrabold text-white tracking-wider mt-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text"
        >
          DeepWorkAI
        </motion.h2>

        {/* Creative Animated Divider */}
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="mt-6 w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 rounded-full shadow-inner"
        />
      </div>

      {/* Navigation (Centered) */}
      <nav className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
        <Link href="/dashboard/home" onClick={() => setActiveItem("Start Here")}>
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className={`flex items-center gap-4 py-3 px-5 rounded-xl backdrop-blur-md transition-all duration-300 border ${
              activeItem === "Start Here" ? "border-indigo-500/50" : "border-gray-800/30"
            } group`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors"
              viewBox="0 0 20 20"
              fill="currentColor"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <path d="M9.049 2.927a.8.8 0 011.902 0l1.516 4.681a.8.8 0 00.76.55h4.917a.8.8 0 01.471 1.439l-3.975 2.89a.8.8 0 00-.29.888l1.516 4.681a.8.8 0 01-1.231.888l-3.975-2.89a.8.8 0 00-.94 0l-3.975 2.89a.8.8 0 01-1.231-.888l1.516-4.681a.8.8 0 00-.29-.888l-3.975-2.89a.8.8 0 01.471-1.439h4.917a.8.8 0 00.76-.55l1.516-4.681z" />
            </motion.svg>
            <span className="text-lg font-semibold tracking-wide text-gray-200 group-hover:text-white">Start Here</span>
          </motion.div>
        </Link>

        <Link href="/dashboard/execute" onClick={() => setActiveItem("Execute")}>
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className={`flex items-center gap-4 py-3 px-5 rounded-xl backdrop-blur-md transition-all duration-300 border ${
              activeItem === "Execute" ? "border-indigo-500/50" : "border-gray-800/30"
            } group`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </motion.svg>
            <span className="text-lg font-semibold tracking-wide text-gray-200 group-hover:text-white">Execute</span>
          </motion.div>
        </Link>

        <div
          className="relative"
          onMouseEnter={() => setIsAnalyticsHovered(true)}
          onMouseLeave={() => setIsAnalyticsHovered(false)}
        >
          <Link href="/dashboard/analytics/goal" onClick={() => setActiveItem("Analytics")}>
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className={`flex items-center justify-between py-3 px-5 rounded-xl backdrop-blur-md transition-all duration-300 border ${
                activeItem === "Analytics" ? "border-indigo-500/50" : "border-gray-800/30"
              } group`}
            >
              <div className="flex items-center gap-4">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </motion.svg>
                <span className="text-lg font-semibold tracking-wide text-gray-200 group-hover:text-white">Analytics</span>
              </div>
              <motion.span
                animate={{ rotate: isAnalyticsHovered ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg text-gray-300 group-hover:text-white"
              >
                ▶
              </motion.span>
            </motion.div>
          </Link>

          {/* Dropdown Menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isAnalyticsHovered ? 1 : 0, height: isAnalyticsHovered ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-700/70 rounded-lg mt-1 overflow-hidden backdrop-blur-md"
          >
            <Link href="/dashboard/analytics/goal" className="block py-2 px-6 text-base font-medium text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all">
              Goal Analytics
            </Link>
            <Link href="/dashboard/analytics/focus" className="block py-2 px-6 text-base font-medium text-gray-200 hover:bg-gray-600/50 hover:text-white transition-all">
              Focus Analytics
            </Link>
          </motion.div>
        </div>

        <Link href="/dashboard/motivation" onClick={() => setActiveItem("Motivation")}>
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className={`flex items-center gap-4 py-3 px-5 rounded-xl backdrop-blur-md transition-all duration-300 border ${
              activeItem === "Motivation" ? "border-indigo-500/50" : "border-gray-800/30"
            } group`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </motion.svg>
            <span className="text-lg font-semibold tracking-wide text-gray-200 group-hover:text-white">Motivation</span>
          </motion.div>
        </Link>
      </nav>

      {/* Lottie Animation (Bottom) */}
      {studyAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="mt-8 flex flex-col items-center"
        >
          <Lottie
            animationData={studyAnimation}
            loop={true}
            className="w-32 h-32 object-contain drop-shadow-md"
          />
          <p className="text-center text-gray-300 text-sm mt-3 font-light italic">Stay Focused & Achieve Your Goals</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Sidebar;