"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";

function Header() {
  const path = usePathname();
  const [isPopup, setIsPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsPopup(!!window.opener);
  }, []);

  if (isPopup) return null;

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between bg-gradient-to-b from-gray-100 via-[#e0e7ff] to-indigo-100 bg-opacity-90 backdrop-blur-md p-4 shadow-lg z-20 text-gray-900 h-19 font-sans"
    >
      {/* Mobile Menu Button */}
      <motion.div className="md:hidden" whileTap={{ scale: 0.95 }}>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <HiX className="h-8 w-8 text-gray-900 hover:text-indigo-700 transition-colors" />
          ) : (
            <HiMenu className="h-8 w-8 text-gray-900 hover:text-indigo-700 transition-colors" />
          )}
        </button>
      </motion.div>

      {/* App Name */}
      <motion.div
        className="text-2xl font-extrabold tracking-wide text-indigo-700"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ textShadow: "0 0 10px rgba(79, 70, 229, 0.7)" }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        DeepWorkAI
      </motion.div>

      {/* Desktop Menu */}
      <motion.ul
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex items-center gap-8 mx-auto"
      >
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/TheStory", label: "Why DeepWorkAI?" },
          { href: "/dashboard/WhoThisAppIsFor", label: "For Whom?" },
          { href: "/dashboard/HowItWorks", label: "How it works?" },
        ].map((item) => (
          <Link href={item.href} key={item.href}>
            <motion.li
              className={`text-base font-semibold cursor-pointer relative ${
                path === item.href ? "text-indigo-700" : "text-gray-800"
              }`}
              whileHover={{ color: "#9333EA", scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
              {path === item.href && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </motion.li>
          </Link>
        ))}
      </motion.ul>

      {/* Right Section: Take a Session Button and User Button */}
      <motion.div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Link
            href="/dashboard/execute"
            className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            Take a Session
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }}>
          <UserButton afterSignOutUrl="/" />
        </motion.div>
      </motion.div>

      {/* Mobile Menu */}
      <motion.div
        variants={mobileMenuVariants}
        initial="hidden"
        animate={isMobileMenuOpen ? "visible" : "hidden"}
        className="absolute top-20 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md p-6 md:hidden shadow-lg z-30 rounded-b-xl"
      >
        <ul className="flex flex-col gap-4">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/TheStory", label: "Why DeepWorkAI?" },
            { href: "/dashboard/WhoThisAppIsFor", label: "For Whom?" },
            { href: "/dashboard/HowItWorks", label: "How it works?" },
            { href: "/dashboard/execute", label: "Take a Session" },
          ].map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <motion.li
                className={`text-base font-semibold cursor-pointer ${
                  path === item.href ? "text-indigo-700" : "text-gray-900"
                } py-2 hover:text-indigo-600 transition-colors`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.li>
            </Link>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default Header;