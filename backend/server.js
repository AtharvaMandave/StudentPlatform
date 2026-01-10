import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDb();

        // Start server
        const server = app.listen(env.PORT, () => {
            console.log("\n🚀 Server Information:");
            console.log(`   Environment: ${env.NODE_ENV}`);
            console.log(`   Port: ${env.PORT}`);
            console.log(`   Health Check: http://localhost:${env.PORT}/api/health`);
            console.log(`   Auth API: http://localhost:${env.PORT}/api/auth`);
            console.log("\n✅ Server is running successfully!\n");
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            console.error("❌ UNHANDLED REJECTION! Shutting down...");
            console.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("👋 SIGTERM received. Shutting down gracefully...");
            server.close(() => {
                console.log("✅ Process terminated!");
            });
        });

        process.on("SIGINT", () => {
            console.log("\n👋 SIGINT received. Shutting down gracefully...");
            server.close(() => {
                console.log("✅ Process terminated!");
                process.exit(0);
            });
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
