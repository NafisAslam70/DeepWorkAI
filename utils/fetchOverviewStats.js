// fetchOverviewStats.js
import { db } from "@/utils/db";

export const fetchOverviewStats = async () => {
  const totalGoals = await db.study_project.count(); // Example function
  const totalSessions = await db.study_session.count(); 
  const totalFocusTime = await db.study_session.sum('focusTime');

  return { totalGoals, totalSessions, totalFocusTime };
};
