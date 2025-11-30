package routes

import (
	"go-gin-games/controllers"
	"go-gin-games/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Auth
	api.POST("/auth/register", controllers.Register)
	api.POST("/auth/login", controllers.Login)

	// Public game routes
	api.GET("/games", controllers.GetGames)
	api.GET("/games/:id", controllers.GetGameByID)
	api.GET("/games/:id/reviews", controllers.GetReviewsForGame)

	// Protected
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())

	// Game routes
	protected.POST("/games", controllers.CreateGame)
	protected.DELETE("/games/:id", controllers.DeleteGame)

	// Review creation
	protected.POST("/games/:id/reviews", controllers.CreateReview)

	// Review deletion
	protected.DELETE("/reviews/:reviewId", controllers.DeleteReview)
}
