package controllers

import (
	"errors"
	"net/http"

	"go-gin-games/config"
	"go-gin-games/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateReviewInput struct {
	Rating int    `json:"rating" binding:"required"`
	Body   string `json:"body"`
}

// POST /api/games/:id/reviews
func CreateReview(c *gin.Context) {
	gameID := c.Param("id")

	currentUserIDVal, exists := c.Get("currentUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := currentUserIDVal.(uint)

	// check game exists
	var game models.Game
	if err := config.DB.First(&game, gameID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch game"})
		return
	}

	var input CreateReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Rating < 1 || input.Rating > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rating must be between 1 and 10"})
		return
	}

	review := models.Review{
		Rating: input.Rating,
		Body:   input.Body,
		UserID: userID,
		GameID: game.ID,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	config.DB.Preload("User").First(&review, review.ID)

	c.JSON(http.StatusCreated, gin.H{"data": review})
}

// GET /api/games/:id/reviews
func GetReviewsForGame(c *gin.Context) {
	gameID := c.Param("id")

	var reviews []models.Review
	if err := config.DB.Where("game_id = ?", gameID).Preload("User").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reviews})
}
