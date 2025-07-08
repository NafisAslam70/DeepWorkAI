import { db } from "@/utils/db";
import { StudyProject } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

// Fetch all goals created by a specific user
export const fetchUserGoals = async (userEmail) => {
    try {
        if (userEmail) {
            const fetchedGoals = await db
                .select()
                .from(StudyProject)
                .where(eq(StudyProject.createdBy, userEmail));
            return fetchedGoals;
        }
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
    }
};

// Fetch or create the random goal for the user
export const fetchRandomGoal = async () => {
    try {
        const randomGoal = await db
            .select()
            .from(StudyProject)
            .where(and(
                eq(StudyProject.projectName, "random_goal"),
                eq(StudyProject.createdBy, "system")
            ))
            .limit(1);

        if (randomGoal.length > 0) {
            return randomGoal[0].id;
        } else {
            throw new Error("Random goal not found");
        }
    } catch (error) {
        console.error("Error fetching random goal:", error);
        throw error;
    }
};

// Create a new goal
export const createNewGoal = async (newGoalData, userEmail) => {
    try {
        const existingGoals = await db
            .select()
            .from(StudyProject)
            .where(eq(StudyProject.createdBy, userEmail));

        const goalWithSameName = existingGoals.find(
            goal => goal.projectName.toLowerCase() === newGoalData.projectName.toLowerCase()
        );

        if (goalWithSameName) {
            throw new Error("A goal with this name already exists. Please choose a different name.");
        }

        await db.insert(StudyProject).values(newGoalData);

        // Fetch the newly created goal by projectName and createdBy
        const insertedGoal = await db
            .select()
            .from(StudyProject)
            .where(and(
                eq(StudyProject.projectName, newGoalData.projectName),
                eq(StudyProject.createdBy, userEmail)
            ))
            .limit(1);

        if (insertedGoal.length > 0) {
            return insertedGoal[0].id;
        } else {
            throw new Error("Failed to retrieve the new goal ID.");
        }
    } catch (error) {
        console.error("Error creating new goal:", error);
        throw error;
    }
};
