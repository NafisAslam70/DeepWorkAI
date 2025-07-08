"use client";
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStar, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const YOUTUBE_API_KEY = 'AIzaSyB20FC1Q-oZFriisgVcVJVlwV25UBCmUDQ';
const YOUTUBE_PLAYLIST_ID = 'PLriLgVg0-Kgzu0Y-Rz2ofUT1E53lUjh_T';

const quotes = [
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport, Deep Work" },
  { text: "Deliberate practice is the key to developing high-level skills.", author: "Anders Ericsson, Peak" },
  { text: "Focus on the wildly important goals to achieve extraordinary results.", author: "Chris McChesney, The 4 Disciplines of Execution" },
  { text: "Flow is the state where you are fully immersed in an activity.", author: "Mihaly Csikszentmihalyi, Flow" },
  { text: "Ultralearning is about aggressively pursuing learning goals.", author: "Scott Young, Ultralearning" },
];

const fourDxTips = [
  { title: "Wildly Important Goals", tip: "Pick one goal that matters most today and align all efforts toward it." },
  { title: "Lead Measures", tip: "Track actions like focused session time to drive progress." },
  { title: "Scoreboard", tip: "Visualize your focus trends with a simple, engaging tracker." },
  { title: "Accountability", tip: "Review your weekly analytics to stay on track." },
];

const successStories = [
  { name: "Jane D.", story: "Completed a novel in 6 months by dedicating 2 hours daily to deep work.", icon: faStar },
  { name: "Mark S.", story: "Mastered data science through deliberate practice, landing a dream job.", icon: faStar },
  { name: "Aisha R.", story: "Used 4DX to focus on key projects, boosting team productivity by 40%.", icon: faStar },
];

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [focusStreak, setFocusStreak] = useState(5); // Mock data
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "day");

  const fetchVideos = async () => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          playlistId: YOUTUBE_PLAYLIST_ID,
          maxResults: 4,
          key: YOUTUBE_API_KEY,
        },
      });
      setVideos(response.data.items);
    } catch (error) {
      console.error("Error fetching videos from YouTube", error);
    }
  };

  useEffect(() => {
    fetchVideos();
    const quoteInterval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 8000);
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % fourDxTips.length);
    }, 6000);
    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 10000);
    return () => {
      clearInterval(quoteInterval);
      clearInterval(tipInterval);
      clearInterval(storyInterval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "day" ? "night" : "day"));
  };

  const videoOpts = {
    height: '100%',
    width: '100%',
    playerVars: { autoplay: 0, origin: 'http://localhost:3000' },
  };

  const handleVideoError = (videoId) => {
    console.error(`Error loading video with ID: ${videoId}`);
    setVideos((prevVideos) => prevVideos.filter((video) => video.snippet.resourceId.videoId !== videoId));
  };

  return (
    <div className="w-full min-h-screen text-gray-800 overflow-hidden">
      {/* Theme Toggle Button */}
      <motion.button
        className={`fixed top-14 right-4 p-2 rounded-full ${mode === "day" ? "bg-gray-200/30" : "bg-gray-900/30"} backdrop-blur-lg shadow-md z-50 border border-gray-400/30`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMode}
      >
        {mode === "day" ? (
          <FontAwesomeIcon icon={faMoon} className="text-blue-500" size="lg" />
        ) : (
          <FontAwesomeIcon icon={faSun} className="text-yellow-400" size="lg" />
        )}
      </motion.button>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen flex items-center justify-center text-center overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            background: mode === "day"
              ? [
                  "linear-gradient(45deg, #c3dafe, #e9d5ff, #f9c2ff)",
                  "linear-gradient(45deg, #f9c2ff, #c3dafe, #e9d5ff)",
                  "linear-gradient(45deg, #e9d5ff, #f9c2ff, #c3dafe)",
                ]
              : [
                  "radial-gradient(circle at 20% 20%, #1f2937, #111827, #1e3a8a)",
                  "radial-gradient(circle at 80% 80%, #111827, #1f2937, #1e40af)",
                  "radial-gradient(circle at 50% 50%, #1e3a8a, #111827, #1f2937)",
                ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          {/* Particle Effects (Day and Night) */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-60"
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
              <svg className="w-3 h-3" fill={mode === "day" ? "currentColor" : "#93c5fd"} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          ))}
          {/* Wave at the Bottom (Day and Night) */}
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
          {/* Night Mode Specific Effects */}
          {mode === "night" && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`night-shape-${i}`}
                  className="absolute w-4 h-4 bg-blue-500/20 rounded-sm opacity-30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 80 - 40, 0],
                    y: [0, Math.random() * 80 - 40, 0],
                    rotate: [0, 360, 0],
                    opacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 15 + Math.random() * 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`night-particle-${i}`}
                  className="absolute w-2 h-2 bg-blue-600 rounded-full opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0.5, 1.2, 0.5],
                    opacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-blue-900/20 to-transparent"
                animate={{ x: [-30, 30], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <svg className="w-full h-full" viewBox="0 0 1440 120">
                  <path
                    fill="rgba(30, 64, 175, 0.1)"
                    d="M0,120 L0,80 Q100,70 200,80 Q300,90 400,80 Q500,70 600,80 Q700,90 800,80 Q900,70 1000,80 Q1100,90 1200,80 Q1300,70 1400,80 Q1440,90 1440,80 L1440,120 Z"
                  />
                </svg>
              </motion.div>
            </>
          )}
        </motion.div>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-5xl mx-auto px-4"
        >
          <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 ${mode === "day" ? "text-gray-800" : "text-gray-200"} drop-shadow-lg`}>
            Ignite Your Deep Work
          </h1>
          <blockquote className={`text-xl md:text-2xl italic mb-6 glassmorphic p-6 rounded-lg ${mode === "day" ? "text-gray-700" : "text-gray-300"}`}>
            “{currentQuote.text}”
            <footer className="mt-2 text-sm text-gray-500">— {currentQuote.author}</footer>
          </blockquote>
          <Link href="/dashboard/home">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${mode === "day" ? "from-blue-500 to-gray-600" : "from-blue-600 to-gray-800"} text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-gray-700 transition-all`}
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2" /> Start Your DeepWork Journey
            </motion.button>
          </Link>
          <div className="grid grid-cols-1 mt-12 mb-8 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fourDxTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: index === currentTipIndex ? 1 : 0.7,
                  scale: index === currentTipIndex ? 1 : 0.95,
                  y: 0,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)",
                  borderColor: "rgba(59, 130, 246, 0.5)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`glassmorphic p-8 rounded-xl text-center ${mode === "day" ? "bg-white/15" : "bg-gray-900/40"} border border-gray-400/20 shadow-lg backdrop-blur-lg transform transition-all duration-300 hover:-translate-y-2 min-h-[220px]`}
              >
                <motion.div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mode === "day" ? "from-blue-500 to-gray-600" : "from-blue-600 to-gray-800"} opacity-0 group-hover:opacity-100`}
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <h3 className={`text-2xl font-bold mb-4 ${mode === "day" ? "text-blue-600" : "text-blue-400"} tracking-tight`}>{tip.title}</h3>
                <p className={`text-base leading-relaxed ${mode === "day" ? "text-gray-700" : "text-gray-300"} font-medium`}>{tip.tip}</p>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ opacity: 0.1 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Motivation Reels Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className={`relative py-20 px-6 ${mode === "day" ? "bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100" : "bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900"}`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-72 h-72 bg-blue-300/20 rounded-full blur-3xl -top-32 -left-32 animate-blob" />
          <div className="absolute w-72 h-72 bg-gray-300/20 rounded-full blur-3xl -bottom-24 left-1/2 animate-blob animation-delay-2000" />
          <div className="absolute w-72 h-72 bg-blue-300/20 rounded-full blur-3xl -bottom-32 -right-32 animate-blob animation-delay-4000" />
        </div>
        <h2 className={`relative text-4xl md:text-5xl font-extrabold text-center mb-14 ${mode === "day" ? "text-gray-800" : "text-gray-200"} drop-shadow-sm`}>
          Fuel Your Focus
        </h2>
        <div className="relative grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {videos.slice(0, 3).map((video, idx) => (
            <motion.article
              key={video.snippet.resourceId.videoId}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className={`group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow ${mode === "day" ? "bg-white/20" : "bg-gray-900/30"} backdrop-blur-lg border border-gray-400/30`}
            >
              <YouTube
                videoId={video.snippet.resourceId.videoId}
                opts={videoOpts}
                onError={() => handleVideoError(video.snippet.resourceId.videoId)}
                containerClassName="aspect-video w-full"
                className="w-full h-full"
              />
              <div className="p-4 text-center">
                <p className={`text-sm font-medium ${mode === "day" ? "text-gray-700 group-hover:text-blue-500" : "text-gray-300 group-hover:text-blue-400"} transition-colors line-clamp-2`}>
                  {video.snippet.title}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="relative mt-16 text-center">
          <Link href="/dashboard/motivation">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.94 }}
              className={`inline-flex items-center gap-3 bg-gradient-to-r ${mode === "day" ? "from-blue-500 to-gray-600" : "from-blue-600 to-gray-800"} text-white px-10 py-4 rounded-full font-semibold tracking-wide shadow-lg hover:to-gray-700 transition-all`}
            >
              Explore More Motivation
              <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Success Stories Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`py-16 px-6 ${mode === "day" ? "bg-gray-100/50" : "bg-gray-900/50"}`}
      >
        <h2 className={`text-4xl font-bold text-center mb-12 ${mode === "day" ? "text-gray-800" : "text-gray-200"}`}>Success Stories</h2>
        <AnimatePresence>
          <motion.div
            key={currentStoryIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className={`max-w-2xl mx-auto glassmorphic p-6 rounded-lg text-center ${mode === "day" ? "bg-white/20" : "bg-gray-900/30"} border border-gray-400/30`}
          >
            <FontAwesomeIcon icon={successStories[currentStoryIndex].icon} className={`text-3xl mb-4 ${mode === "day" ? "text-blue-500" : "text-blue-400"}`} />
            <p className={`text-lg ${mode === "day" ? "text-gray-700" : "text-gray-300"} mb-2`}>{successStories[currentStoryIndex].story}</p>
            <p className="text-sm text-gray-500">— {successStories[currentStoryIndex].name}</p>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative py-20 px-6 ${mode === "day" ? "bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100" : "bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900"} text-center`}
      >
        <h2 className={`text-4xl font-bold mb-6 ${mode === "day" ? "text-gray-800" : "text-gray-200"}`}>Ready to Transform Your Focus?</h2>
        <Link href="/dashboard/execute">
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.9 }}
            className={`bg-gradient-to-r ${mode === "day" ? "from-blue-500 to-gray-600" : "from-blue-600 to-gray-800"} text-white px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:to-gray-700`}
          >
            <FontAwesomeIcon icon={faPlay} className="mr-2" /> Start DeepWork Now
          </motion.button>
        </Link>
      </motion.section>

      <style jsx global>{`
        .glassmorphic {
          background: ${mode === "day" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.4)"};
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .particles {
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><circle fill="rgba(59,130,246,0.2)" cx="100" cy="100" r="5"/><circle fill="rgba(59,130,246,0.2)" cx="700" cy="200" r="3"/><circle fill="rgba(59,130,246,0.2)" cx="300" cy="600" r="4"/><circle fill="rgba(59,130,246,0.2)" cx="500" cy="400" r="5"/></svg>') repeat;
          animation: float 20s linear infinite;
        }
        @keyframes float {
          0% { background-position: 0 0; }
          100% { background-position: 800px 800px; }
        }
        @keyframes blob {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(30px) scale(1.05); }
          66% { transform: translateY(15px) translateX(-25px) scale(0.95); }
        }
        .animate-blob { animation: blob 18s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default Dashboard;