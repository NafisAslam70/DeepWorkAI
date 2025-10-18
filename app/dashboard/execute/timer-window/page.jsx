"use client";
import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import useSound from "use-sound";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Rnd } from "react-rnd";
import NudgeComponent from "../nudgeSystem";
import { motion, AnimatePresence } from "framer-motion";
import { FaInfoCircle, FaPause, FaStop, FaBell, FaSun, FaMoon, FaCheckCircle, FaQuoteLeft } from "react-icons/fa";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000").replace(/\/$/, "");

// Custom Background Component for Nudge Alert Card
const TimerBackground = ({ mode }) => {
  const particleVariants = {
    animate: (i) => ({
      x: Math.cos(i) * 50,
      y: Math.sin(i) * 50,
      opacity: [0, 0.5, 0],
      scale: [0, 0.7, 0],
      transition: { duration: 5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div
        className={`absolute inset-0 ${
          mode === "night" ? "bg-gradient-to-br from-black/10 to-black/90" : "bg-gradient-to-br from-gray-100/50 to-blue-100/50"
        }`}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(79, 70, 229, ${mode === "night" ? "0.05" : "0.02"}) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, ${
            mode === "night" ? "0.05" : "0.02"
          }) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: mode === "night" ? 0.3 : 0.2,
          animation: "pulse-grid 20s ease-in-out infinite",
        }}
      />
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${mode === "night" ? "bg-indigo-300" : "bg-teal-200"}`}
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          variants={particleVariants}
          animate="animate"
          custom={i}
        />
      ))}
      <style jsx global>{`
        @keyframes pulse-grid {
          0%, 100% { opacity: ${mode === "night" ? 0.2 : 0.1}; }
          50% { opacity: ${mode === "night" ? 0.4 : 0.2}; }
        }
      `}</style>
    </div>
  );
};

function TimerWindow() {
  const webcamRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const studyDuration = 45;
  const breakDuration = parseInt(searchParams.get("break")) || 15;
  const totalSegments = parseInt(searchParams.get("segments")) || 1;
  const totalStudyPeriods = totalSegments * 2 - 1;
  const soundUrl = searchParams.get("sound") || "";
  const projectId = searchParams.get("projectId") || "";
  const projectName = searchParams.get("goalName") || "";
  const sessionNo = searchParams.get("sessionNo") || "-";
  const initialNudgeEnabled = searchParams.get("nudgeEnabled") === "true";
  const initialNudgeType = searchParams.get("nudgeType") || "text";

  const [showPauseInfo, setShowPauseInfo] = useState(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(studyDuration * 60);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [currentStudySegment, setCurrentStudySegment] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playEndSound] = useSound("/sounds/end-sound.mp3");
  const [playBackgroundSound, { stop }] = useSound(soundUrl, { loop: true });
  const [focusStatus, setFocusStatus] = useState("Waiting...");
  const [statusReason, setStatusReason] = useState("");
  const [currentFocusLevel, setCurrentFocusLevel] = useState(0);
  const [focusLog, setFocusLog] = useState([]);
  const [nudgeLog, setNudgeLog] = useState([]);
  const last30Ref = useRef([]);
  const overrideMessageRef = useRef("");
  const overrideMessageTimeRef = useRef(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [distractedSeconds, setDistractedSeconds] = useState(0);
  const [summaryMsg, setSummaryMsg] = useState("-");
  const [finalStatus, setFinalStatus] = useState("Waiting...");
  const [finalReason, setFinalReason] = useState("-");
  const [isProcessing, setIsProcessing] = useState(false);
  const tickRef = useRef(null);
  const [localNudgeEnabled, setLocalNudgeEnabled] = useState(initialNudgeEnabled);
  const [localNudgeType, setLocalNudgeType] = useState(initialNudgeType);
  const [mode, setMode] = useState("night");
  const consecutiveLowFocusRef = useRef(0);
  const consecutiveFocusedRef = useRef(0);
  const consecutiveFaceNotVisibleRef = useRef(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFocusBarsHovered, setIsFocusBarsHovered] = useState(false);
  const [isAbsentMode, setIsAbsentMode] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const staticMessages = [
    "Keep phone away for focus",
    "Stay present during work",
    "Ensure your face is visible — attention is the key for great work",
  ];

  const motivationalQuotes = [
    "The successful warrior is the average man, with laser-like focus. – Bruce Lee",
    "Deep work is the ability to focus without distraction on a cognitively demanding task. – Cal Newport",
    "Focus is the art of saying no to distractions. – Anonymous",
    "Your focus determines your reality. – George Lucas",
    "In the midst of chaos, there is also opportunity for focus. – Sun Tzu",
  ];

  const focusLevelDescriptions = {
    0: "Absent: No one detected in frame",
    2: "Phone: Phone usage detected",
    6: "Likely Distracted: Drowsy, looking away, or bad posture",
    7: "Face Not Visible: Full face not in frame",
    9: "Ignore, Slight deviation from posture",
    10: "Focused: Optimal focus detected",
  };

  useEffect(() => {
    console.log("TimerWindow mounted with params:", {
      studyDuration,
      breakDuration,
      totalSegments,
      totalStudyPeriods,
      soundUrl,
      nudgeEnabled: localNudgeEnabled,
      nudgeType: localNudgeType,
      projectId,
      projectName,
      sessionNo,
    });

    if (soundUrl && !isBreakTime) playBackgroundSound();
    return () => stop();
  }, [playBackgroundSound, soundUrl, stop, isBreakTime]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("themeMode") || "night";
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

  useEffect(() => {
    if (isBreakTime || isPaused) return;
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % staticMessages.length);
    }, 5000);
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000);
    return () => {
      clearInterval(messageInterval);
      clearInterval(quoteInterval);
    };
  }, [isBreakTime, isPaused]);

  const toggleMode = () => {
    setMode((prev) => (prev === "night" ? "day" : "night"));
  };

  const mapReasonToCategory = (reason) => {
    if (!reason) return null;
    if (reason === "Absent") return "Absent";
    if (reason === "Phone") return "Phone";
    if (reason === "Likely Distraction: Full face not visible") return "NotVisible";
    if (reason === "Likely distraction: drowsy/lookingaway/badposture") return "Likely";
    return null;
  };

  const getDisplayMessage = () => {
    if (focusLog.length === 0) {
      return `⏳ Waiting for focus status...`;
    }
    const latestLog = focusLog[focusLog.length - 1];
    if (latestLog.focusState === "Focused") {
      return "✅ You're maintaining great focus, keep it up!";
    }
    if (
      latestLog.reason === "Absent" &&
      focusLog.slice(-4).length >= 4 &&
      focusLog.slice(-4).every((log) => log.reason === "Likely Distraction: Full face not visible" || log.reason === "Absent")
    ) {
      return "😕 Likely Distracted — Your face may not be in frame. Please adjust the camera!";
    }
    if (latestLog.reason === "Absent") {
      return "😕 Strictly Distracted — You seem to be absent. Please return.";
    }
    if (latestLog.reason === "Phone") {
      return "😕 Strictly Distracted — Phone detected. Kindly put it aside to focus.";
    }
    if (latestLog.reason === "Likely Distraction: Full face not visible") {
      return "😕 Likely Distracted — Your face may not be in frame. Please adjust the camera!";
    }
    if (latestLog.reason === "Likely distraction: drowsy/lookingaway/badposture") {
      return "😴 Likely distraction: You seem drowsy, looking away, or have bad posture. Adjust to refocus!";
    }
    return "😕 Please ensure you're in the right posture!";
  };

  const getLiveStatusMessage = () => {
    if (last30Ref.current.length === 0) {
      return `⏳ Waiting for live status...`;
    }
    return `${focusStatus} ${statusReason !== "-" ? `(${statusReason})` : ""}`;
  };

  const sendWebcamFrame = async () => {
    if (!webcamRef.current || isBreakTime || isPaused) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      console.warn("No screenshot captured from webcam");
      return;
    }

    const blob = await fetch(screenshot).then((res) => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "webcam.jpg");

    try {
      const res = await axios.post(`${API_BASE_URL}/deepwork_focus`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { focusState, reason, focusLevel, override_message } = res.data;
      console.log("API Response:", { focusState, reason, focusLevel, override_message });

      if (!focusState || !["Focused", "Distracted"].includes(focusState)) {
        console.warn("Invalid focusState received:", focusState);
        return;
      }

      setFocusStatus(focusState);
      setStatusReason(reason || "-");
      setCurrentFocusLevel(focusLevel || 0);

      if (override_message) {
        overrideMessageRef.current = override_message;
        overrideMessageTimeRef.current = Date.now();
      }

      last30Ref.current.push({
        focusState,
        reason: mapReasonToCategory(reason),
        originalReason: reason || "-",
        focusLevel: focusLevel || 0,
        timestamp: new Date().toISOString(),
      });

      if (last30Ref.current.length > 15) last30Ref.current.shift();
    } catch (err) {
      console.error("❌ API Error:", err.message);
      last30Ref.current.push({
        focusState: "Distracted",
        reason: "Inactive Focus Model",
        originalReason: "Inactive Focus Model",
        focusLevel: 0,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const summarize15Seconds = () => {
    const window = last30Ref.current;
    if (window.length < 15) return;

    const focusCount = window.filter((x) => x.focusState === "Focused").length;
    const phoneCount = window.filter((x) => x.reason === "Phone").length;
    const absentCount = window.filter((x) => x.reason === "Absent").length;
    const faceNotVisibleCount = window.filter((x) => x.reason === "NotVisible").length;
    const likelyCount = window.filter((x) => x.reason === "Likely").length;

    let focusState = "Focused";
    let reason = null;
    let finalFocusLevel = 10;
    let isFaceNotVisibleTransition = false;

    const isFaceNotVisibleFor45Seconds = focusLog.slice(-3).length >= 3 && focusLog.slice(-3).every(
      (log) => log.reason === "Likely Distraction: Full face not visible"
    );

    if (phoneCount >= 3) {
      focusState = "Distracted";
      reason = "Phone";
      finalFocusLevel = 2;
      consecutiveFaceNotVisibleRef.current = 0;
      setIsAbsentMode(false);
    } else if (
      isAbsentMode ||
      (faceNotVisibleCount >= 6 && isFaceNotVisibleFor45Seconds) ||
      absentCount >= 4
    ) {
      focusState = "Distracted";
      reason = "Absent";
      finalFocusLevel = 0;
      consecutiveFaceNotVisibleRef.current = 0;
      if (faceNotVisibleCount >= 6 && isFaceNotVisibleFor45Seconds) {
        setIsAbsentMode(true);
        isFaceNotVisibleTransition = true;
      }
    } else if (faceNotVisibleCount >= 6) {
      focusState = "Distracted";
      reason = "Likely Distraction: Full face not visible";
      finalFocusLevel = 7;
      consecutiveFaceNotVisibleRef.current += 1;
    } else if (likelyCount >= 8) {
      focusState = "Distracted";
      reason = "Likely distraction: drowsy/lookingaway/badposture";
      finalFocusLevel = 6;
      consecutiveFaceNotVisibleRef.current = 0;
      setIsAbsentMode(false);
    } else {
      consecutiveFaceNotVisibleRef.current = 0;
      setIsAbsentMode(false);
    }

    if (focusState === "Focused") {
      consecutiveFocusedRef.current += 1;
      consecutiveLowFocusRef.current = 0;
      consecutiveFaceNotVisibleRef.current = 0;
      setIsAbsentMode(false);
    } else {
      consecutiveFocusedRef.current = 0;
      consecutiveLowFocusRef.current += 1;
    }

    const summary = {
      timestamp: new Date().toISOString(),
      focusState,
      reason,
      focusLevel: finalFocusLevel,
      isFaceNotVisibleTransition,
      details: window.map(({ focusState, originalReason, focusLevel, timestamp }) => ({
        focusState,
        reason: originalReason || "-",
        focusLevel,
        timestamp,
      })),
    };

    console.log("Summarize 15s:", {
      focusState,
      reason,
      focusLevel: finalFocusLevel,
      focusCount,
      phoneCount,
      absentCount,
      faceNotVisibleCount,
      likelyCount,
      isAbsentMode,
      isFaceNotVisibleTransition,
      detailsReasons: summary.details.map((d) => d.reason),
      consecutiveFaceNotVisible: consecutiveFaceNotVisibleRef.current,
    });

    setFocusLog((prev) => [...prev, summary]);
    last30Ref.current = [];

    setFinalStatus(focusState === "Focused" ? "FOCUSED ✅" : `DISTRACTED ❌ — ${isFaceNotVisibleTransition ? "Likely Distraction: Full face not visible" : reason || "-"}`);
    setFinalReason(isFaceNotVisibleTransition ? "Likely Distraction: Full face not visible" : reason || "-");
    setSummaryMsg(
      `🧮 Last 15s → ${focusState} (${focusCount}/15 Focused) | Phone: ${phoneCount} | Absent: ${absentCount} | FaceNotVisible: ${faceNotVisibleCount} | Likely: ${likelyCount}`
    );

    if (focusState === "Focused") {
      setFocusSeconds((prev) => prev + 15);
    } else {
      setDistractedSeconds((prev) => prev + 15);
    }
  };

  const handleNudgeInteraction = (interaction) => {
    setNudgeLog((prev) => [...prev, interaction]);
  };

  const handleNudgeDisable = () => {
    setLocalNudgeEnabled(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("nudgeEnabled", "false");
    router.push(`${pathname}?${params.toString()}`);
    setNudgeLog((prev) => [
      ...prev,
      { type: "disabled_via_alert", timestamp: new Date().toISOString() },
    ]);
  };

  const handleSessionEnd = async (terminationReason = "Manual stop") => {
    setIsProcessing(true);
    stop();
    if (last30Ref.current.length > 0) summarize15Seconds();

    const startTime = new Date();
    const focused = focusLog.filter((log) => log.focusState === "Focused").length;
    const distracted = focusLog.length - focused;
    const totalFocusLevel = focusLog.reduce((sum, log) => sum + (log.focusLevel || 0), 0);
    const averageFocusLevel = focusLog.length ? Math.round(totalFocusLevel / focusLog.length) : 0;

    const sessionSummary = {
      projectId: parseInt(projectId),
      projectName,
      sessionNo,
      startTime: startTime.toISOString(),
      total_focus_time: focusSeconds,
      total_distracted_time: distractedSeconds,
      focus_percentage: focusLog.length ? Math.round((focused / focusLog.length) * 100) : 0,
      average_focus_level: averageFocusLevel,
      distraction_breakdown: {
        phone: focusLog.filter((log) => log.reason === "Phone").length * 15,
        absent: focusLog.filter((log) => log.reason === "Absent").length * 15,
        likely:
          focusLog.filter(
            (log) =>
              log.reason === "Likely Distraction: Full face not visible" ||
              log.reason === "Likely distraction: drowsy/lookingaway/badposture"
          ).length * 15,
      },
      focus_trend: focusLog.map((log) => (log.focusState === "Focused" ? 100 : 0)),
      nudge_interactions: nudgeLog,
      termination_reason: terminationReason,
    };

    console.log("Session Summary:", sessionSummary);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const queryParams = new URLSearchParams({
      focusSummary: JSON.stringify(sessionSummary),
      projectId,
      sessionNo,
      projectName,
    }).toString();

    window.location.href = `/dashboard/execute/session-summary?${queryParams}`;
  };

  const handlePauseSession = () => {
    setIsPaused((prev) => !prev);
    setShowPauseInfo(true);
  };

  const handleNudgeToggle = () => {
    setLocalNudgeEnabled((prev) => {
      const newState = !prev;
      const params = new URLSearchParams(searchParams.toString());
      params.set("nudgeEnabled", newState.toString());
      router.push(`${pathname}?${params.toString()}`);
      setNudgeLog((prev) => [
        ...prev,
        { type: "toggled", enabled: newState, timestamp: new Date().toISOString() },
      ]);
      return newState;
    });
  };

  const handleNudgeTypeChange = (type) => {
    setLocalNudgeType(type);
    const params = new URLSearchParams(searchParams.toString());
    params.set("nudgeType", type);
    router.push(`${pathname}?${params.toString()}`);
    setNudgeLog((prev) => [
      ...prev,
      { type: "type_changed", nudgeType: type, timestamp: new Date().toISOString() },
    ]);
  };

  // Fake Positive Nudge Trigger
  const triggerPositiveNudge = () => {
    const mockSummary = {
      timestamp: new Date().toISOString(),
      focusState: "Focused",
      reason: "Focused",
      focusLevel: 10,
      isFaceNotVisibleTransition: false,
      details: Array(15).fill().map(() => ({
        focusState: "Focused",
        reason: "Focused",
        focusLevel: 10,
        timestamp: new Date().toISOString(),
      })),
    };
    setFocusLog((prev) => {
      // Simulate 80 Focused cycles (20min)
      const newLog = [...prev, ...Array(80).fill(mockSummary)];
      return newLog;
    });
    console.log("Triggered fake positive nudge");
  };

  useEffect(() => {
    if (isPaused) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    let lastTime = Date.now();
    tickRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastTime >= 1000) {
        lastTime = now;
        sendWebcamFrame();
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            const isLastStudy = currentStudySegment === totalStudyPeriods;
            if (!isBreakTime && !isLastStudy) {
              setIsBreakTime(true);
              setPhaseIndex((prev) => prev + 1);
              setTimeRemaining(breakDuration * 60);
              stop();
              return breakDuration * 60;
            } else if (isBreakTime) {
              setIsBreakTime(false);
              setCurrentStudySegment((prev) => prev + 1);
              setPhaseIndex((prev) => prev + 1);
              setTimeRemaining(studyDuration * 60);
              if (soundUrl) playBackgroundSound();
              return studyDuration * 60;
            } else {
              clearInterval(tickRef.current);
              playEndSound();
              handleSessionEnd("Session completed");
              return 0;
            }
          }
          if ((prev - 1) % 15 === 0) summarize15Seconds();
          return prev - 1;
        });
      }
    }, 200);

    return () => clearInterval(tickRef.current);
  }, [isPaused, isBreakTime, currentStudySegment, totalStudyPeriods, soundUrl, playBackgroundSound, playEndSound, stop]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const glowVariants = {
    animate: {
      boxShadow: [
        `0 0 6px rgba(79, 70, 229, ${mode === "night" ? 0.4 : 0.6})`,
        `0 0 12px rgba(79, 70, 229, ${mode === "night" ? 0.7 : 0.8})`,
        `0 0 6px rgba(79, 70, 229, ${mode === "night" ? 0.4 : 0.6})`,
      ],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div
      className={`w-screen h-screen ${mode === "night" ? "bg-black" : "bg-gray-200"} text-${mode === "night" ? "gray-100" : "text-gray-800"} relative overflow-hidden`}
    >
      <TimerBackground mode={mode} />

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2"
      >
        <motion.div
          className={`w-12 h-6 rounded-full ${mode === "night" ? "bg-gray-600" : "bg-teal-500"} flex items-center p-1 cursor-pointer`}
          onClick={toggleMode}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="w-4 h-4 bg-white rounded-full flex items-center justify-center"
            animate={{ x: mode === "night" ? 0 : 24 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-xs">{mode === "night" ? <FaMoon /> : <FaSun />}</span>
          </motion.div>
        </motion.div>
        <span className="text-xs">{mode === "night" ? "Night" : "Day"} Mode</span>
      </motion.div>

      {/* Fake Positive Nudge Trigger Dot */}
      <motion.div
        className={`fixed bottom-4 left-60 w-3 h-3 rounded-full ${mode === "night" ? "bg-teal-400" : "bg-teal-500"} z-[60] cursor-pointer`}
        whileHover={{ scale: 1.5, backgroundColor: mode === "night" ? "#34d399" : "#10b981" }}
        onClick={triggerPositiveNudge}
        title="Trigger Positive Nudge (Demo)"
      />

      {/* Enhanced Webcam Feed */}
      <div className="relative w-full h-full z-0">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
          className="w-full h-full object-cover rounded-2xl filter brightness-110"
        />
        <div
          className={`absolute inset-0 ${
            mode === "night"
              ? "bg-gradient-to-br from-teal-700/5 via-indigo-700/10 to-transparent"
              : "bg-gradient-to-br from-blue-200/5 via-teal-200/10 to-transparent"
          } z-1`}
        />
        <div
          className={`absolute inset-0 border-2 ${
            mode === "night" ? "border-gray-800/30" : "border-gray-300/30"
          } rounded-2xl z-1 shadow-[inset_0_0_5px_rgba(0,0,0,0.1)]`}
        />
      </div>

      {/* Focus Alert Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`fixed top-4 right-4 z-[60] ${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-4 rounded-xl shadow-xl border border-white/10 flex flex-col gap-3 max-w-xs`}
      >
        <div
          className="relative group flex items-center gap-2"
          onMouseEnter={() => {
            console.log("Hover detected on focus level bars");
            setIsFocusBarsHovered(true);
          }}
          onMouseLeave={() => setIsFocusBarsHovered(false)}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className={`w-4 h-8 rounded-sm ${i < currentFocusLevel ? (mode === "night" ? "bg-teal-400" : "bg-teal-500") : mode === "night" ? "bg-gray-600" : "bg-gray-300"}`}
              animate={{ scale: i < currentFocusLevel ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
          <span className={`text-sm ${mode === "night" ? "text-teal-400" : "text-teal-600"}`}>Focus: {currentFocusLevel}/10</span>
          <AnimatePresence>
            {isFocusBarsHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={`text-sm ${mode === "night" ? "text-green-400" : "text-green-600"}`}
              >
                <FaCheckCircle />
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className={`absolute invisible group-hover:visible ${mode === "night" ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-3 rounded-lg shadow-lg border ${
              mode === "night" ? "border-white/10" : "border-gray-200"
            } top-12 right-0 w-64 z-[100]`}
          >
            <p className="font-semibold mb-2">Focus Level Descriptions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {Object.entries(focusLevelDescriptions).map(([level, desc]) => (
                <li key={level}>Level {level}: {desc}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`${mode === "night" ? "bg-black/30" : "bg-gray-100/50"} p-2 rounded-lg text-xs text-center ${mode === "night" ? "text-gray-200" : "text-gray-700"}`}>
          <p className={`${mode === "night" ? "text-yellow-400" : "text-yellow-600"}`}>🌟 Last 15s Status</p>
          <p>{getDisplayMessage()}</p>
        </div>
        <div className={`${mode === "night" ? "bg-black/30" : "bg-gray-100/50"} p-2 rounded-lg text-xs text-center`}>
          <motion.span
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`${mode === "night" ? "text-teal-300" : "text-teal-500"}`}
          >
            {staticMessages[currentMessageIndex]}
          </motion.span>
        </div>
      </motion.div>

      {/* Nudge Alert Card */}
      <Rnd default={{ x: 40, y: window.innerHeight / 2 - 210, width: 280, height: "auto" }} minWidth={220} bounds="window" enableResizing={{ bottomRight: true, right: true, bottom: true }} style={{ zIndex: 50 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`w-full ${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden`}
        >
          <div className={`p-4 ${mode === "night" ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50" : "bg-gradient-to-r from-blue-100/50 to-teal-100/50"} border-b border-white/20`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}>
                <FaBell /> Nudge Alert Card
              </h3>
              <motion.div
                className={`w-12 h-6 rounded-full ${localNudgeEnabled ? (mode === "night" ? "bg-teal-500" : "bg-teal-600") : mode === "night" ? "bg-gray-600" : "bg-gray-300"} flex items-center p-1 cursor-pointer`}
                onClick={handleNudgeToggle}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: localNudgeEnabled ? 24 : 0 }} transition={{ type: "spring", stiffness: 300 }} />
              </motion.div>
            </div>
            {localNudgeEnabled && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <label className={`text-xs ${mode === "night" ? "text-gray-300" : "text-gray-600"}`}>Nudge Type:</label>
                <select
                  value={localNudgeType}
                  onChange={(e) => handleNudgeTypeChange(e.target.value)}
                  className={`w-full text-xs ${mode === "night" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"} rounded-lg p-1.5 mt-1 focus:outline-none focus:ring-2 ${mode === "night" ? "focus:ring-teal-500" : "focus:ring-teal-600"}`}
                >
                  <option value="text">Text</option>
                  <option value="text_with_sound">✓ Text + Sound</option>
                </select>
              </motion.div>
            )}
          </div>
          <div className="p-4">
            <CircularProgressbar
              value={(timeRemaining / ((isBreakTime ? breakDuration : studyDuration) * 60)) * 100}
              text={formatTime(timeRemaining)}
              styles={buildStyles({
                pathColor: isBreakTime ? "#ef4444" : "#22c55e",
                trailColor: mode === "night" ? "#374151" : "#e5e7eb",
                textColor: mode === "night" ? "#ffffff" : "#1f2937",
                textSize: "18px",
              })}
            />
            <p className={`text-center text-sm mt-2 ${mode === "night" ? "text-teal-300" : "text-teal-600"}`}>
              {isBreakTime ? `Break (Segment ${currentStudySegment} of ${totalStudyPeriods})` : `Study ${currentStudySegment} of ${totalStudyPeriods}`}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={glowVariants}
                animate="animate"
                onClick={() => setShowStopConfirmation(true)}
                className={`px-4 py-2 ${mode === "night" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} rounded-lg text-white shadow-md`}
              >
                <FaStop className="inline mr-1" /> Stop
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={glowVariants}
                animate="animate"
                onClick={handlePauseSession}
                className={`px-4 py-2 ${mode === "night" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} rounded-lg text-white shadow-md`}
              >
                <FaPause className="inline mr-1" /> {isPaused ? "Resume" : "Pause"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Rnd>

      {/* DeepLens Engine Card */}
      <Rnd
        default={{ x: window.innerWidth * 0.78, y: window.innerHeight * 0.58, width: 300, height: "auto" }}
        minWidth={220}
        bounds="window"
        enableResizing={{ bottomRight: true, right: true, bottom: true }}
        style={{ zIndex: 50 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className={`w-full ${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-4 rounded-xl shadow-xl border border-white/10 space-y-3`}
        >
          <h3 className={`text-sm font-semibold text-center ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}>🧠 DeepLens Engine Card</h3>
          <div className={`${mode === "night" ? "bg-black/30" : "bg-gray-100/50"} p-2 rounded-lg text-xs text-center space-y-2`}>
            <p className={`${mode === "night" ? "text-yellow-400" : "text-yellow-600"}`}>🌟 Live Status</p>
            <p className={`${mode === "night" ? "text-white" : "text-gray-800"}`}>{focusStatus} {statusReason !== "-" && `(${statusReason})`}</p>
            <p className={`${mode === "night" ? "text-teal-300" : "text-teal-600"}`}>Focus Level: {currentFocusLevel}/10</p>
            <p className={`text-left ${mode === "night" ? "text-green-300" : "text-green-600"}`}>{summaryMsg}</p>
            <div className="flex gap-1 flex-wrap">
              {last30Ref.current.map((log, idx) => {
                console.log(`Live Status Log[${idx}]:`, {
                  focusState: log.focusState,
                  reason: log.reason,
                  originalReason: log.originalReason,
                  mappedReason: mapReasonToCategory(log.originalReason),
                });
                const isLikelyDistraction =
                  log.reason === "NotVisible" ||
                  log.reason === "Likely" ||
                  log.originalReason?.includes("Likely Distraction") ||
                  log.originalReason?.includes("drowsy/lookingaway/badposture");
                return (
                  <motion.div
                    key={idx}
                    className={`w-3 h-3 rounded-sm relative group cursor-pointer ${
                      log.focusState === "Focused"
                        ? mode === "night"
                          ? "bg-teal-400"
                          : "bg-teal-500"
                        : isLikelyDistraction
                        ? "bg-green-800"
                        : mode === "night"
                        ? "bg-red-400"
                        : "bg-red-500"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  >
                    <div
                      className={`absolute invisible group-hover:visible ${mode === "night" ? "bg-black/80 text-white" : "bg-gray-800 text-gray-100"} text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg border border-white/10 z-50`}
                    >
                      {log.focusState === "Focused" ? "Focused" : `Distracted: ${log.originalReason}`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className={`${mode === "night" ? "text-gray-300" : "text-gray-600"}`}>📊 Last 5 min:</p>
            <div className="flex gap-1 flex-wrap">
              {focusLog.slice(-10).map((log, idx) => {
                console.log(`Last 5 Min Log[${idx}]:`, {
                  focusState: log.focusState,
                  reason: log.reason,
                  isFaceNotVisibleTransition: log.isFaceNotVisibleTransition,
                  detailsLength: log.details?.length || 0,
                  detailsReasons: log.details?.map((d) => d.reason) || [],
                });
                const isLikelyDistraction =
                  log.reason === "Likely distraction: drowsy/lookingaway/badposture" ||
                  (log.reason === "Likely Distraction: Full face not visible" && !log.isFaceNotVisibleTransition);
                const count = log.details?.filter(
                  (detail) => (log.focusState === "Focused" && detail.focusState === "Focused") || (log.focusState === "Distracted" && detail.reason === (log.isFaceNotVisibleTransition ? "Likely Distraction: Full face not visible" : log.reason))
                ).length || 0;
                return (
                  <motion.div
                    key={idx}
                    className={`w-3 h-3 rounded-sm relative group cursor-pointer ${
                      log.focusState === "Focused"
                        ? mode === "night"
                          ? "bg-teal-400"
                          : "bg-teal-500"
                        : isLikelyDistraction
                        ? "bg-green-800"
                        : mode === "night"
                        ? "bg-red-400"
                        : "bg-red-500"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  >
                    <div
                      className={`absolute invisible group-hover:visible ${mode === "night" ? "bg-black/80 text-white" : "bg-gray-800 text-gray-100"} text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg border border-white/10 z-50`}
                    >
                      {log.focusState === "Focused" ? `Focused (${count}/15)` : `Distracted: ${log.isFaceNotVisibleTransition ? "Likely Distraction: Full face not visible" : log.reason || "Unknown"} (${count}/15)`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className={`${mode === "night" ? "text-gray-300" : "text-gray-600"}`}>⏱ Focused: ${focusSeconds}s</p>
            <p className={`${mode === "night" ? "text-gray-300" : "text-gray-600"}`}>⏱ Distracted: ${distractedSeconds}s</p>
            {Date.now() - overrideMessageTimeRef.current < 10000 && (
              <p className={`italic ${mode === "night" ? "text-indigo-300" : "text-indigo-600"}`}>{overrideMessageRef.current}</p>
            )}
            <p className={`text-center ${mode === "night" ? "text-yellow-400" : "text-yellow-600"}`}>🌟 Stay present. Stay powerful.</p>
          </div>
        </motion.div>
      </Rnd>

      {/* Motivational Focus Quote Widget */}
      <Rnd
        default={{ x: window.innerWidth * 0.4, y: window.innerHeight * 0.8, width: 250, height: "auto" }}
        minWidth={200}
        bounds="window"
        enableResizing={{ bottomRight: true, right: true, bottom: true }}
        style={{ zIndex: 50 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className={`w-full ${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-4 rounded-xl shadow-xl border border-white/10`}
        >
          <h3 className={`text-sm font-semibold text-center ${mode === "night" ? "text-teal-200" : "text-teal-600"} flex items-center justify-center gap-2`}>
            <FaQuoteLeft /> Focus Inspiration
          </h3>
          <motion.p
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className={`text-xs italic text-center mt-2 ${mode === "night" ? "text-gray-300" : "text-gray-600"}`}
          >
            {motivationalQuotes[currentQuoteIndex]}
          </motion.p>
        </motion.div>
      </Rnd>

      {/* Break Overlay */}
      <AnimatePresence>
        {isBreakTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${mode === "night" ? "bg-black/70" : "bg-gray-200/70"} flex items-center justify-center z-[70]`}
          >
            <motion.div
              className={`${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-6 rounded-xl text-center ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <h2 className="text-2xl font-bold mb-2">Break Time</h2>
              <p className="text-lg">Enjoy and recover ({formatTime(timeRemaining)})</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Info Modal */}
      <AnimatePresence>
        {showPauseInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 flex items-center justify-center z-[80] ${mode === "night" ? "bg-black/70" : "bg-gray-200/70"} backdrop-blur-md`}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-6 rounded-xl shadow-xl border border-white/10 max-w-md ${
                mode === "night" ? "text-white" : "text-gray-800"
              }`}
            >
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}>
                <FaInfoCircle /> Pause Information
              </h2>
              <p className="text-sm mb-2">Deep Work doesn’t encourage pausing as it disrupts your flow.</p>
              <p className="text-sm mb-2 font-semibold">For Emergencies:</p>
              <p className="text-sm mb-2">Return within 2 minutes to keep the session active, or stop and start a new session later.</p>
              <p className="text-sm mb-2 font-semibold">Note:</p>
              <ul className="text-sm list-disc list-inside mb-4">
                <li className={`${mode === "night" ? "text-red-400" : "text-red-500"}`}>Absence for over 2 minutes ends the session.</li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPauseInfo(false)}
                className={`w-full px-4 py-2 ${mode === "night" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} rounded-lg text-white shadow-md`}
              >
                Got It
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stop Confirmation Modal */}
      <AnimatePresence>
        {showStopConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 flex items-center justify-center z-[80] ${mode === "night" ? "bg-black/70" : "bg-gray-200/70"} backdrop-blur-md`}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-6 rounded-xl shadow-xl border border-white/10 max-w-md ${
                mode === "night" ? "text-white" : "text-gray-800"
              }`}
            >
              <h2 className={`text-lg font-bold mb-4 text-center ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}>Confirm Stop Session</h2>
              <p className="text-sm mb-4 text-center">Are you sure you want to stop? This cannot be undone.</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    setIsStopping(true);
                    await handleSessionEnd("Manual stop");
                    setShowStopConfirmation(false);
                    setIsStopping(false);
                  }}
                  className={`px-4 py-2 ${mode === "night" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} rounded-lg text-white shadow-md flex items-center gap-2`}
                  disabled={isStopping}
                >
                  {isStopping && <div className={`w-4 h-4 border-2 ${mode === "night" ? "border-white" : "border-gray-800"} border-t-transparent rounded-full animate-spin`} />}
                  {isStopping ? "Stopping..." : "Yes, Stop"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStopConfirmation(false)}
                  className={`px-4 py-2 ${mode === "night" ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-500 hover:bg-gray-600"} rounded-lg text-white shadow-md`}
                  disabled={isStopping}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-[70] flex flex-col items-center ${mode === "night" ? "bg-white/10" : "bg-white/70"} backdrop-blur-lg p-4 rounded-xl`}
          >
            <div className={`w-8 h-8 border-4 ${mode === "night" ? "border-indigo-500" : "border-indigo-600"} border-t-transparent rounded-full animate-spin`} />
            <p className={`mt-2 text-xs ${mode === "night" ? "text-teal-200" : "text-teal-600"}`}>Processing...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <NudgeComponent
        focusLog={focusLog}
        isBreak={isBreakTime}
        nudgeEnabled={localNudgeEnabled}
        nudgeType={localNudgeType}
        onNudgeInteraction={handleNudgeInteraction}
        onSessionTerminate={handleSessionEnd}
        onNudgeDisable={handleNudgeDisable}
        consecutiveFaceNotVisible={consecutiveFaceNotVisibleRef.current}
      />
    </div>
  );
}

export default TimerWindow;
