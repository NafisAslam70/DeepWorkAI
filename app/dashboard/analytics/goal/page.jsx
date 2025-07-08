"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import { db } from "@/utils/db";
import { StudyProject, StudySession } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, desc } from "drizzle-orm";
import Modal from "react-modal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";

// Custom hook to set appElement when DOM is ready (required by react-modal)
const useModalAppElement = () => {
  const appRef = useRef(null);
  useEffect(() => {
    appRef.current = document.getElementById("__next");
    if (appRef.current) {
      Modal.setAppElement(appRef.current);
    }
  }, []); // Fixed dependency array
  return appRef;
};

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    height: "auto",
    maxHeight: "80vh",
    background: "#ffffff",
    borderRadius: "16px",
    textAlign: "center",
    border: "none",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
    padding: "24px",
  },
  overlay: {
    zIndex: "999",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
  },
};

function GoalAnalyticsContent() {
  const { user } = useUser();
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalDetails, setGoalDetails] = useState({});
  const [sessions, setSessions] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [thingsStudied, setThingsStudied] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [averageFocusLevel, setAverageFocusLevel] = useState(0);
  const [recentActivity, setRecentActivity] = useState(null);
  const [error, setError] = useState(null);

  // Set app element for Modal
  useModalAppElement();

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      try {
        const userEmail = user.primaryEmailAddress.emailAddress;
        const userGoals = await db
          .select()
          .from(StudyProject)
          .where(eq(StudyProject.createdBy, userEmail));

        setGoals(userGoals);

        const localGoalId = localStorage.getItem("selectedGoalId");
        const parsedGoalId = localGoalId && !isNaN(localGoalId) ? parseInt(localGoalId) : null;
        const initialGoal = parsedGoalId && userGoals.some(goal => goal.id === parsedGoalId)
          ? parsedGoalId
          : userGoals[0]?.id || null;
        setSelectedGoal(initialGoal);
      } catch (err) {
        console.error("Error fetching goals:", err);
        setError("Failed to load goals. Please try again.");
      }
    };

    if (user) fetchGoals();
  }, [user]);

  useEffect(() => {
    if (!selectedGoal || isNaN(selectedGoal)) {
      setGoalDetails({});
      setSessions([]);
      setTotalHours(0);
      setThingsStudied([]);
      setRemainingDays(0);
      setAverageFocusLevel(0);
      setRecentActivity(null);
      return;
    }

    const fetchGoalDetails = async () => {
      try {
        const goalDetailsData = await db
          .select()
          .from(StudyProject)
          .where(eq(StudyProject.id, parseInt(selectedGoal)));

        const goalSessions = await db
          .select()
          .from(StudySession)
          .where(eq(StudySession.projectId, parseInt(selectedGoal)))
          .orderBy(desc(StudySession.createdAt));

        console.log("Fetched sessions:", goalSessions); // Debug log

        setGoalDetails(goalDetailsData[0] || {});
        setSessions(goalSessions);

        // Calculate total hours from focusTime and distractedTime
        const totalFocusTime = goalSessions.reduce((sum, session) => sum + (session.focusTime || 0), 0);
        const totalDistractedTime = goalSessions.reduce((sum, session) => sum + (session.distractedTime || 0), 0);
        const totalDuration = totalFocusTime + totalDistractedTime;
        setTotalHours((totalDuration / 3600).toFixed(2));

        // Things studied from notes
        const allNotes = goalSessions.map((session) => ({
          session: session.sessionNo,
          note: session.notes || "No notes available",
        }));
        setThingsStudied(allNotes);

        // Remaining days
        if (goalDetailsData[0]?.deadline) {
          const deadline = new Date(goalDetailsData[0].deadline);
          const today = new Date();
          const remaining = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
          setRemainingDays(remaining);
        } else {
          setRemainingDays(0);
        }

        // Average focus level
        const totalSessions = goalSessions.length;
        const totalFocusLevels = goalSessions.reduce((sum, session) => sum + (session.averageFocusLevel || 0), 0);
        setAverageFocusLevel(totalSessions ? Math.round(totalFocusLevels / totalSessions) : 0);

        // Recent activity
        if (goalSessions.length > 0) {
          const latestSession = goalSessions[0];
          const sessionDuration = latestSession.endTime
            ? ((new Date(latestSession.endTime) - new Date(latestSession.startTime)) / 1000)
            : (latestSession.focusTime + latestSession.distractedTime);
          setRecentActivity({
            date: new Date(latestSession.createdAt).toLocaleDateString(),
            focusTime: (latestSession.focusTime / 60).toFixed(1),
          });
        } else {
          setRecentActivity(null);
        }
      } catch (err) {
        console.error("Error fetching goal details:", err);
        setError("Failed to load goal details. Please select a different goal.");
        setGoalDetails({});
        setSessions([]);
        setTotalHours(0);
        setThingsStudied([]);
        setRemainingDays(0);
        setAverageFocusLevel(0);
        setRecentActivity(null);
      }
    };

    fetchGoalDetails();
  }, [selectedGoal]);

  const handleShowModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleShowDescriptionModal = () => setIsDescriptionModalOpen(true);
  const handleCloseDescriptionModal = () => setIsDescriptionModalOpen(false);

  if (error) {
    return (
      <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen font-sans overflow-x-hidden relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200"
          animate={{
            background: [
              "linear-gradient(45deg, #c3dafe, #e9d5ff, #f9c2ff)",
              "linear-gradient(45deg, #f9c2ff, #c3dafe, #e9d5ff)",
              "linear-gradient(45deg, #e9d5ff, #f9c2ff, #c3dafe)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text relative z-10">
          Goal Analytics Dashboard
        </h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center relative z-10">
          {error}
        </div>
        <motion.div
          className="fixed bottom-0 left-0 w-full overflow-hidden opacity-40 z-0"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-full h-20 text-indigo-100" fill="currentColor" viewBox="0 0 1440 60">
            <path d="M0,32L48,29.3C96,27,192,21,288,24C384,27,480,37,576,40C672,43,768,37,864,32C960,27,1056,21,1152,24C1248,27,1344,37,1392,42.7L1440,48L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,0,160Z" />
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen font-sans overflow-x-hidden relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br"
      />
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text relative z-10">
        Goal Analytics Dashboard
      </h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Select Goal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Select a Goal
          </h3>
          <select
            className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={selectedGoal || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? null : parseInt(e.target.value);
              setSelectedGoal(value);
              localStorage.setItem("selectedGoalId", value ? value.toString() : "");
            }}
          >
            <option value="" disabled>
              {goals.length > 0 ? "Select a goal" : "No goals available"}
            </option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* Total Hours */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Total Time Spent
          </h3>
          <p className="text-3xl md:text-4xl font-bold text-emerald-600">
            {totalHours} hours
          </p>
        </div>

        {/* Average Focus Level */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            Average Focus Quality
          </h3>
          <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
            {averageFocusLevel}/10
          </p>
          <button
            className="bg-blue-600 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-lg hover:bg-indigo-600 transition-all text-sm sm:text-base"
            onClick={() => window.location.href = '/dashboard/analytics/focus'}
          >
            Explore Focus Analytics
          </button>
        </div>
      </div>

      {/* Details and Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Goal Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            Goal Details
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong>Goal:</strong> {goalDetails.projectName || "N/A"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {goalDetails.description &&
              goalDetails.description.length > 20 ? (
                <>
                  {goalDetails.description.slice(0, 20)}...
                  <button
                    onClick={handleShowDescriptionModal}
                    className="text-indigo-600 ml-1 hover:underline"
                  >
                    View More
                  </button>
                </>
              ) : (
                goalDetails.description || "No description"
              )}
            </p>
            <p>
              <strong>Deadline:</strong>{" "}
              {goalDetails.deadline
                ? new Date(goalDetails.deadline).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Sessions:</strong> {sessions.length}
            </p>
          </div>
        </div>

        {/* Remaining Days */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <p className="text-3xl md:text-4xl font-bold text-amber-600">
            {remainingDays}
          </p>
          <p className="text-base md:text-lg text-amber-700 mt-2">
            days remaining
          </p>
        </div>

        {/* Things Studied and Recent Activity */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Things Studied
          </h3>
          <button
            className="bg-blue-600 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-lg hover:bg-indigo-600 transition-all text-sm sm:text-base"
            onClick={handleShowModal}
          >
            Show Things Studied
          </button>
        </div>
      </div>

      {/* Session Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
          Sessions Overview
        </h3>
        <div className="w-full overflow-hidden">
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            className="w-full"
          >
            {sessions.map((session) => (
              <SwiperSlide key={session.id} className="w-full flex justify-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 h-48 w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                    Session {session.sessionNo}
                  </h4>
                  <div className="space-y-1 text-gray-600 text-sm">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {((session.focusTime + session.distractedTime) / 60).toFixed(1)} min
                    </p>
                    <p>
                      <strong>Focus:</strong> {(session.focusTime / 60).toFixed(1)} min
                    </p>
                    <p>
                      <strong>Distracted:</strong>{" "}
                      {(session.distractedTime / 60).toFixed(1)} min
                    </p>
                    <p>
                      <strong>Notes:</strong> {session.notes || "No notes"}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Description Modal */}
      <Modal
        isOpen={isDescriptionModalOpen}
        onRequestClose={handleCloseDescriptionModal}
        style={customModalStyles}
      >
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
          Goal Description
        </h2>
        <p className="text-gray-600 mb-6">
          {goalDetails.description || "No description available"}
        </p>
        <button
          className="bg-gray-600 text-white py-2 px-6 rounded-xl shadow-md hover:bg-gray-700 transition-all duration-300"
          onClick={handleCloseDescriptionModal}
        >
          Close
        </button>
      </Modal>

      {/* Things Studied Modal with Recent Activity */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        style={customModalStyles}
      >
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
          Things Studied & Recent Activity
        </h2>
        <div className="text-left space-y-2 max-h-[60vh] overflow-y-auto px-2">
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-2">Notes</h4>
            {thingsStudied.map((study) => (
              <p key={study.session} className="text-gray-600">
                <strong>Session {study.session}:</strong> {study.note}
              </p>
            ))}
          </div>
          {recentActivity && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-2">
                Recent Activity
              </h4>
              <p>
                <strong>When:</strong> {recentActivity.date}
              </p>
              <p>
                <strong>How Much Focused:</strong> {recentActivity.focusTime} min
              </p>
            </div>
          )}
        </div>
        <button
          className="bg-gray-600 text-white py-2 px-6 rounded-xl shadow-md hover:bg-gray-700 transition-all duration-300 mt-4"
          onClick={handleCloseModal}
        >
          Close
        </button>
      </Modal>

      {/* Wave at the Bottom */}
      <motion.div
        className="fixed bottom-0 left-0 w-full overflow-hidden opacity-40 z-0"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-full h-20 text-indigo-100" fill="currentColor" viewBox="0 0 1440 60">
          <path d="M0,32L48,29.3C96,27,192,21,288,24C384,27,480,37,576,40C672,43,768,37,864,32C960,27,1056,21,1152,24C1248,27,1344,37,1392,42.7L1440,48L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,0,160Z" />
        </svg>
      </motion.div>
    </div>
  );
}

function GoalAnalytics() {
  return (
    <Suspense fallback={<div className="text-center text-gray-600 mt-20">Loading...</div>}>
      <GoalAnalyticsContent />
    </Suspense>
  );
}

export default GoalAnalytics;