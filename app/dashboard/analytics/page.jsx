"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  // Mock data for Goal Analytics preview
  const goalProgressData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [60, 40], // Mock data: 60% completed, 40% remaining
        backgroundColor: ["#34D399", "#E5E7EB"],
        hoverBackgroundColor: ["#2DD4BF", "#D1D5DB"],
      },
    ],
  };

  // Mock data for Focus Analytics preview
  const focusTrendData = {
    labels: ["Session 1", "Session 2", "Session 3", "Session 4"],
    datasets: [
      {
        label: "Focus Time (min)",
        data: [45, 60, 30, 50], // Mock data
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Drowsy Time (min)",
        data: [10, 5, 15, 8], // Mock data
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  // Animation variants for the title
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  // Animation for the wave divider
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

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "Goal Progress Overview" },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Focus Sessions Overview" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Time (min)" } },
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center">
      {/* Header Section */}
      <motion.h1
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center"
      >
        Analytics Overview
      </motion.h1>

      {/* Summary Section */}
      <div className="w-full max-w-5xl mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Quick Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Goal Analytics Preview */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Goal Progress Snapshot
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="w-48 h-48">
                <Pie data={goalProgressData} options={pieOptions} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">
                Total Goals: 5
              </p>
              <p className="text-lg font-semibold text-gray-600">
                Avg. Completion: 60%
              </p>
            </div>
          </motion.div>

          {/* Focus Analytics Preview */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Focus Sessions Snapshot
            </h3>
            <div className="h-64">
              <Bar data={focusTrendData} options={barOptions} />
            </div>
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-600">
                Avg. Focus: 75%
              </p>
              <p className="text-lg font-semibold text-gray-600">
                Total Focus: 185 min
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Divider */}
      <motion.div
        variants={waveVariants}
        animate="animate"
        className="w-32 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full mb-12"
      />

      {/* Navigation Cards */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-center">
        {/* Goal Analytics Card */}
        <Link href="/dashboard/analytics/goal">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg rounded-xl p-8 w-full md:w-1/2 text-center transition-all cursor-pointer"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Goal Analytics
            </h3>
            <p className="text-gray-600">
              Track project milestones, completion status, and current phase.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-all">
                Explore Goals
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Focus Analytics Card */}
        <Link href="/dashboard/analytics/focus">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg rounded-xl p-8 w-full md:w-1/2 text-center transition-all cursor-pointer"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Focus Analytics
            </h3>
            <p className="text-gray-600">
              Analyze session focus for both random and project-based sessions.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-all">
                Explore Focus
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

export default Analytics;