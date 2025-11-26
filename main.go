package main

import (
    "log"
    "os"

    "go-gin-games/config"
    "go-gin-games/routes"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using system environment variables")
    }

    config.ConnectDB()

    r := gin.Default()
    r.MaxMultipartMemory = 2 << 20 // 2 MB

    // 1) First: register API routes under /api
    routes.RegisterRoutes(r)

    // 2) Then: serve the frontend
    // Single-page: / -> index.html
    r.GET("/", func(c *gin.Context) {
        c.File("./public/index.html")
    })

    // If you later have CSS/JS/images, serve them like this:
    r.Static("/static", "./public")

    port := os.Getenv("APP_PORT")
    if port == "" {
        port = "8080"
    }

    log.Println("Server running on port", port)
    if err := r.Run(":" + port); err != nil {
        log.Fatal("Failed to run server: ", err)
    }
}
