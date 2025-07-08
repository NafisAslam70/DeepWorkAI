"use client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { db } from "@/utils/db";
import { StudySession } from "@/utils/schema";
import { useRouter } from "next/navigation";
import { eq, and } from "drizzle-orm";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
Modal.setAppElement("body");

const customStyles = {
  content: {
    position: "relative",
    maxWidth: "90vw",
    maxHeight: "85vh",
    width: "600px",
    padding: "20px",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  overlay: {
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

// CSS for the spinner
const spinnerStyles = `
  .spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffffff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function SessionSummary() {
  const [summary, setSummary] = useState(null);
  const [sessionNo, setSessionNo] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSessionAlreadySaved, setIsSessionAlreadySaved] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesRequired, setNotesRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const focusSummary = params.get("focusSummary");
      try {
        const parsedSummary = focusSummary ? JSON.parse(focusSummary) : null;
        setSummary(parsedSummary);
        console.log("Parsed session summary:", parsedSummary);
      } catch (err) {
        console.error("Error parsing focusSummary:", err);
        setSummary(null);
      }
      setProjectId(parseInt(params.get("projectId"))); // Parse projectId as integer
      setProjectName(params.get("projectName"));
      setSessionNo(params.get("sessionNo"));
    }
  }, []);

  const handleSaveSession = async (overwrite = false) => {
    if (!projectId || !summary || !sessionNo) {
      alert("Missing project ID, session number, or session data. Unable to save session.");
      return;
    }

    if (!notes.trim()) {
      setNotesRequired(true);
      return;
    }

    setIsLoading(true);

    const startTime = new Date(summary.startTime || new Date()); // Use summary.startTime
    const endTime = new Date();
    if (!startTime.getTime() || !endTime.getTime()) {
      console.error("Invalid date object for startTime/endTime");
      alert("Error generating timestamp. Please try again.");
      setIsLoading(false);
      return;
    }

    const data = {
      projectId: parseInt(projectId),
      projectName,
      sessionNo,
      status: "completed",
      startTime,
      endTime,
      focusTime: summary.total_focus_time || 0,
      distractedTime: summary.total_distracted_time || 0,
      focusPercentage: summary.focus_percentage || 0,
      averageFocusLevel: summary.average_focus_level || 0,
      distractionBreakdown: {
        phone: summary.distraction_breakdown?.phone || 0,
        absent: summary.distraction_breakdown?.absent || 0,
        likely: summary.distraction_breakdown?.likely || 0,
      },
      focusTrend: summary.focus_trend || [],
      notes,
    };

    console.log("Saving session to database:", data);

    try {
      const existingSession = await db
        .select()
        .from(StudySession)
        .where(
          and(
            eq(StudySession.projectId, parseInt(projectId)),
            eq(StudySession.sessionNo, sessionNo)
          )
        );

      if (existingSession.length > 0 && !overwrite) {
        setIsSessionAlreadySaved(true);
        setIsConfirmationModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (overwrite) {
        await db
          .update(StudySession)
          .set(data)
          .where(
            and(
              eq(StudySession.projectId, parseInt(projectId)),
              eq(StudySession.sessionNo, sessionNo)
            )
          );
        console.log("Session overwritten successfully");
      } else {
        await db.insert(StudySession).values(data);
        console.log("Session saved successfully");
      }

      try {
        await axios.post(
          "http://127.0.0.1:5000/save_session",
          {
            projectId: parseInt(projectId),
            sessionNo,
            projectName,
            totalFocusTime: data.focusTime,
            totalDistractedTime: data.distractedTime,
            focusPercentage: data.focusPercentage,
            averageFocusLevel: data.averageFocusLevel,
            distraction_breakdown: data.distractionBreakdown,
            focus_trend: data.focusTrend,
            notes,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Session saved to backend successfully");
      } catch (backendError) {
        console.warn("Backend save failed:", backendError.message);
      }

      setIsModalOpen(false);
      setIsConfirmationModalOpen(true);
      setIsSessionAlreadySaved(false); // Reset for next save
    } catch (error) {
      console.error("Error saving session to database:", error);
      alert("Failed to save session to database. Check console for details.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirect = (path) => {
    if (window.opener) {
      window.opener.location.href = path;
      window.close();
    } else {
      router.push(path);
    }
  };

  if (!summary || !projectName || !sessionNo) {
    return <div className="text-white">Loading session summary...</div>;
  }

  const totalTime = summary.total_focus_time + summary.total_distracted_time;
  const absentPhonePercentage = totalTime
    ? (
        ((summary.distraction_breakdown?.absent || 0) + (summary.distraction_breakdown?.phone || 0)) /
        totalTime *
        100
      ).toFixed(1)
    : 0;
  const likelyDistPercentage = totalTime
    ? ((summary.distraction_breakdown?.likely || 0) / totalTime * 100).toFixed(1)
    : 0;

  const barChartData = {
    labels: ["Focus", "Absent/Phone", "Likely Distraction"],
    datasets: [
      {
        label: "Percentage (%)",
        data: [summary.focus_percentage, absentPhonePercentage, likelyDistPercentage],
        backgroundColor: ["#2ecc71", "#e74c3c", "#f39c12"],
        borderColor: ["#27ae60", "#c0392b", "#e67e22"],
        borderWidth: 1,
        barThickness: 25,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Focus Breakdown",
        font: { size: 14, weight: "bold" },
        color: "#e0e0e0",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#e0e0e0", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "#e0e0e0", font: { size: 10, weight: "bold" } },
        grid: { display: false },
      },
    },
  };

  console.log("Rendering Bar chart with data:", barChartData);

  return (
    <>
      <style>{spinnerStyles}</style>
      <div>
        <Modal isOpen={isModalOpen} style={customStyles}>
          <div className="w-full space-y-4">
            {/* Header Card with Stats */}
            <div className="bg-gradient-to-r from-teal-900 to-gray-800 p-4 rounded-lg shadow-lg border border-teal-500/20 flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold text-teal-300 mb-2">📅 Session Overview</h2>
              <div className="flex justify-around w-full text-sm text-white space-x-2">
                <p><strong>Project:</strong> {projectName}</p>
                <p><strong>Session:</strong> #{sessionNo}</p>
              </div>
              <div className="flex items-center justify-around w-full mt-2 space-x-2 text-sm">
                <p>Total Time: {totalTime} sec</p>
                <p>Focus Time: {summary.total_focus_time} sec</p>
                <p>Distraction: {summary.total_distracted_time} sec</p>
              </div>
              <div className="flex items-center mt-2 space-x-4">
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={summary.focus_percentage}
                    text={`${summary.focus_percentage}%`}
                    styles={{
                      path: { stroke: "#2ecc71", strokeLinecap: "round" },
                      text: { fill: "#2ecc71", fontSize: "12px", fontWeight: "bold" },
                      trail: { stroke: "#444" },
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Focus Level</p>
                  <p className="text-base text-yellow-300">{summary.average_focus_level}/10</p>
                </div>
              </div>
            </div>

            {/* Focus Breakdown Chart */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/50">
              <Bar data={barChartData} options={barChartOptions} height={150} />
            </div>

            {/* Notes Section */}
            <div className="w-full">
              <textarea
                className={`w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  notesRequired ? "border-red-500" : ""
                }`}
                placeholder="Add notes about this session..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesRequired(false);
                }}
                rows={3}
              />
              {notesRequired && (
                <p className="text-red-500 mt-1 text-sm">Please enter session notes.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-3">
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200 flex items-center"
                onClick={() => handleSaveSession(false)}
                disabled={isLoading}
              >
                {isLoading && <div className="spinner"></div>}
                {isLoading ? "Saving..." : "Save Session"}
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                onClick={() => handleRedirect("/dashboard/execute")}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isConfirmationModalOpen} style={customStyles}>
          <div className="flex flex-col items-center p-4 space-y-4">
            {isSessionAlreadySaved ? (
              <>
                <span className="text-4xl text-yellow-500 mb-2">⚠️</span>
                <h2 className="text-xl font-bold text-white mb-2">Session Already Saved</h2>
                <p className="text-base text-gray-300">
                  You've already saved session #<strong>{sessionNo}</strong> for{" "}
                  <strong>{projectName}</strong>. Would you like to overwrite it?
                </p>
                <div className="flex justify-center gap-3 mt-2">
                  <button
                    className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200"
                    onClick={() => handleSaveSession(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Overwriting..." : "Overwrite"}
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200"
                    onClick={() => {
                      setIsConfirmationModalOpen(false);
                      setIsSessionAlreadySaved(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-4xl text-teal-400 mb-2">🎉</span>
                <h2 className="text-xl font-bold text-white mb-2">Session Saved!</h2>
                <p className="text-base text-gray-300">
                  You've completed <strong>{sessionNo}</strong> sessions for{" "}
                  <strong>{projectName}</strong>!
                </p>
                <p className="text-base text-gray-300">
                  Avg Focus Level: <strong>{summary.average_focus_level}/10</strong>
                </p>
                <div className="flex justify-center gap-3 mt-2">
                  <button
                    className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200"
                    onClick={() => handleRedirect("/dashboard/home")}
                  >
                    Go to Home
                  </button>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200"
                    onClick={() => handleRedirect("/dashboard/analytics/goal")}
                  >
                    View Analytics
                  </button>
                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200"
                    onClick={() => handleRedirect("/dashboard/execute")}
                  >
                    Start New Session
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}

export default SessionSummary;