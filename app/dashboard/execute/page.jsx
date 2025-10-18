
"use client";
import React, { useState, useEffect, useRef } from "react";
import { sounds } from "./sounds";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { StudyProject, StudySession } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaBrain, FaClock, FaEye, FaMobileAlt, FaTint, FaSun, FaMoon } from "react-icons/fa";

// RuleCard Component
const RuleCard = ({ ruleNumber, description, icon: Icon, transition }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, rotateZ: 2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.3, ...transition }}
      className="bg-white/90 rounded-lg p-4 shadow-md flex flex-col items-center text-center gap-3 max-w-[250px] w-full backdrop-blur-sm"
    >
      <motion.div
        className="text-indigo-600"
        animate={{ scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity } }}
      >
        <Icon size={24} />
      </motion.div>
      <h4 className="text-sm font-semibold text-indigo-700">Rule {ruleNumber}</h4>
      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
    </motion.div>
  );
};

function ExecutePage() {
  const { user } = useUser();
  const [selectedSessionHours, setSelectedSessionHours] = useState(2);
  const [sessionConfig, setSessionConfig] = useState({
    sessionName: "",
    totalMinutes: 0,
    totalSegments: 0,
    studyDuration: 0,
    breakDuration: 0,
    nudgeEnabled: false,
    nudgeType: "text",
  });
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [selectedSound, setSelectedSound] = useState("");
  const [nudgeEnabled, setNudgeEnabled] = useState(true);
  const [nudgeType, setNudgeType] = useState("text_with_sound");
  const [goalDetails, setGoalDetails] = useState(null);
  const [userGoals, setUserGoals] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [nextSessionNo, setNextSessionNo] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [mode, setMode] = useState("day");
  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const searchParams = useSearchParams();
  const router = useRouter();
  const timerWindowRef = useRef(null); // Use useRef to persist timer window reference

  // Define Deep Work Rules
  const deepWorkRules = [
    {
      number: 1,
      description:
        "Work deeply by embracing boredom and draining shallow tasks, free from distractions to maximize productivity and depth.",
      icon: FaBrain,
    },
    {
      number: 2,
      description:
        "Structure your session with 45-minute study periods followed by 15-minute breaks, guiding you toward sustained focus and recovery.",
      icon: FaClock,
    },
    {
      number: 3,
      description:
        "Remain present at your study/workspace during study periods, leave the session only duirng breaks. 2mins of continous absence ends the session.",
      icon: FaEye,
    },
    {
      number: 4,
      description:
        "Keep your phone out of reach; the session ends if usage exceeds one minute, protecting your deep focus sanctuary.",
      icon: FaMobileAlt,
    },
    {
      number: 5,
      description:
        "Keep a glass of water nearby, a gentle reminder to nourish your body and sustain your ascent to clarity and productivity.",
      icon: FaTint,
    },
  ];

  // Persist theme in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("themeMode") || "day";
      if (stored !== mode) {
        setMode(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", mode);
    }
  }, [mode]);

  // Toggle between Night and Day modes
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "day" ? "night" : "day"));
  };

  // Fetch user goals
  useEffect(() => {
    const fetchUserGoals = async () => {
      if (!userEmail) return;
      try {
        const goals = await db
          .select()
          .from(StudyProject)
          .where(eq(StudyProject.createdBy, userEmail));
        setUserGoals(goals);
        if (goals.length === 0 && !searchParams.get("goalId") && !localStorage.getItem("selectedGoalId")) {
          setLoadingMessage("No goal selected");
        }
      } catch (error) {
        console.error("Error fetching user goals:", error);
        setErrorMessage("Failed to load goals. Please try again.");
        setIsErrorModalOpen(true);
      }
    };
    fetchUserGoals();
  }, [userEmail, searchParams]);

  // Fetch goal details
  useEffect(() => {
    const goalIdFromURL = searchParams.get("goalId");
    const storedGoalId = localStorage.getItem("selectedGoalId");
    const goalId = goalIdFromURL || storedGoalId;

    const fetchGoalDetails = async () => {
      if (!goalId) {
        setLoadingMessage("No goal selected");
        return;
      }

      try {
        const fetchedGoal = await db
          .select()
          .from(StudyProject)
          .where(eq(StudyProject.id, goalId));

        if (fetchedGoal?.length > 0) {
          setGoalDetails(fetchedGoal[0]);
          localStorage.setItem("selectedGoalId", goalId);

          const sessions = await db
            .select()
            .from(StudySession)
            .where(eq(StudySession.projectId, goalId));

          const lastSession = sessions.sort((a, b) => parseInt(b.sessionNo, 10) - parseInt(a.sessionNo, 10))[0];

          const nextSessionNo = lastSession ? parseInt(lastSession.sessionNo, 10) + 1 : 1;
          setNextSessionNo(nextSessionNo);
          setLoadingMessage("");
        } else {
          setLoadingMessage("No goal selected");
        }
      } catch (error) {
        console.error("Error fetching goal details:", error);
        setErrorMessage("Failed to load goal details. Please try again.");
        setIsErrorModalOpen(true);
      }
    };

    fetchGoalDetails();
  }, [searchParams]);

  // Handlers
  const handleGoalSelect = (e) => {
    const goalId = e.target.value;
    if (goalId) {
      localStorage.setItem("selectedGoalId", goalId);
      router.push(`/dashboard/execute?goalId=${goalId}`);
    }
  };

  const handleSessionStart = () => {
    setIsOnboardingModalOpen(true);
    setCurrentRuleIndex(0);
    setOnboardingStep(0);
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === 0) {
      if (currentRuleIndex < deepWorkRules.length - 1) {
        setCurrentRuleIndex(currentRuleIndex + 1);
      } else {
        setOnboardingStep(1); // Move to webcam notice
        setCurrentRuleIndex(0);
      }
    } else if (onboardingStep === 1) {
      setOnboardingStep(2); // Move to posture step
    } else if (onboardingStep === 2) {
      setIsOnboardingModalOpen(false); // Close onboarding modal
      const totalMinutes = selectedSessionHours * 60;
      const studyDuration = 45;
      const breakDuration = 15;
      const totalSegments = Math.floor(totalMinutes / (studyDuration + breakDuration));

      setSessionConfig({
        sessionName: "Study Session",
        totalMinutes,
        totalSegments,
        studyDuration,
        breakDuration,
        nudgeEnabled,
        nudgeType,
      });

      setIsSessionModalOpen(true); // Open session confirmation modal
    }
  };

  const handleSkipToPosture = () => {
    setOnboardingStep(2);
    setCurrentRuleIndex(0);
  };

  const handleStartSessionConfirmed = () => {
    // Check if a timer window is already open
    if (timerWindowRef.current && !timerWindowRef.current.closed) {
      setErrorMessage("A study session is already running. Please complete or close the current session before starting a new one.");
      setIsErrorModalOpen(true);
      return;
    }

    setIsSessionModalOpen(false);
    const { totalSegments, studyDuration, breakDuration, nudgeEnabled, nudgeType } = sessionConfig;
    const projectId = localStorage.getItem("selectedGoalId");
    const goalName = goalDetails ? goalDetails.projectName : "Unknown";

    timerWindowRef.current = window.open(
      `/dashboard/execute/timer-window?study=${studyDuration}&break=${breakDuration}&segments=${totalSegments}&sound=${selectedSound}&goalName=${goalName}&projectId=${projectId}&sessionNo=${nextSessionNo}&nudgeEnabled=${nudgeEnabled}&nudgeType=${nudgeType}`,
      "TimerWindow",
      "toolbar=no,scrollbars=no,resizable=yes,width=800,height=600"
    );
  };

  /* ---- Cosmic-Forest background ---- */
  const NightBackground = () => (
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-black">
      {/* Starry Sky */}
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

      {/* Orbiting “neurons” */}
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

      {/* Fog */}
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

      {/* Glowing treeline */}
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
            d="M0,180 L0,120 C100,100 200,130 300,110 C400,90 500,120 600,100 C700,80 800,110 900,90 C1000,70 1100,100 1200,80 C1300,60 1400,90 1440,70 L1440,180 Z"
            animate={{ scaleY: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );

  const handleRandomSession = async () => {
    try {
      if (!userEmail) {
        console.error("User email not found.");
        setErrorMessage("User email not found. Please make sure you're signed in.");
        setIsErrorModalOpen(true);
        return;
      }

      const randomGoal = await db
        .select()
        .from(StudyProject)
        .where(and(eq(StudyProject.projectName, "random_goal"), eq(StudyProject.createdBy, userEmail)))
        .limit(1);

      if (randomGoal.length > 0) {
        const randomGoalId = randomGoal[0].id;
        localStorage.setItem("selectedGoalId", randomGoalId);
        router.push(`/dashboard/execute?goalId=${randomGoalId}`);
      } else {
        console.error("Random goal not found");
        setErrorMessage("Random goal not found. Please refresh the page.");
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching random goal:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  const handleGoBackHome = () => {
    router.push("/dashboard/home");
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95, rotateX: 10 },
    animate: { opacity: 1, scale: 1, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3 } },
  };

  const particleVariants = {
    animate: (i) => ({
      x: Math.cos(i) * 50,
      y: Math.sin(i) * 50,
      opacity: [0, 0.7, 0],
      scale: [0, 0.9, 0],
      transition: { duration: 3, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const glowVariants = {
    animate: {
      boxShadow: ["0 0 6px rgba(79, 70, 229, 0.4)", "0 0 12px rgba(79, 70, 229, 0.7)", "0 0 6px rgba(79, 70, 229, 0.4)"],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="w-full h-[100vh] flex items-center justify-center p-3 md:p-4 lg:p-6 relative overflow-hidden">
      {/* Background Gradient */}
      {mode === "day" ? (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(45deg,#c3dafe,#e9d5ff,#f9c2ff)",
              "linear-gradient(45deg,#f9c2ff,#c3dafe,#e9d5ff)",
              "linear-gradient(45deg,#e9d5ff,#f9c2ff,#c3dafe)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <NightBackground />
      )}

      {/* Theme toggle */}
      <motion.button
        className="fixed top-12 right-4 p-2 rounded-full bg-gray-200/80 backdrop-blur-sm shadow-md z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMode}
      >
        {mode === "day" ? (
          <FaMoon className="text-indigo-600" size={20} />
        ) : (
          <FaSun className="text-yellow-400" size={20} />
        )}
      </motion.button>

      {/* Particle Stars */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-indigo-400 opacity-50"
          style={{ left: "50%", top: "50%" }}
          variants={particleVariants}
          animate="animate"
          custom={i}
        >
          <FaStar size={10} />
        </motion.div>
      ))}

      {/* Main Card */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="relative bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg p-4 md:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg z-10"
      >
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-indigo-600">Welcome, {userName}!</h3>
          <p className="text-gray-500 mt-1 text-xs">Let's dive into your DeepWork journey.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mb-4">
          <h2 className="text-sm md:text-base font-medium text-gray-600">Working on Goal:</h2>
          <div className="flex items-center justify-center mt-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{goalDetails ? goalDetails.projectName : loadingMessage}</h1>
            {loadingMessage !== "No goal selected" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/home")}
                className="ml-3 bg-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-300 text-xs"
              >
                Change
              </motion.button>
            )}
          </div>
        </motion.div>

        {loadingMessage === "No goal selected" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center space-y-3">
            {userGoals.length > 0 ? (
              <>
                <p className="text-gray-600 text-xs">Please select a goal to continue:</p>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg p-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-xs"
                  onChange={handleGoalSelect}
                  value=""
                >
                  <option value="" disabled>
                    Select a Goal
                  </option>
                  {userGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.projectName}
                    </option>
                  ))}
                </select>
                <div className="flex justify-center gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoBackHome}
                    className="bg-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-300 flex-1 text-xs"
                  >
                    Go Back to Home
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRandomSession}
                    className="bg-emerald-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-emerald-600 transition-all duration-300 flex-1 text-xs"
                  >
                    Take Random Sessions
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-xs">No goals found. Create a new goal to start.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBackHome}
                  className="bg-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-300 text-xs"
                >
                  Create Goal
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-4"
            >
              Start Your Study Session
            </motion.h2>

            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="mb-4">
              <label className="block font-medium mb-1 text-gray-700 text-xs">Select Session Duration (Hours):</label>
              <input
                type="number"
                min="1"
                max="8"
                value={selectedSessionHours}
                onChange={(e) => setSelectedSessionHours(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-xs"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="mb-4">
              <label className="block font-medium mb-1 text-gray-700 text-xs">Select Background Sound:</label>
              <select
                className="w-full border-2 border-gray-200 rounded-lg p-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-xs"
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
              >
                <option value="">No Sound</option>
                {sounds.map((sound) => (
                  <option key={sound.value} value={sound.value}>
                    {sound.label}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="mb-4">
              <label className="block font-medium mb-1 text-gray-700 text-xs">Do you want to be nudged to stay focused?</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    name="nudge"
                    value="yes"
                    checked={nudgeEnabled}
                    onChange={() => setNudgeEnabled(true)}
                    className="mr-1"
                  />
                  Yes
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    name="nudge"
                    value="no"
                    checked={!nudgeEnabled}
                    onChange={() => setNudgeEnabled(false)}
                    className="mr-1"
                  />
                  No
                </label>
              </div>
              {nudgeEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2"
                >
                  <label className="block font-medium mb-1 text-gray-700 text-xs">Nudge Type:</label>
                  <select
                    className="w-full border-2 border-gray-200 rounded-lg p-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-xs"
                    value={nudgeType}
                    onChange={(e) => setNudgeType(e.target.value)}
                  >
                    <option value="text">Text Only</option>
                    <option value="text_with_sound">Text with Sound</option>
                  </select>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={glowVariants}
                animate="animate"
                onClick={handleSessionStart}
                className="bg-indigo-600 text-white py-1.5 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-all duration-300 text-sm"
              >
                Start Study Session
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Wave Background with Celestial Forest of Trees */}
      <motion.div
        className="fixed bottom-0 left-0 w-full overflow-hidden opacity-40 z-0"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-full h-20" viewBox="0 0 1440 60">
          {/* SVG Definitions for Gradient and Glow */}
          <defs>
            <linearGradient id="twilightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: mode === "day" ? "#818CF8" : "#1e3a8a", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: mode === "day" ? "#C084FC" : "#4c1d95", stopOpacity: 0.8 }} />
            </linearGradient>
            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Foreground Celestial Trees */}
          <path
            fill="url(#twilightGradient)"
            d="M0,60 L0,45 Q50,35 100,40 Q150,30 200,35 Q250,25 300,30 Q350,20 400,25 Q450,15 500,20 Q550,25 600,20 Q650,15 700,20 Q750,25 800,20 Q850,15 900,20 Q950,25 1000,20 Q1050,15 1100,20 Q1150,25 1200,20 Q1250,15 1300,20 Q1350,25 1400,20 Q1430,15 1440,20 L1440,60 L1200,60 Q1195,50 1190,50 Q1185,50 1180,60 L900,60 Q895,45 890,45 Q885,45 880,60 L600,60 Q595,50 590,50 Q585,50 580,60 L300,60 Q295,40 290,40 Q285,40 280,60 L150,60 Q145,45 140,45 Q135,45 130,60 L0,60 Z"
          />
          {/* Background Misty Horizon */}
          <path
            fill="url(#twilightGradient)"
            opacity="0.5"
            d="M0,60 L0,50 Q70,45 140,48 Q210,43 280,45 Q350,40 420,43 Q490,38 560,40 Q630,35 700,38 Q770,33 840,35 Q910,30 980,33 Q1050,28 1120,30 Q1190,25 1260,28 Q1330,23 1400,25 Q1430,20 1440,23 L1440,60 L1050,60 Q1045,55 1040,55 Q1035,55 1030,60 L630,60 Q625,50 620,50 Q615,50 610,60 L210,60 Q205,50 200,50 Q195,50 190,60 L0,60 Z"
          />
          {/* Stellar Accents (Glowing Stars) */}
          <circle cx="300" cy="30" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
          <circle cx="500" cy="20" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
          <circle cx="700" cy="20" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
          <circle cx="900" cy="20" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
          <circle cx="1100" cy="20" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
          <circle cx="1300" cy="20" r="2" fill={mode === "day" ? "white" : "#d1d5db"} filter="url(#starGlow)" />
        </svg>
      </motion.div>

      {/* Session Onboarding Modal */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-lg flex items-center justify-center z-50 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-xl shadow-2xl p-6 md:p-8 w-11/12 max-w-2xl relative overflow-hidden backdrop-blur-sm"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300 opacity-20"
                  style={{ left: `${20 + i * 15}%`, top: `${10 + i * 10}%` }}
                  variants={particleVariants}
                  animate="animate"
                  custom={i}
                >
                  <FaStar size={12} />
                </motion.div>
              ))}

              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Session On-boarding</h3>
                {onboardingStep === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "#4b5bd7" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSkipToPosture}
                    className="bg-indigo-700 text-white py-1 px-3 rounded-full shadow-md hover:bg-indigo-800 transition-all duration-300 text-sm absolute top-6 right-6"
                  >
                    Skip
                  </motion.button>
                )}
              </div>

              {onboardingStep === 0 ? (
                <>
                  <h4 className="text-lg md:text-xl font-serif font-semibold text-teal-200 text-center mb-5">
                    Embrace the Rules of Deep Work
                  </h4>
                  {deepWorkRules.length > 0 && currentRuleIndex < deepWorkRules.length && (
                    <motion.div
                      key={deepWorkRules[currentRuleIndex].number}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="flex justify-center mb-6"
                    >
                      <RuleCard
                        ruleNumber={deepWorkRules[currentRuleIndex].number}
                        description={deepWorkRules[currentRuleIndex].description}
                        icon={deepWorkRules[currentRuleIndex].icon}
                        transition={{ delay: 0.2 }}
                      />
                    </motion.div>
                  )}
                  <p className="text-teal-100 text-center text-sm mb-6">
                    Pause and absorb this guiding principle as you descend into a realm of focused productivity.
                  </p>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#4b5bd7" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleOnboardingNext}
                      className="bg-indigo-700 text-white py-2 px-6 mb-4 rounded-full shadow-md hover:bg-indigo-800 transition-all duration-300 text-sm"
                    >
                      {currentRuleIndex < deepWorkRules.length - 1 ? "Next Insight" : "Proceed to Webcam Setup"}
                    </motion.button>
                  </div>
                </>
              ) : onboardingStep === 1 ? (
                <>
                  <h4 className="text-lg md:text-xl font-serif font-semibold text-teal-200 text-center mb-5">
                    Webcam Focus Tracking
                  </h4>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-6 px-4"
                  >
                    <p className="text-teal-100 text-center text-sm mb-4">
                      DeepWork will be using your webcam to track live focus. Ensure you grant permission and your webcam is working properly.
                    </p>
                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOnboardingNext}
                        className="bg-indigo-700 text-white py-2 px-6 rounded-full shadow-md hover:bg-indigo-800 transition-all duration-300 text-sm"
                      >
                        Confirm Webcam Setup
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              ) : onboardingStep === 2 ? (
                <>
                  <h4 className="text-lg md:text-xl font-serif font-semibold text-teal-200 text-center mb-5">
                    Know the Dos & Don'ts
                  </h4>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-6 px-4 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent opacity-50"
                      animate={{
                        background: [
                          "linear-gradient(to bottom, rgba(79, 70, 229, 0.2), transparent)",
                          "linear-gradient(to bottom, transparent, rgba(79, 70, 229, 0.2))",
                        ],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice">
                        <path
                          d="M0,100 C150,50 300,150 450,100 C600,50 750,150 900,100 C1050,50 1200,150 1350,100 C1500,50 1440,150 1440,100 L1440,200 L0,200 Z"
                          fill="rgba(6, 78, 59, 0.1)"
                        />
                      </svg>
                    </motion.div>

                    <div className="flex justify-center space-x-4 mb-4 flex-wrap relative z-10">
                      {["1", "2", "3", "4"].map((num) => (
                        <motion.div
                          key={num}
                          className="relative flex-1 min-w-[22%]"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={`/dos/dos${num}.png`}
                            alt={`Do Posture ${num}`}
                            className="rounded-lg shadow-md border-2 border-teal-300 w-full h-auto max-w-[220px] transition-all duration-300 object-cover"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent rounded-lg flex items-center justify-center opacity-0 hover:opacity-80 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 0.8 }}
                          >
                            <span className="text-white text-xs font-semibold">Do {num}</span>
                          </motion.div>
                          <div className="absolute bottom-2 right-2 bg-teal-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-md">
                            Right
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-center space-x-4 flex-wrap relative z-10">
                      {["1", "2", "3", "4"].map((num) => (
                        <motion.div
                          key={num}
                          className="relative flex-1 min-w-[22%]"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={`/donts/donts${num}.png`}
                            alt={`Don't Posture ${num}`}
                            className="rounded-lg shadow-md border-2 border-red-300 w-full h-auto max-w-[220px] transition-all duration-300 object-cover"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent rounded-lg flex items-center justify-center opacity-0 hover:opacity-80 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 0.8 }}
                          >
                            <span className="text-white text-xs font-semibold">Don't {num}</span>
                          </motion.div>
                          <div className="absolute bottom-2 right-2 bg-red-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-md">
                            Wrong
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  <p className="text-teal-100 text-center text-sm mb-6">
                    Adopt the upright postures above to flow into your productive slumber. Avoid the incorrect postures to protect your focus and well-being.
                  </p>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#4b5bd7" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleOnboardingNext}
                      className="bg-indigo-700 text-white py-2 px-6 rounded-full shadow-md hover:bg-indigo-800 transition-all duration-300 text-sm"
                    >
                      Begin the Journey
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="text-teal-100 text-center text-sm">
                  Error: Invalid onboarding step. Please refresh the page.
                </div>
              )}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-teal-100 text-xs italic opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                "In the stillness of focus, greatness awakens."
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Confirmation Modal */}
      <AnimatePresence>
        {isSessionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center backdrop-blur-md justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-xl p-4 md:p-6 w-11/12 max-w-sm"
            >
              <h3 className="font-bold text-lg md:text-xl text-gray-800 text-center mb-3">Confirm Session</h3>
              <div className="space-y-1 text-gray-600 text-center text-xs">
                <p>
                  <span className="font-medium">Session Number:</span> <strong>{nextSessionNo}</strong>
                </p>
                <p>
                  <span className="font-medium">Total Duration:</span> {sessionConfig.totalMinutes} minutes
                </p>
                <p>
                  <span className="font-medium">Study:</span> {sessionConfig.studyDuration} min,{" "}
                  <span className="font-medium">Break:</span> {sessionConfig.breakDuration} min
                </p>
                <p>
                  <span className="font-medium">Total Segments:</span> {sessionConfig.totalSegments}
                </p>
                <p>
                  <span className="font-medium">Background Sound:</span>{" "}
                  {selectedSound
                    ? sounds.find((sound) => sound.value === selectedSound)?.label || "Unknown Sound"
                    : "No Sound"}
                </p>
                <p>
                  <span className="font-medium">Nudge:</span>{" "}
                  {sessionConfig.nudgeEnabled
                    ? `Enabled (${sessionConfig.nudgeType === "text" ? "Text Only" : "Text with Sound"})`
                    : "Disabled"}
                </p>
              </div>
              <div className="flex justify-between mt-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartSessionConfirmed}
                  className="bg-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-indigo-600 transition-all duration-300 w-full text-xs"
                >
                  Start Session
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSessionModalOpen(false)}
                  className="bg-gray-500 text-white py-1.5 px-3 rounded-lg shadow-sm hover:bg-gray-600 transition-all duration-300 w-full text-xs"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {isErrorModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-xl p-4 md:p-6 w-11/12 max-w-sm"
            >
              <h3 className="font-bold text-lg md:text-xl text-red-600 text-center mb-3">Error</h3>
              <p className="text-gray-600 text-center mb-3 text-xs">{errorMessage}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsErrorModalOpen(false)}
                className="bg-gray-600 text-white py-1.5 px-4 rounded-lg shadow-sm hover:bg-gray-700 transition-all duration-300 w-full text-xs"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExecutePage;
