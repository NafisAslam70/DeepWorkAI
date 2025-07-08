// fetchGoalStats.js
import { db } from "@/utils/db";
import { StudyProject, StudySession } from "@/utils/schema";

export const fetchGoalStats = async () => {
  try {
    const goals = await db
      .select()
      .from(StudyProject)
      .orderBy('id'); // Customize ordering as needed

    const goalStats = await Promise.all(goals.map(async (goal) => {
      const completedSessionsResult = await db
        .select()
        .from(StudySession)
        .where('projectId', goal.id)
        .andWhere('status', 'completed')
        .count()
        .single();

      return {
        id: goal.id,
        projectName: goal.projectName,
        description: goal.description,
        completedSessions: completedSessionsResult.count || 0,
        status: completedSessionsResult.count ? 'In Progress' : 'Not Started',
      };
    }));

    return goalStats;
  } catch (error) {
    console.error("Error fetching goal stats:", error);
    return [];
  }
};
