"use client";
import { useState, useEffect } from "react";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { StudyProject } from "@/utils/schema";
import { motion } from "framer-motion";
import { FaPlay, FaEdit, FaTrash, FaTimes, FaChevronRight, FaChevronDown } from "react-icons/fa";

// Example alerts to show in the banner
const alerts = [
  "⚠️ 'Final Exam Prep' deadline is approaching soon!",
  "🎯 '5 days Streak Keep going champ!",
  "⏳ 'Web Dev Course' is overdue by 3 days!"
];

// Modern modal styles with glassmorphism
const normalModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    minHeight: "400px",
    maxHeight: "80vh",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    padding: "24px",
    textAlign: "center",
    zIndex: "1000",
    overflowY: "auto",
  },
  overlay: {
    zIndex: "999",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const squareModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "900px",
    minHeight: "500px",
    maxHeight: "80vh",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    padding: "24px",
    textAlign: "center",
    zIndex: "1000",
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    zIndex: "999",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

export default function GoalOverview() {
  const { user } = useUser();
  const router = useRouter();

  const [goals, setGoals] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isPastGoalsModalOpen, setIsPastGoalsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAllGoalsModalOpen, setAllGoalsModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [editGoalName, setEditGoalName] = useState("");
  const [editGoalDescription, setEditGoalDescription] = useState("");
  const [editGoalDeadline, setEditGoalDeadline] = useState("");

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        if (userEmail) {
          const fetchedGoals = await db
            .select()
            .from(StudyProject)
            .where(eq(StudyProject.createdBy, userEmail));
          setGoals(fetchedGoals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };
    if (user) fetchGoals();
  }, [user]);

  // Rotate alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter goals
  const now = new Date();
  const completedGoals = goals.filter((g) => new Date(g.deadline) < now);
  const recentGoals = goals
    .filter((g) => new Date(g.deadline) >= now && g.projectName !== "random_goal")
    .slice(0, 3);

  // Handlers
  const handleContinueGoal = (goalId) => {
    router.push(`/dashboard/execute?goalId=${goalId}`);
  };

  const openPastGoalsModal = () => setIsPastGoalsModalOpen(true);
  const closePastGoalsModal = () => setIsPastGoalsModalOpen(false);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedGoalId("");
    setEditGoalName("");
    setEditGoalDescription("");
    setEditGoalDeadline("");
  };

  const openAllGoalsModal = () => setAllGoalsModalOpen(true);
  const closeAllGoalsModal = () => setAllGoalsModalOpen(false);

  const handleSelectGoalToEdit = (goalId) => {
    setSelectedGoalId(goalId);
    const g = goals.find((goal) => String(goal.id) === goalId);
    if (g) {
      setEditGoalName(g.projectName);
      setEditGoalDescription(g.description || "");
      const dateString = new Date(g.deadline).toISOString().split("T")[0];
      setEditGoalDeadline(dateString);
    }
  };

  const handleSaveGoalChanges = async () => {
    try {
      if (!selectedGoalId) {
        alert("Please select a goal to edit.");
        return;
      }
      const deadlineDate = new Date(editGoalDeadline);
      if (deadlineDate < now) {
        alert("Deadline cannot be in the past.");
        return;
      }
      await db
        .update(StudyProject)
        .set({
          projectName: editGoalName,
          description: editGoalDescription,
          deadline: deadlineDate,
        })
        .where(and(eq(StudyProject.id, Number(selectedGoalId))));
      const updated = goals.map((g) =>
        g.id === Number(selectedGoalId)
          ? {
              ...g,
              projectName: editGoalName,
              description: editGoalDescription,
              deadline: deadlineDate,
            }
          : g
      );
      setGoals(updated);
      alert("Goal details updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Failed to update the goal. Check console for more info.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) return;
    try {
      await db.delete(StudyProject).where(eq(StudyProject.id, goalId));
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      alert("Goal deleted successfully!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. See console for more details.");
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl mt-8 max-w-6xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: "none" }}>
        <Modal setAppElement={"#__next"} />
      </div>

      {/* Notification Banner */}
      <motion.div
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 p-4 rounded-xl mb-6 shadow-md flex items-center justify-center"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        key={currentAlertIndex}
      >
        <span className="text-sm font-medium">{alerts[currentAlertIndex]}</span>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goals */}
        <motion.div
          className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Goals</h2>
          {recentGoals.length > 0 ? (
            <ul className="space-y-3">
              {recentGoals.map((goal) => (
                <motion.li
                  key={goal.id}
                  className="bg-gray-50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {goal.projectName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="bg-gradient-to-br from-blue-400 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium hover:from-blue-500 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
                    onClick={() => handleContinueGoal(goal.id)}
                  >
                    <FaPlay size={10} />
                    Continue
                  </button>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No recent goals found.</p>
          )}
        </motion.div>

        {/* Action Cards */}
        <motion.div
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Past Goals */}
          <motion.div
            className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            onClick={openPastGoalsModal}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Past Goals</h3>
              <p className="text-xs text-gray-500">View completed or expired goals</p>
            </div>
            <button className="bg-gradient-to-br from-red-400 to-red-600 text-white p-2 rounded-full hover:from-red-500 hover:to-red-700">
              <FaChevronRight size={12} />
            </button>
          </motion.div>

          {/* Edit Goals */}
          <motion.div
            className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            onClick={openEditModal}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Manage Goals</h3>
              <p className="text-xs text-gray-500">Edit or update goal details</p>
            </div>
            <button className="bg-gradient-to-br from-green-400 to-green-600 text-white p-2 rounded-full hover:from-green-500 hover:to-green-700">
              <FaEdit size={12} />
            </button>
          </motion.div>

          {/* All Goals */}
          <motion.div
            className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg flex items-center justify-between hover:bg-gray-50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            onClick={openAllGoalsModal}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All Projects</h3>
              <p className="text-xs text-gray-500">Browse all active goals</p>
            </div>
            <button className="bg-gradient-to-br from-purple-600 to-purple-400 text-white p-2 rounded-full hover:from-purple-700 hover:to-purple-500">
              <FaChevronDown size={12} />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Past Goals Modal */}
      <Modal
        isOpen={isPastGoalsModalOpen}
        onRequestClose={closePastGoalsModal}
        style={squareModalStyles}
      >
        <div className="relative flex flex-col h-full">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            onClick={closePastGoalsModal}
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Goals</h2>
          <div className="flex-1 overflow-y-auto">
            {completedGoals.length === 0 ? (
              <p className="text-gray-600 text-sm">No goals past their deadline.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {completedGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-2 truncate">
                        {goal.projectName}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {goal.description || "No description"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-xs text-gray-500">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                      <button
                        className="bg-gradient-to-br from-red-400 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:from-red-500 hover:to-red-700 flex items-center gap-2"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <FaTrash size={10} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        style={normalModalStyles}
      >
        <div className="relative flex flex-col items-center">
          <button
            className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
            onClick={closeEditModal}
          >
            <FaTimes size={16} />
          </button>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Goal</h3>
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Goal</label>
            <select
              value={selectedGoalId}
              onChange={(e) => handleSelectGoalToEdit(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select a goal</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.projectName} - {new Date(goal.deadline).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          {selectedGoalId && (
            <>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editGoalName}
                  onChange={(e) => setEditGoalName(e.target.value)}
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editGoalDescription}
                  onChange={(e) => setEditGoalDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editGoalDeadline}
                  onChange={(e) => setEditGoalDeadline(e.target.value)}
                />
              </div>
              <button
                className="bg-gradient-to-br from-red-400 to-red-600 text-white px-4 py-2 rounded-full text-sm mb-4 hover:from-red-500 hover:to-red-700 flex items-center gap-2"
                onClick={() => handleDeleteGoal(Number(selectedGoalId))}
              >
                <FaTrash size={12} />
                Delete Goal
              </button>
            </>
          )}
          <div className="flex justify-center gap-4">
            <button
              className="bg-gradient-to-br from-green-400 to-green-600 text-white px-6 py-2 rounded-full text-sm hover:from-green-500 hover:to-green-700 flex items-center gap-2"
              onClick={handleSaveGoalChanges}
            >
              <FaEdit size={12} />
              Save Changes
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-full text-sm hover:bg-gray-600"
              onClick={closeEditModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* All Goals Modal */}
      <Modal
        isOpen={isAllGoalsModalOpen}
        onRequestClose={closeAllGoalsModal}
        style={squareModalStyles}
      >
        <div className="relative flex flex-col h-full">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            onClick={closeAllGoalsModal}
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Projects</h2>
          <div className="flex-1 overflow-y-auto">
            {goals.length === 0 ? (
              <p className="text-gray-600 text-sm">No goals found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-2 truncate">
                        {goal.projectName}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {goal.description || "No description"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-xs text-gray-500">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white px-3 py-1 rounded-full text-xs hover:from-blue-500 hover:to-blue-700 flex items-center gap-2"
                          onClick={() => {
                            openEditModal();
                            handleSelectGoalToEdit(String(goal.id));
                          }}
                        >
                          <FaEdit size={10} />
                          Edit
                        </button>
                        <button
                          className="bg-gradient-to-br from-red-400 to-red-600 text-white px-3 py-1 rounded-full text-xs hover:from-red-500 hover:to-red-700 flex items-center gap-2"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <FaTrash size={10} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}