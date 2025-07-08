import React, { useState, useEffect, useRef } from "react";
import useSound from "use-sound";
import { motion, AnimatePresence } from "framer-motion";

const ENABLE_SPEECH = true;

const NudgeComponent = ({
  focusLog,
  isBreak,
  nudgeEnabled,
  nudgeType,
  onNudgeInteraction,
  onSessionTerminate,
  onNudgeDisable,
  consecutiveFaceNotVisible,
}) => {
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDisabled, setNudgeDisabled] = useState(false);
  const [absenceCount, setAbsenceCount] = useState(0);
  const [phoneCount, setPhoneCount] = useState(0);
  const [faceNotVisibleCount, setFaceNotVisibleCount] = useState(0);
  const [focusedCount, setFocusedCount] = useState(0);
  const [isPositiveNudge, setIsPositiveNudge] = useState(false);
  const [positiveFocusThreshold] = useState(15); // 20 minutes in seconds (configurable)
  const [playNudgeSound] = useSound("/sounds/nudge-chime.mp3", { volume: 0.5 });
  const [playCongratsSound] = useSound("/sounds/win1.mp3", { volume: 0.5 });
  const [playEndSound] = useSound("/sounds/end-sound.mp3", { volume: 0.5 });

  const speakMessage = (message) => {
    if (ENABLE_SPEECH) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0.8;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const prevLogRef = useRef(null);

  useEffect(() => {
    if (nudgeEnabled && nudgeDisabled) {
      setNudgeDisabled(false);
      setPhoneCount(0);
      setAbsenceCount(0);
      setFaceNotVisibleCount(0);
      setFocusedCount(0);
      setNudgeMessage("");
      setShowNudge(false);
      setIsPositiveNudge(false);
    }

    if (!nudgeEnabled || nudgeDisabled || isBreak || !focusLog.length) {
      if (phoneCount > 0 || absenceCount > 0 || faceNotVisibleCount > 0 || focusedCount > 0) {
        setPhoneCount(0);
        setAbsenceCount(0);
        setFaceNotVisibleCount(0);
        setFocusedCount(0);
      }
      setNudgeMessage("");
      setShowNudge(false);
      setIsPositiveNudge(false);
      return;
    }

    const latestLog = focusLog[focusLog.length - 1];
    const reason = latestLog.reason;

    // Check if in absent mode: last 4 logs are face not visible or Absent
    const isAbsentMode = focusLog.slice(-4).length >= 4 && focusLog.slice(-4).every(
      (log) => log.reason === "Likely Distraction: Full face not visible" || log.reason === "Absent"
    );

    console.log("NudgeComponent Log:", {
      reason,
      consecutiveFaceNotVisible,
      faceNotVisibleCount,
      phoneCount,
      absenceCount,
      focusedCount,
      isAbsentMode,
      detailsReasons: latestLog.details?.map((d) => d.reason) || [],
    });

    if (prevLogRef.current && prevLogRef.current.timestamp === latestLog.timestamp) {
      console.log("Same log entry, skipping...");
      return;
    }
    prevLogRef.current = latestLog;

    // Positive Focus Handling
    if (reason === "Focused") {
      setFocusedCount((prev) => {
        const newCount = prev + 1;
        console.log(`Focused count: ${newCount}`);
        return newCount;
      });
      setPhoneCount(0);
      setAbsenceCount(0);
      setFaceNotVisibleCount(0);

      // Check if reached positive focus threshold (20 min = 80 cycles of 15s)
      if (focusedCount === Math.floor(positiveFocusThreshold / 15)) {
        const message = "Hey Nafis, that's so great you've maintained 20 minutes of deep focus, keep it up!";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(true);
        if (nudgeType === "text_with_sound") {
          playCongratsSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown_positive", message, timestamp: new Date().toISOString() });
        setFocusedCount(0); // Reset to allow future positive nudges
      }
    } else {
      if (focusedCount > 0) setFocusedCount(0);
    }

    // Phone Handling
    if (reason === "Phone") {
      setPhoneCount((prev) => {
        const newCount = prev + 1;
        console.log(`Phone count: ${newCount}`);
        return newCount;
      });
      setAbsenceCount(0);
      setFaceNotVisibleCount(0);

      if (phoneCount === 1) {
        const message = "You may be using your phone. Please stop it. DeepWork doesn't allow Phone use during the study/work segment";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      } else if (phoneCount === 2) {
        const message = "You have used your phone for 45 seconds. Please remove it, or the session terminates in the next 15 seconds.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      } else if (phoneCount === 3) {
        const message = "Session terminated due to 1 minute of phone use.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        playEndSound();
        setTimeout(() => speakMessage(message), 500);
        setTimeout(() => onSessionTerminate("Phone use for 1 minute"), 2000);
      }
    } else {
      if (phoneCount > 0 && reason !== "Focused") setPhoneCount(0);
    }

    // Absence Handling (includes both Absent and face not visible after 60s)
    if (reason === "Absent" || (reason === "Likely Distraction: Full face not visible" && isAbsentMode)) {
      setAbsenceCount((prev) => {
        const newCount = prev + 1;
        console.log(`Absence count: ${newCount}`);
        return newCount;
      });
      setPhoneCount(0);
      setFaceNotVisibleCount(0);

      if (absenceCount === 0 && latestLog.isFaceNotVisibleTransition) { // Fourth cycle (60s)
        const message = "You seem to be absent.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      } else if (absenceCount === 3) { // 60s of absence (120s total)
        const message = "You have been absent for 1 minute. Please come back.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      } else if (absenceCount === 5) { // 90s of absence (150s total)
        const message = "You have been absent for so long. Please come back else session will terminate.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      } else if (absenceCount === 7) { // 120s of absence (180s total)
        const message = "Session terminated due to 2 minutes of absence.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        playEndSound();
        setTimeout(() => speakMessage(message), 500);
        setTimeout(() => onSessionTerminate("Absent for 2 minutes"), 2000);
      }
    } else {
      if (absenceCount > 0 && reason !== "Likely Distraction: Full face not visible") {
        setAbsenceCount(0);
      }
    }

    // Face Not Visible Handling (before absent mode)
    if (reason === "Likely Distraction: Full face not visible" && !isAbsentMode) {
      setFaceNotVisibleCount((prev) => {
        const newCount = prev + 1;
        console.log(`FaceNotVisible count: ${newCount}`);
        return newCount;
      });
      setPhoneCount(0);
      if (absenceCount > 0) setAbsenceCount(0);

      if (faceNotVisibleCount === 2) { // 45 seconds (3 * 15s, counting from 0)
        const message = "Your face has not been visible for 45 seconds. Please ensure your face is visible, or it will be treated as absence in the next 15 seconds.";
        setNudgeMessage(message);
        setShowNudge(true);
        setIsPositiveNudge(false);
        if (nudgeType === "text_with_sound") {
          playNudgeSound();
          setTimeout(() => speakMessage(message), 500);
        }
        onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
      }
    } else {
      if (faceNotVisibleCount > 0 && reason !== "Absent") {
        setFaceNotVisibleCount(0);
      }
    }

    if (reason === "Likely distraction: drowsy/lookingaway/badposture") {
      console.log("Detected likely distraction; awaiting implementation rules");
    }
  }, [focusLog, isBreak, nudgeEnabled, nudgeType, nudgeDisabled, phoneCount, absenceCount, faceNotVisibleCount, focusedCount]);

  const handleDismiss = () => {
    setShowNudge(false);
    onNudgeInteraction({
      type: isPositiveNudge ? "dismissed_positive" : "dismissed",
      message: nudgeMessage,
      timestamp: new Date().toISOString(),
    });
  };

  const handleDisableNudges = () => {
    setNudgeDisabled(true);
    setShowNudge(false);
    onNudgeInteraction({
      type: "disabled",
      timestamp: new Date().toISOString(),
    });
    onNudgeDisable();
  };

  const isTerminationMessage = nudgeMessage.toLowerCase().includes("session terminated");

  return (
    <AnimatePresence>
      {showNudge && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center z-[1000] ${isPositiveNudge ? "bg-green-900/30" : "bg-red-900/30"} backdrop-blur-md`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`bg-gradient-to-br ${isPositiveNudge ? "from-green-800 via-green-900 to-green-700" : "from-red-800 via-red-900 to-red-700"} bg-opacity-90 text-gray-100 p-6 rounded-xl shadow-[0_0_15px_${isPositiveNudge ? "rgba(34,197,94,0.5)" : "rgba(220,38,38,0.5)"}] max-w-md w-full flex flex-col items-center backdrop-blur-md`}
          >
            <p className="text-base text-center font-semibold text-gray-100">{nudgeMessage}</p>
            {!isTerminationMessage && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleDismiss}
                  className={`px-4 py-2 ${isPositiveNudge ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"} rounded-lg text-sm font-medium text-gray-200 transition-colors`}
                >
                  Dismiss
                </button>
                <button
                  onClick={handleDisableNudges}
                  className={`px-4 py-2 ${isPositiveNudge ? "bg-green-700 hover:bg-green-600" : "bg-red-700 hover:bg-red-600"} rounded-lg text-sm font-medium text-gray-200 transition-colors`}
                >
                  Disable Nudges
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NudgeComponent;

// import React, { useState, useEffect, useRef } from "react";
// import useSound from "use-sound";
// import { motion, AnimatePresence } from "framer-motion";

// const ENABLE_SPEECH = true;

// const NudgeComponent = ({
//   focusLog,
//   isBreak,
//   nudgeEnabled,
//   nudgeType,
//   onNudgeInteraction,
//   onSessionTerminate,
//   onNudgeDisable,
//   consecutiveFaceNotVisible,
// }) => {
//   const [nudgeMessage, setNudgeMessage] = useState("");
//   const [showNudge, setShowNudge] = useState(false);
//   const [nudgeDisabled, setNudgeDisabled] = useState(false);
//   const [absenceCount, setAbsenceCount] = useState(0);
//   const [phoneCount, setPhoneCount] = useState(0);
//   const [faceNotVisibleCount, setFaceNotVisibleCount] = useState(0);
//   const [playNudgeSound] = useSound("/sounds/nudge-chime.mp3", { volume: 0.5 });
//   const [playEndSound] = useSound("/sounds/end-sound.mp3", { volume: 0.5 });

//   const speakMessage = (message) => {
//     if (ENABLE_SPEECH) {
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.volume = 0.8;
//       utterance.rate = 1.0;
//       utterance.pitch = 1.0;
//       utterance.lang = "en-US";
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const prevLogRef = useRef(null);

//   useEffect(() => {
//     if (nudgeEnabled && nudgeDisabled) {
//       setNudgeDisabled(false);
//       setPhoneCount(0);
//       setAbsenceCount(0);
//       setFaceNotVisibleCount(0);
//       setNudgeMessage("");
//       setShowNudge(false);
//     }

//     if (!nudgeEnabled || nudgeDisabled || isBreak || !focusLog.length) {
//       if (phoneCount > 0 || absenceCount > 0 || faceNotVisibleCount > 0) {
//         setPhoneCount(0);
//         setAbsenceCount(0);
//         setFaceNotVisibleCount(0);
//       }
//       setNudgeMessage("");
//       setShowNudge(false);
//       return;
//     }

//     const latestLog = focusLog[focusLog.length - 1];
//     const reason = latestLog.reason;

//     // Check if in absent mode: last 4 logs are face not visible or Absent
//     const isAbsentMode = focusLog.slice(-4).length >= 4 && focusLog.slice(-4).every(
//       (log) => log.reason === "Likely Distraction: Full face not visible" || log.reason === "Absent"
//     );

//     console.log("NudgeComponent Log:", {
//       reason,
//       consecutiveFaceNotVisible,
//       faceNotVisibleCount,
//       phoneCount,
//       absenceCount,
//       isAbsentMode,
//       detailsReasons: latestLog.details?.map((d) => d.reason) || [],
//     });

//     if (prevLogRef.current && prevLogRef.current.timestamp === latestLog.timestamp) {
//       console.log("Same log entry, skipping...");
//       return;
//     }
//     prevLogRef.current = latestLog;

//     // Phone Handling
//     if (reason === "Phone") {
//       setPhoneCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`Phone count: ${newCount}`);
//         return newCount;
//       });
//       setAbsenceCount(0);
//       setFaceNotVisibleCount(0);

//       if (phoneCount === 1) {
//         const message = "You may be using your phone. Please stop it. DeepWork doesn't allow Phone use during the study/work segment";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (phoneCount === 2) {
//         const message = "You have used your phone for 45 seconds. Please remove it, or the session terminates in the next 15 seconds.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (phoneCount === 3) {
//         const message = "Session terminated due to 1 minute of phone use.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         playEndSound();
//         setTimeout(() => speakMessage(message), 500);
//         setTimeout(() => onSessionTerminate("Phone use for 1 minute"), 2000);
//       }
//     } else {
//       if (phoneCount > 0) setPhoneCount(0);
//     }

//     // Absence Handling (includes both Absent and face not visible after 60s)
//     if (reason === "Absent" || (reason === "Likely Distraction: Full face not visible" && isAbsentMode)) {
//       setAbsenceCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`Absence count: ${newCount}`);
//         return newCount;
//       });
//       setPhoneCount(0);
//       setFaceNotVisibleCount(0);

//       if (absenceCount === 0 && latestLog.isFaceNotVisibleTransition) { // Fourth cycle (60s)
//         const message = "You seem to be absent.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });

//         //3
//       } else if (absenceCount === 2) { // 60s of absence (120s total)
//         const message = "You have been absent for 1 minute. Please come back.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//         //4 
//       } else if (absenceCount === 4) { // 90s of absence (150s total)
//         const message = "You have been absent for so long. Please come back else session will terminate.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//         //7 

//       } else if (absenceCount === 6) { // 120s of absence (180s total)
//         const message = "Session terminated due to 2 minutes of absence.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         playEndSound();
//         setTimeout(() => speakMessage(message), 500);
//         setTimeout(() => onSessionTerminate("Absent for 2 minutes"), 2000);
//       }
//     } else {
//       if (absenceCount > 0 && reason !== "Likely Distraction: Full face not visible") {
//         setAbsenceCount(0);
//       }
//     }

//     // Face Not Visible Handling (before absent mode)
//     if (reason === "Likely Distraction: Full face not visible" && !isAbsentMode) {
//       setFaceNotVisibleCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`FaceNotVisible count: ${newCount}`);
//         return newCount;
//       });
//       setPhoneCount(0);
//       if (absenceCount > 0) setAbsenceCount(0);

//       if (faceNotVisibleCount === 2) { // 45 seconds (3 * 15s, counting from 0)
//         const message = "Your face has not been visible for 45 seconds. Please ensure your face is visible, or it will be treated as absence in the next 15 seconds.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       }
//     } else {
//       if (faceNotVisibleCount > 0 && reason !== "Absent") {
//         setFaceNotVisibleCount(0);
//       }
//     }

//     if (reason === "Likely distraction: drowsy/lookingaway/badposture") {
//       console.log("Detected likely distraction; awaiting implementation rules");
//     }
//   }, [focusLog, isBreak, nudgeEnabled, nudgeType, nudgeDisabled, phoneCount, absenceCount, faceNotVisibleCount]);

//   const handleDismiss = () => {
//     setShowNudge(false);
//     onNudgeInteraction({
//       type: "dismissed",
//       message: nudgeMessage,
//       timestamp: new Date().toISOString(),
//     });
//   };

//   const handleDisableNudges = () => {
//     setNudgeDisabled(true);
//     setShowNudge(false);
//     onNudgeInteraction({
//       type: "disabled",
//       timestamp: new Date().toISOString(),
//     });
//     onNudgeDisable();
//   };

//   const isTerminationMessage = nudgeMessage.toLowerCase().includes("session terminated");

//   return (
//     <AnimatePresence>
//       {showNudge && (
//         <motion.div
//           className="fixed inset-0 flex items-center justify-center z-[1000] bg-red-900/30 backdrop-blur-md"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             className="bg-gradient-to-br from-red-800 via-red-900 to-red-700 bg-opacity-90 text-gray-100 p-6 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] max-w-md w-full flex flex-col items-center backdrop-blur-md"
//           >
//             <p className="text-base text-center font-semibold text-gray-100">{nudgeMessage}</p>
//             {!isTerminationMessage && (
//               <div className="flex gap-4 mt-4">
//                 <button
//                   onClick={handleDismiss}
//                   className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-gray-200 hover:bg-red-500 transition-colors"
//                 >
//                   Dismiss
//                 </button>
//                 <button
//                   onClick={handleDisableNudges}
//                   className="px-4 py-2 bg-red-700 rounded-lg text-sm font-medium text-gray-200 hover:bg-red-600 transition-colors"
//                 >
//                   Disable Nudges
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default NudgeComponent;















///////////////////////////////////////////

// import React, { useState, useEffect, useRef } from "react";
// import useSound from "use-sound";
// import { motion, AnimatePresence } from "framer-motion";

// const ENABLE_SPEECH = true;

// const NudgeComponent = ({
//   focusLog,
//   isBreak,
//   nudgeEnabled,
//   nudgeType,
//   onNudgeInteraction,
//   onSessionTerminate,
//   onNudgeDisable,
//   consecutiveFaceNotVisible,
// }) => {
//   const [nudgeMessage, setNudgeMessage] = useState("");
//   const [showNudge, setShowNudge] = useState(false);
//   const [nudgeDisabled, setNudgeDisabled] = useState(false);
//   const [absenceCount, setAbsenceCount] = useState(0);
//   const [phoneCount, setPhoneCount] = useState(0);
//   const [faceNotVisibleCount, setFaceNotVisibleCount] = useState(0);
//   const [playNudgeSound] = useSound("/sounds/nudge-chime.mp3", { volume: 0.5 });
//   const [playEndSound] = useSound("/sounds/end-sound.mp3", { volume: 0.5 });

//   const speakMessage = (message) => {
//     if (ENABLE_SPEECH) {
//       const utterance = new SpeechSynthesisUtterance(message);
//       utterance.volume = 0.8;
//       utterance.rate = 1.0;
//       utterance.pitch = 1.0;
//       utterance.lang = "en-US";
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const prevLogRef = useRef(null);

//   useEffect(() => {
//     if (nudgeEnabled && nudgeDisabled) {
//       setNudgeDisabled(false);
//       setPhoneCount(0);
//       setAbsenceCount(0);
//       setFaceNotVisibleCount(0);
//       setNudgeMessage("");
//       setShowNudge(false);
//     }

//     if (!nudgeEnabled || nudgeDisabled || isBreak || !focusLog.length) {
//       if (phoneCount > 0 || absenceCount > 0 || faceNotVisibleCount > 0) {
//         setPhoneCount(0);
//         setAbsenceCount(0);
//         setFaceNotVisibleCount(0);
//       }
//       setNudgeMessage("");
//       setShowNudge(false);
//       return;
//     }

//     const latestLog = focusLog[focusLog.length - 1];
//     const reason = latestLog.reason;

//     console.log("NudgeComponent Log:", {
//       reason,
//       consecutiveFaceNotVisible,
//       faceNotVisibleCount,
//       phoneCount,
//       absenceCount,
//       detailsReasons: latestLog.details?.map((d) => d.reason) || [],
//     });

//     if (prevLogRef.current && prevLogRef.current.timestamp === latestLog.timestamp) {
//       console.log("Same log entry, skipping...");
//       return;
//     }
//     prevLogRef.current = latestLog;

//     // Phone Handling
//     if (reason === "Phone") {
//       setPhoneCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`Phone count: ${newCount}`);
//         return newCount;
//       });
//       setAbsenceCount(0);
//       setFaceNotVisibleCount(0);

//       if (phoneCount === 1) {
//         const message = "You may be using your phone. Please stop it. DeepWork doesn't allow Phone use during the study/work segment";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (phoneCount === 2) {
//         const message = "You have used your phone for 45 seconds. Please remove it, or the session terminates in the next 15 seconds.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (phoneCount === 3) {
//         const message = "Session terminated due to 1 minute of phone use.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         playEndSound();
//         setTimeout(() => speakMessage(message), 500);
//         setTimeout(() => onSessionTerminate("Phone use for 1 minute"), 2000);
//       }
//     } else {
//       if (phoneCount > 0) setPhoneCount(0);
//     }

//     // Absence Handling
//     if (reason === "Absent" || (consecutiveFaceNotVisible >= 4 && reason === "Likely Distraction: Full face not visible")) {
//       setAbsenceCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`Absence count: ${newCount}`);
//         return newCount;
//       });
//       setPhoneCount(0);
//       setFaceNotVisibleCount(0);

//       if (absenceCount === 3) {
//         const message = "You have been absent for almost 1 minute. Please come back.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (absenceCount === 5) {
//         const message = "You have been absent for more than a minute. If you are not back, the session will terminate in the next 30 seconds.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       } else if (absenceCount === 7) {
//         const message = "Session terminated due to almost 2 minutes of absence.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         playEndSound();
//         setTimeout(() => speakMessage(message), 500);
//         setTimeout(() => onSessionTerminate("Absent for 2 minutes"), 2000);
//       }
//     } else {
//       if (absenceCount > 0) setAbsenceCount(0);
//     }

//     // Face Not Visible Handling
//     if (reason === "Likely Distraction: Full face not visible" && consecutiveFaceNotVisible >= 6) {
//       setFaceNotVisibleCount((prev) => {
//         const newCount = prev + 1;
//         console.log(`FaceNotVisible count: ${newCount}`);
//         return newCount;
//       });
//       setPhoneCount(0);
//       setAbsenceCount(0);

//       if (faceNotVisibleCount === 0) {
//         const message = "Your face has not been visible for 45 seconds. Please ensure your face is visible, or it will be treated as absence in the next 15 seconds.";
//         setNudgeMessage(message);
//         setShowNudge(true);
//         if (nudgeType === "text_with_sound") {
//           playNudgeSound();
//           setTimeout(() => speakMessage(message), 500);
//         }
//         onNudgeInteraction({ type: "shown", message, timestamp: new Date().toISOString() });
//       }
//     } else {
//       if (faceNotVisibleCount > 0 && consecutiveFaceNotVisible < 6) setFaceNotVisibleCount(0);
//     }

//     if (reason === "Likely distraction: drowsy/lookingaway/badposture") {
//       console.log("Detected likely distraction; awaiting implementation rules");
//     }
//   }, [focusLog, isBreak, nudgeEnabled, nudgeType, nudgeDisabled, phoneCount, absenceCount, faceNotVisibleCount, consecutiveFaceNotVisible]);

//   const handleDismiss = () => {
//     setShowNudge(false);
//     onNudgeInteraction({
//       type: "dismissed",
//       message: nudgeMessage,
//       timestamp: new Date().toISOString(),
//     });
//   };

//   const handleDisableNudges = () => {
//     setNudgeDisabled(true);
//     setShowNudge(false);
//     onNudgeInteraction({
//       type: "disabled",
//       timestamp: new Date().toISOString(),
//     });
//     onNudgeDisable();
//   };

//   const isTerminationMessage = nudgeMessage.toLowerCase().includes("session terminated");

//   return (
//     <AnimatePresence>
//       {showNudge && (
//         <motion.div
//           className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/50 backdrop-blur-md"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             className="bg-gradient-to-br from-gray-800 via-[#2a1a2e] to-gray-700 bg-opacity-90 text-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col items-center backdrop-blur-md"
//           >
//             <p className="text-base text-center font-semibold text-gray-100">{nudgeMessage}</p>
//             {!isTerminationMessage && (
//               <div className="flex gap-4 mt-4">
//                 <button
//                   onClick={handleDismiss}
//                   className="px-4 py-2 bg-gray-600 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-500 transition-colors"
//                 >
//                   Dismiss
//                 </button>
//                 <button
//                   onClick={handleDisableNudges}
//                   className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-600 transition-colors"
//                 >
//                   Disable Nudges
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default NudgeComponent;