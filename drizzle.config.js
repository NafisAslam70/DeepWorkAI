/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview_owner:EC7yAMQGzrJ4@ep-shiny-bonus-a5pcmugw.us-east-2.aws.neon.tech/deep-work-app?sslmode=require',
    }
  };