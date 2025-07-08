import { db } from "@/utils/db";
import { StudyProject } from "@/utils/schema";
import { eq, and } from "drizzle-orm";

// Function to initialize the random goal for a specific user if it doesn't exist
export async function initializeRandomGoal(userEmail) {
  try {
    // Check if the user's random goal already exists
    const existingRandomGoal = await db
      .select()
      .from(StudyProject)
      .where(and(
        eq(StudyProject.projectName, "random_goal"),
        eq(StudyProject.createdBy, userEmail)
      ));

    // If no random goal exists for this user, create it
    if (existingRandomGoal.length === 0) {
      const randomGoalData = {
        projectName: "random_goal",
        description: "This is used for random study sessions not tied to any specific goal.",
        deadline: new Date(2099, 11, 31),  // Arbitrary far future date for the deadline
        createdBy: userEmail,  // Set the user's email here
      };
      await db.insert(StudyProject).values(randomGoalData);
      console.log(`Random goal initialized for ${userEmail} successfully.`);
    } else {
      console.log(`Random goal for ${userEmail} already exists, skipping creation.`);
    }
  } catch (error) {
    console.error("Error initializing random goal:", error);
  }
}
