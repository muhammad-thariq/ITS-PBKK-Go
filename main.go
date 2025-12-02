package main

import (
	"log"
	"os"
	"time"

	"go-gin-games/config"
	"go-gin-games/routes"

	"github.com/gin-contrib/cors" // Imported
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config.ConnectDB()

	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20 // 8 MB

	// --- 1. ENABLE CORS (Allow Next.js) ---
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// --- 2. SERVE IMAGES ---
	r.Static("/uploads", "./uploads")

	routes.RegisterRoutes(r)

	// Keep existing fallback for safety, though Next.js handles frontend now
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Go Backend is Running. Visit http://localhost:3000 for the App."})
	})

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}