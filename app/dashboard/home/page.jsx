"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { eq, and } from "drizzle-orm";
import { initializeRandomGoal } from "@/utils/initializeDb";
import { StudyProject } from "@/utils/schema";
import { FaSpinner, FaPlay, FaPlus, FaDice, FaStar } from "react-icons/fa";
import GoalOverview from "./GoalOverview";
import { motion } from "framer-motion";

// Custom styles for react-modal
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    height: "300px",
    background: "#f1f5f9",
    borderRadius: "20px",
    textAlign: "center",
    border: "none",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
  },
  overlay: {
    zIndex: "999",
  },
};

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  // States
  const [goals, setGoals] = useState([]);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userName = user?.fullName || user?.firstName || "User";

  // Flag to ensure we only initialize random goal once
  const initializedRef = useRef(false);

  // Setup for react-modal
  useEffect(() => {
    const nextApp = document.getElementById("__next");
    if (nextApp) {
      Modal.setAppElement(nextApp);
    }
  }, []);

  // Initialize "random_goal" for the user
  useEffect(() => {
    const initialize = async () => {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (initializedRef.current || !userEmail) return;
      initializedRef.current = true;
      await initializeRandomGoal(userEmail);
    };
    initialize();
  }, [user]);

  // Fetch Goals (filtering out past deadlines except random_goal)
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        if (userEmail) {
          const fetchedGoals = await db
            .select()
            .from(StudyProject)
            .where(eq(StudyProject.createdBy, userEmail));

          const today = new Date();
          const activeGoals = fetchedGoals.filter(
            (goal) =>
              (new Date(goal.deadline) >= today && goal.projectName !== "random_goal") ||
              goal.projectName === "random_goal"
          );
          setGoals(activeGoals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };
    if (user) fetchGoals();
  }, [user]);

  // Handlers
  const handleSelectGoal = (goalId) => {
    if (goalId) {
      setSelectedGoal(goalId);
      setConfirmationMessage(
        "Goal selected successfully! Do you want to start the session now?"
      );
      setIsConfirmationModalOpen(true);
    }
  };

  const handleRandomSession = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        setErrorMessage("User email not found. Please sign in first.");
        setIsErrorModalOpen(true);
        return;
      }
      const randomGoal = await db
        .select()
        .from(StudyProject)
        .where(
          and(eq(StudyProject.projectName, "random_goal"), eq(StudyProject.createdBy, userEmail))
        )
        .limit(1);
      if (randomGoal.length > 0) {
        const randomGoalId = randomGoal[0].id;
        router.push(`/dashboard/execute?goalId=${randomGoalId}`);
      } else {
        setErrorMessage("Random goal not found. Please refresh the page.");
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching random goal:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  const handleGoToExecution = () => {
    router.push(`/dashboard/execute?goalId=${selectedGoal}`);
  };

  const handleCreateNewGoal = async () => {
    setIsLoading(true);
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        setErrorMessage("User email not found. Please sign in first.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      const existingGoals = await db
        .select()
        .from(StudyProject)
        .where(eq(StudyProject.createdBy, userEmail));
      const goalWithSameName = existingGoals.find(
        (g) => g.projectName.toLowerCase() === newGoalName.toLowerCase()
      );
      if (goalWithSameName) {
        setErrorMessage("A goal with this name already exists. Choose a different name.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      const selectedDeadline = new Date(newGoalDeadline);
      const today = new Date();
      if (selectedDeadline < today) {
        setErrorMessage("The deadline cannot be in the past. Please select a future date.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }
      const newGoalData = {
        projectName: newGoalName,
        description: newGoalDescription,
        deadline: selectedDeadline,
        createdBy: userEmail,
      };
      await db.insert(StudyProject).values(newGoalData);
      const insertedGoal = await db
        .select()
        .from(StudyProject)
        .where(
          and(
            eq(StudyProject.projectName, newGoalName),
            eq(StudyProject.createdBy, userEmail)
          )
        )
        .limit(1);
      const newGoalId = insertedGoal[0]?.id;
      if (newGoalId) {
        setSelectedGoal(newGoalId);
        setIsNewGoalModalOpen(false);
        setConfirmationMessage(
          "Goal created successfully! Do you want to start execution now?"
        );
        setIsConfirmationModalOpen(true);
      } else {
        setErrorMessage("An error occurred while creating the goal. Please try again.");
        setIsErrorModalOpen(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating new goal:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsErrorModalOpen(true);
      setIsLoading(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 px-6 md:px-12 py-4 md:py-6 text-gray-800 w-full flex flex-col justify-start relative overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "linear-gradient(45deg, #c3dafe, #e9d5ff, #f9c2ff)",
            "linear-gradient(45deg, #f9c2ff, #c3dafe, #e9d5ff)",
            "linear-gradient(45deg, #e9d5ff, #f9c2ff, #c3dafe)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {/* Particle Effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-indigo-400 opacity-60"
            style={{ left: "50%", top: "50%" }}
            animate={{
              x: [0, Math.cos(i) * 50, 0],
              y: [0, Math.sin(i) * 50, 0],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            <FaStar size={12} />
          </motion.div>
        ))}
      </motion.div>

      <div className="w-full max-w-6xl mx-auto z-10">
        {/* <motion.h1
          className="text-3xl md:text-2xl font-bold p-1 mb-2 text-indigo-500 text-center mt-0 "
          initial={{ opacity: 0, scale: 0.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Hey {userName}, What would you want to work upon today!
        </motion.h1> */}

        {/* Three Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 ">
          {/* Continue Session for Existing Goal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 bg-opacity-90 backdrop-blur-md rounded-xl p-6 shadow-lg flex flex-col items-center text-center gap-1 max-w-md w-full transition-all duration-300"
          >
            <FaPlay className="text-white text-4xl mb-4 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white">Continue a Goal</h2>
            <p className="text-gray-200 italic">Select a goal below to resume your focus.</p>
            <div className="mt-4 w-full">
              {goals.length > 0 ? (
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  onChange={(e) => handleSelectGoal(e.target.value)}
                >
                  <option value="">Select a goal</option>
                  {goals
                    .filter((goal) => goal.projectName !== "random_goal")
                    .map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.projectName} - {new Date(goal.deadline).toLocaleDateString()}
                      </option>
                    ))}
                </select>
              ) : (
                <p className="text-gray-200">No goals found. Please create a new one.</p>
              )}
            </div>
          </motion.div>

          {/* Create New Goal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-green-400 to-green-600 bg-opacity-90 backdrop-blur-md rounded-xl p-6 shadow-lg flex flex-col items-center text-center gap-6 max-w-md w-full cursor-pointer hover:bg-opacity-95 transition-all duration-300"
            onClick={() => setIsNewGoalModalOpen(true)}
          >
            <FaPlus className="text-white text-4xl mb-4 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white">Create New Goal</h2>
            <p className="text-gray-200 italic">Set a new goal with a deadline and description.</p>
          </motion.div>

          {/* Take Random Session */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-br from-red-400 to-red-600 bg-opacity-90 backdrop-blur-md rounded-xl p-6 shadow-lg flex flex-col items-center text-center gap-6 max-w-md w-full cursor-pointer hover:bg-opacity-95 transition-all duration-300"
            onClick={handleRandomSession}
          >
            <FaDice className="text-white text-4xl mb-4 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white">Take Random Session</h2>
            <p className="text-gray-200 italic">Start a spontaneous focus session.</p>
          </motion.div>
        </div>

        {/* Modal for creating a new goal */}
        {isNewGoalModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-40">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg w-[400px] flex flex-col items-center">
              <h3 className="font-bold text-xl md:text-2xl mb-4 text-indigo-700">Create New Goal</h3>
              <div className="mb-4 w-full">
                <label className="block font-medium mb-2 text-gray-700">Goal Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                />
              </div>
              <div className="mb-4 w-full">
                <label className="block font-medium mb-2 text-gray-700">Goal Description</label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                />
              </div>
              <div className="mb-4 w-full">
                <label className="block font-medium mb-2 text-gray-700">Deadline</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                />
              </div>
              <div className="flex justify-between mt-4 w-full">
                <button
                  className="bg-indigo-500 text-white p-3 rounded-lg w-[48%] flex items-center justify-center hover:bg-indigo-600 transition-all duration-300"
                  onClick={handleCreateNewGoal}
                  disabled={isLoading}
                >
                  {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                  Create Goal
                </button>
                <button
                  className="bg-gray-500 text-white p-3 rounded-lg w-[48%] hover:bg-gray-600 transition-all duration-300"
                  onClick={() => setIsNewGoalModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmationModalOpen}
          onRequestClose={() => setIsConfirmationModalOpen(false)}
          style={customStyles}
        >
          <div className="flex flex-col items-center">
            <span className="text-6xl mb-4">🎯</span>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">{confirmationMessage}</h2>
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="bg-green-500 text-white py-2 px-6 rounded-full shadow-lg hover:bg-green-600 transition-all text-lg"
                onClick={handleGoToExecution}
              >
                Yes, Start Now
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-600 transition-all text-lg"
                onClick={() => setIsConfirmationModalOpen(false)}
              >
                No, Later
              </button>
            </div>
          </div>
        </Modal>

        {/* Error Modal */}
        <Modal
          isOpen={isErrorModalOpen}
          onRequestClose={() => setIsErrorModalOpen(false)}
          style={customStyles}
        >
          <div className="flex flex-col items-center">
            <span className="text-6xl mb-4">⚠️</span>
            <h2 className="text-2xl font-bold mb-4 text-red-600">{errorMessage}</h2>
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-600 transition-all text-lg"
                onClick={() => setIsErrorModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Goal Overview Section */}
        <GoalOverview />
      </div>

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
    </div>
  );
}