"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { db } from "@/utils/db";
import { StudySession, StudyProject } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, desc } from "drizzle-orm";
import { useSearchParams } from "next/navigation";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Modal from "react-modal";
import { motion } from "framer-motion";

// Dynamically import react-modal with SSR disabled
const ReactModal = dynamic(() => import("react-modal"), { ssr: false });

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const customModalStyles = {
  content: {
    position: "relative",
    maxWidth: "90vw",
    maxHeight: "85vh",
    width: "800px",
    padding: "20px",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    overflowY: "auto",
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

function FocusAnalytics() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistractionInfoVisible, setIsDistractionInfoVisible] = useState(false);
  const [isLastWeekModalOpen, setIsLastWeekModalOpen] = useState(false);
  const [isSessionAnalysisModalOpen, setIsSessionAnalysisModalOpen] = useState(false);
  const modalInitialized = useRef(false);
  const appElementRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !modalInitialized.current) {
      const appElement = document.getElementById("__next") || document.body;
      if (appElement) {
        Modal.setAppElement(appElement);
        modalInitialized.current = true;
      } else {
        console.warn("Could not find #__next, falling back to document.body");
        Modal.setAppElement(document.body);
        modalInitialized.current = true;
      }
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const userProjects = await db
        .select()
        .from(StudyProject)
        .where(eq(StudyProject.createdBy, userEmail));

      console.log("Fetched projects:", userProjects);
      setProjects(userProjects);
      const storedProjectId = localStorage.getItem("selectedGoalId");
      const urlProjectId = searchParams.get("projectId");
      const initialProjectId = urlProjectId || storedProjectId || userProjects[0]?.id?.toString();
      console.log("Setting selectedProjectId:", initialProjectId);
      setSelectedProjectId(initialProjectId);
    };

    if (user) fetchProjects();
  }, [user, searchParams]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (selectedProjectId === "all") {
        const allSessionData = await db
          .select()
          .from(StudySession)
          .orderBy(desc(StudySession.createdAt));
        console.log("Fetched all sessions:", allSessionData.map(s => ({
          id: s.id,
          sessionNo: s.sessionNo,
          createdAt: s.createdAt,
          distractionBreakdown: s.distractionBreakdown
        })));
        setSessions(allSessionData);
        setFilteredSessions(allSessionData);
      } else if (selectedProjectId) {
        const sessionData = await db
          .select()
          .from(StudySession)
          .where(eq(StudySession.projectId, parseInt(selectedProjectId)))
          .orderBy(desc(StudySession.createdAt));
        console.log("Fetched sessions for projectId", selectedProjectId, ":", sessionData.map(s => ({
          id: s.id,
          sessionNo: s.sessionNo,
          createdAt: s.createdAt,
          distractionBreakdown: s.distractionBreakdown
        })));
        setSessions(sessionData);
        setFilteredSessions(sessionData);
      }
    };

    if (selectedProjectId) fetchSessions();
  }, [selectedProjectId]);

  // Calculate total times
  const totalFocusTime = filteredSessions.reduce((acc, s) => acc + (s.focusTime || 0), 0);
  const totalDistractedTime = filteredSessions.reduce((acc, s) => acc + (s.distractedTime || 0), 0);
  const totalSessionTime = filteredSessions.reduce((acc, s) => acc + (s.focusTime || 0) + (s.distractedTime || 0), 0);
  const distractionTotals = filteredSessions.reduce(
    (acc, s) => {
      const breakdown = s.distractionBreakdown || { phone: 0, absent: 0, likely: 0 };
      console.log("Processing distractionBreakdown for session", s.sessionNo, ":", breakdown);
      return {
        strict: acc.strict + (breakdown.phone || 0) + (breakdown.absent || 0),
        likely: acc.likely + (breakdown.likely || 0),
      };
    },
    { strict: 0, likely: 0 }
  );

  // Summary Metrics
  const avgFocusLevel = filteredSessions.length
    ? (filteredSessions.reduce((acc, s) => acc + (s.averageFocusLevel || 0), 0) / filteredSessions.length).toFixed(1)
    : 0;
  const totalFocusHours = (totalFocusTime / 3600).toFixed(1);
  const totalSessionHours = (totalSessionTime / 3600).toFixed(1);

  // Last Week Activity
  const lastWeekActivity = {
    totalFocusHours: filteredSessions
      .filter((s) => {
        const sessionDate = new Date(s.startTime);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return sessionDate >= oneWeekAgo;
      })
      .reduce((acc, s) => acc + (s.focusTime || 0), 0) / 3600,
    sessionCount: filteredSessions.filter((s) => {
      const sessionDate = new Date(s.startTime);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return sessionDate >= oneWeekAgo;
    }).length,
  };

  // Last Week Focus Level Data (Line Chart)
  const lastWeekSessions = filteredSessions
    .filter((s) => {
      const sessionDate = new Date(s.startTime);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return sessionDate >= oneWeekAgo;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  console.log("Last week sessions for line chart:", lastWeekSessions.map(s => ({
    sessionNo: s.sessionNo,
    startTime: s.startTime,
    averageFocusLevel: s.averageFocusLevel || 0,
  })));
  const lastWeekFocusLevelData = {
    labels: lastWeekSessions.map((s) => `Session ${s.sessionNo}`),
    datasets: [
      {
        label: "Avg. Focus Level",
        data: lastWeekSessions.map((s) => s.averageFocusLevel || 0),
        fill: false,
        borderColor: "#2ecc71",
        backgroundColor: "#2ecc71",
        pointBackgroundColor: "#2ecc71",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#2ecc71",
        tension: 0.3,
      },
    ],
  };

  // Focus Distribution Data
  const focusDistributionData = {
    labels: ["Focus", "Strict Distractions", "Likely Distractions"],
    datasets: [
      {
        data: [
          totalFocusTime,
          distractionTotals.strict,
          distractionTotals.likely,
        ],
        backgroundColor: ["#2ecc71", "#e74c3c", "#f39c12"],
        hoverOffset: 4,
      },
    ],
  };

  // Minute-by-Minute Data for Selected Session
  const getMinuteByMinuteData = (session) => {
    const focusTrend = session?.focusTrend || [];
    return {
      labels: focusTrend.map((t) => `Min ${t.minute}`),
      datasets: [
        {
          label: "Focus State",
          data: focusTrend.map((t) => (t.state === "Focused" ? 100 : 0)),
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "#4bc0c0",
          tension: 0.1,
          stepped: "before",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Focus Distribution" },
    },
  };

  const focusTrendOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top", labels: { color: "#000" } },
      title: { display: true, text: "Focus Trend Over Sessions", color: "#000" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: "#000" },
        title: { display: true, text: "Focus Level (0-10)", color: "#000" },
      },
      x: {
        ticks: { color: "#000" },
      },
    },
  };

// Calculate last week's distraction totals
const lastWeekDistractionTotals = lastWeekSessions.reduce(
  (acc, s) => {
    const breakdown = s.distractionBreakdown || { phone: 0, absent: 0, likely: 0 };
    return {
      strict: acc.strict + (breakdown.phone || 0) + (breakdown.absent || 0),
      likely: acc.likely + (breakdown.likely || 0),
    };
  },
  { strict: 0, likely: 0 }
);

// Total session time for last week (in hours)
const lastWeekTotalSessionTime = lastWeekSessions.reduce(
  (acc, s) => acc + (s.focusTime || 0) + (s.distractedTime || 0),
  0
) / 3600;

const lastWeekBarChartData = {
  labels: ["Last Week Breakdown"],
  datasets: [
    {
      label: "Focus Hours (%)",
      data: [
        lastWeekTotalSessionTime
          ? (lastWeekActivity.totalFocusHours / lastWeekTotalSessionTime) * 100
          : 0,
      ],
      backgroundColor: "#2ecc71", // Green
      borderColor: "#27ae60",
      borderWidth: 1,
      barThickness: 20,
    },
    {
      label: "Strict Distractions (%)",
      data: [
        lastWeekTotalSessionTime
          ? (lastWeekDistractionTotals.strict / 3600 / lastWeekTotalSessionTime) * 100
          : 0,
      ],
      backgroundColor: "#e74c3c", // Red
      borderColor: "#c0392b",
      borderWidth: 1,
      barThickness: 20,
    },
    {
      label: "Likely Distractions (%)",
      data: [
        lastWeekTotalSessionTime
          ? (lastWeekDistractionTotals.likely / 3600 / lastWeekTotalSessionTime) * 100
          : 0,
      ],
      backgroundColor: "#f39c12", // Orange
      borderColor: "#e67e22",
      borderWidth: 1,
      barThickness: 20,
    },
  ],
};

  const lastWeekBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Focus Breakdown (Last Week)",
        font: { size: 14, weight: "bold" },
        color: "#e0e0e0",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#e0e0e0", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: { display: true, text: "Percentage (%)", color: "#e0e0e0" },
      },
      x: {
        ticks: { color: "#e0e0e0", font: { size: 10, weight: "bold" } },
        grid: { display: false },
      },
    },
  };

  const lastWeekFocusLevelOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top", labels: { color: "#e0e0e0", font: { size: 12 } } },
      title: {
        display: true,
        text: "Average Focus Level (Last Week)",
        font: { size: 14, weight: "bold" },
        color: "#e0e0e0",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: "#e0e0e0", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: { display: true, text: "Focus Level (0-10)", color: "#e0e0e0" },
      },
      x: {
        ticks: { color: "#e0e0e0", font: { size: 10, weight: "bold" } },
        grid: { display: false },
      },
    },
  };

  const sessionAnalysisData = filteredSessions.map((session) => {
    const breakdown = session.distractionBreakdown || { phone: 0, absent: 0, likely: 0 };
    console.log("Session analysis data for session", session.sessionNo, ":", {
      focusTime: session.focusTime / 60,
      strictDistractionTime: (breakdown.phone + breakdown.absent) / 60,
      likelyDistractionTime: breakdown.likely / 60,
    });
    return {
      sessionNo: session.sessionNo,
      totalTime: (session.focusTime + (session.distractedTime || 0)) / 60,
      focusTime: session.focusTime / 60,
      distractedTime: (breakdown.phone + breakdown.absent) / 60, // Strict distractions: phone + absent
      likelyDistractionTime: breakdown.likely / 60, // Likely distractions: only likely
      avgFocusLevel: session.averageFocusLevel || 0,
    };
  });

  const sessionAnalysisBarChartData = {
    labels: sessionAnalysisData.map((s) => `Session ${s.sessionNo}`),
    datasets: [
      {
        label: "Focus Time (min)",
        data: sessionAnalysisData.map((s) => s.focusTime),
        backgroundColor: "#2ecc71",
        borderColor: "#27ae60",
        borderWidth: 1,
        barThickness: 12,
      },
      {
        label: "Strict Distractions (min)",
        data: sessionAnalysisData.map((s) => s.distractedTime),
        backgroundColor: "#e74c3c",
        borderColor: "#c0392b",
        borderWidth: 1,
        barThickness: 12,
      },
      {
        label: "Likely Distractions (min)",
        data: sessionAnalysisData.map((s) => s.likelyDistractionTime),
        backgroundColor: "#f39c12",
        borderColor: "#e67e22",
        borderWidth: 1,
        barThickness: 12,
      },
    ],
  };

  const sessionAnalysisBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#e0e0e0",
          font: { size: 12 },
        }
      },
      title: {
        display: true,
        text: "Session-wise Time Analysis",
        font: { size: 14, weight: "bold" },
        color: "#e0e0e0",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#e0e0e0", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        title: { display: true, text: "Minutes", color: "#e0e0e0" },
        stacked: true,
      },
      x: {
        ticks: { color: "#e0e0e0", font: { size: 10, weight: "bold" } },
        grid: { display: false },
        stacked: true,
      },
    },
  };

  const focusTrendBarData = {
    labels: filteredSessions.map((s) => `Session ${s.sessionNo}`),
    datasets: [
      {
        label: "Avg. Focus Level",
        data: sessionAnalysisData.map((s) => s.avgFocusLevel),
        backgroundColor: "#4bc0c0",
        stack: "Stack 0",
      },
    ],
  };

  const focusTrendLineData = {
    labels: filteredSessions.map((s) => `Session ${s.sessionNo}`),
    datasets: [
      {
        label: "Avg. Focus Level",
        data: sessionAnalysisData.map((s) => s.avgFocusLevel),
        fill: false,
        borderColor: "#4bc0c0",
        tension: 0.3,
        pointBackgroundColor: "#4bc0c0",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#4bc0c0",
      },
    ],
  };

  const parentSelector = () => document.querySelector("#__next") || document.body;

  return (
    <div
      className="w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans relative"
      ref={appElementRef}
    >
      <style>{spinnerStyles}</style>
      <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
        Focus Analytics Dashboard
      </h2>

      {/* Project Selection and Last Week Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 mt-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">Select a Project</h3>
          <select
            className="w-full p-3 mb-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500"
            value={selectedProjectId || ""}
            onChange={(e) => {
              const newProjectId = e.target.value;
              setSelectedProjectId(newProjectId);
              localStorage.setItem("selectedGoalId", newProjectId);
              console.log("Project selected:", newProjectId);
            }}
          >
            <option value="">Select a project</option>
            <option value="all">All Goals</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700">Last Week Activity</h3>
            <p className="text-lg text-gray-600 mb-4">Click to view details</p>
            <button
              className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-all"
              onClick={() => {
                console.log("Opening Last Week Activity modal, selectedProjectId:", selectedProjectId);
                setIsLastWeekModalOpen(true);
              }}
            >
              Show
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-4 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total Hours of Session Time</h3>
            <p className="text-3xl font-bold text-indigo-600">{totalSessionHours} hrs</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-4 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Avg. Focus Level</h3>
            <p className="text-3xl font-bold text-emerald-600">{avgFocusLevel}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-4 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total Focus</h3>
            <p className="text-3xl font-bold text-blue-600">{totalFocusHours} hrs</p>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Focus Distribution</h2>
          <Doughnut data={focusDistributionData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Focus Trend Over Sessions</h2>
          <Bar data={focusTrendBarData} options={focusTrendOptions} />
          <div className="mt-4 flex justify-center">
            <button
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all"
              onClick={() => {
                console.log("Opening Session Wise Analysis modal, selectedProjectId:", selectedProjectId);
                setIsSessionAnalysisModalOpen(true);
              }}
            >
              Session Wise Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Minute-by-Minute Modal */}
      {isModalOpen && (
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={customModalStyles}
          parentSelector={parentSelector}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Minute-by-Minute Focus - Session {selectedSession?.sessionNo}
          </h2>
          {selectedSession && (
            <Line
              data={getMinuteByMinuteData(selectedSession)}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Focus State" } },
                scales: { y: { min: 0, max: 100, title: { display: true, text: "Focus (0-100)" } } },
              }}
            />
          )}
          <p className="mt-4 text-gray-600">Notes: {selectedSession?.notes || "No notes"}</p>
          <button
            className="mt-6 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </ReactModal>
      )}

      {/* Last Week Activity Modal */}
      <ReactModal
        isOpen={isLastWeekModalOpen}
        onRequestClose={() => setIsLastWeekModalOpen(false)}
        style={customModalStyles}
        parentSelector={parentSelector}
      >
        <div className="w-full space-y-4">
          <div className="bg-gradient-to-r from-teal-900 to-gray-800 p-2 rounded-lg shadow-lg border border-teal-500/20 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-teal-300 mb-2">📅 Last Week Activity</h2>
            <div className="flex justify-around w-full text-sm text-white space-x-2">
              <p>
                <strong>Project:</strong>{" "}
                {selectedProjectId === "all"
                  ? "All Goals"
                  : projects.find((p) => p.id.toString() === selectedProjectId)?.projectName || "Unknown"}
              </p>
              <p>
                <strong>Week:</strong>{" "}
                {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-around w-full mt-2 space-x-2 text-sm">
              <p>Total Sessions: {lastWeekActivity.sessionCount}</p>
              <p>Focus Hours: {lastWeekActivity.totalFocusHours.toFixed(1)} hrs</p>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={(lastWeekActivity.totalFocusHours / (totalSessionHours || 1)) * 100}
                  text={`${((lastWeekActivity.totalFocusHours / (totalSessionHours || 1)) * 100).toFixed(1)}%`}
                  styles={{
                    path: { stroke: "#2ecc71", strokeLinecap: "round" },
                    text: { fill: "#2ecc71", fontSize: "12px", fontWeight: "bold" },
                    trail: { stroke: "#444" },
                  }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg Focus Level (Last Week)</p>
                <p className="text-base text-yellow-300">
                  {filteredSessions.length
                    ? (
                      filteredSessions
                        .filter((s) => new Date(s.startTime) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .reduce((acc, s) => acc + (s.averageFocusLevel || 0), 0) / lastWeekActivity.sessionCount
                    ).toFixed(1) || 0
                    : 0}
                  /10
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/50">
              <Bar data={lastWeekBarChartData} options={lastWeekBarChartOptions} height={400} />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/50">
              <Line data={lastWeekFocusLevelData} options={lastWeekFocusLevelOptions} height={400} />
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-1">
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              onClick={() => setIsLastWeekModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </ReactModal>

      {/* Session Wise Analysis Modal */}
      <ReactModal
        isOpen={isSessionAnalysisModalOpen}
        onRequestClose={() => setIsSessionAnalysisModalOpen(false)}
        style={customModalStyles}
        parentSelector={parentSelector}
      >
        <div className="w-full space-y-6">
          <div className="bg-gradient-to-r from-teal-900 to-gray-800 p-4 rounded-lg shadow-lg border border-teal-500/20 flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-teal-300 mb-2">📊 Session Wise Analysis</h2>
            <p className="text-sm text-white">
              <strong>Project:</strong>{" "}
              {selectedProjectId === "all"
                ? "All Goals"
                : projects.find((p) => p.id.toString() === selectedProjectId)?.projectName || "Unknown"}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/50">
            <Bar data={sessionAnalysisBarChartData} options={sessionAnalysisBarChartOptions} height={300} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionAnalysisData.map((session) => (
              <div
                key={session.sessionNo}
                className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  const fullSession = filteredSessions.find((s) => s.sessionNo === session.sessionNo);
                  setSelectedSession(fullSession);
                  setIsModalOpen(true);
                }}
              >
                <h3 className="text-lg font-semibold text-teal-300 mb-2">Session #{session.sessionNo}</h3>
                <p className="text-sm text-white">Total Time: {session.totalTime.toFixed(1)} min</p>
                <p className="text-sm text-white">Focus Time: {session.focusTime.toFixed(1)} min</p>
                <p className="text-sm text-white">Strict Distractions: {session.distractedTime.toFixed(1)} min</p>
                <p className="text-sm text-white">Likely Distractions: {session.likelyDistractionTime.toFixed(1)} min</p>
                <p className="text-sm text-white">Avg Focus Level: {session.avgFocusLevel}/10</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-3">
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              onClick={() => setIsSessionAnalysisModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </ReactModal>

      <motion.div
        className="fixed bottom-0 left-0 w-full overflow-hidden opacity-40 z-0"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-full h-20 text-indigo-100" fill="currentColor" viewBox="0 0 1440 60">
          <path d="M0,32L48,29.3C96,27,192,21,288,24C384,27,480,37,576,40C672,43,768,37,864,32C960,27,1056,21,1152,24C1248,27,1344,37,1392,42.7L1440,48L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,0,160Z" />
        </svg>
      </motion.div>

      <div
        className="fixed right-10 top-[13%] transform -translate-y-1/2 z-50"
        onMouseEnter={() => setIsDistractionInfoVisible(true)}
        onMouseLeave={() => setIsDistractionInfoVisible(false)}
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-indigo-500 rounded-full flex items-center justify-center cursor-pointer animate-pulse">
            <span className="text-white text-2xl font-bold">?</span>
          </div>
          {isDistractionInfoVisible && (
            <div className="absolute right-0 top-0 w-64 bg-white rounded-lg shadow-lg p-4 mt-14 border border-gray-200 transform transition-all duration-300 ease-in-out">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Distraction Categories</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-700 font-medium">Strict Distractions</p>
                  <p className="text-gray-600 text-sm">Phone usage and absence from session, directly impacting focus.</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Likely Distractions</p>
                  <p className="text-gray-600 text-sm">Potential distractions like bad posture or fatigue, less immediate but notable.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FocusAnalytics;