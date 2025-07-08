// fetchFocusStats.js
import { db } from "@/utils/db";
import { StudySession } from "@/utils/schema";

export const fetchFocusStats = async () => {
  try {
    const sessions = await db
      .select()
      .from(StudySession)
      .orderBy('sessionNo') // Customize ordering as needed

    const focusStats = sessions.map((session) => ({
      id: session.id,
      sessionNo: session.sessionNo,
      focusTime: session.focusTime,
      drowsyTime: session.drowsyTime,
    }));

    return focusStats;
  } catch (error) {
    console.error("Error fetching focus stats:", error);
    return [];
  }
};
