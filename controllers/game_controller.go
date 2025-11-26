package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"go-gin-games/config"
	"go-gin-games/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateGame(c *gin.Context) {
	currentUserIDVal, exists := c.Get("currentUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := currentUserIDVal.(uint)

	title := c.PostForm("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	genre := c.PostForm("genre")
	description := c.PostForm("description")

	releaseYearStr := c.PostForm("release_year")
	var releaseYear *int
	if releaseYearStr != "" {
		ry, err := strconv.Atoi(releaseYearStr)
		if err != nil || ry < 1970 || ry > 2100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "release_year must be an integer between 1970 and 2100"})
			return
		}
		releaseYear = &ry
	}

	// handle cover upload (optional)
	var coverPath string
	file, err := c.FormFile("cover")
	if err == nil {
		const maxSize = 2 << 20 // 2MB
		if file.Size > maxSize {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cover file is too large (max 2MB)"})
			return
		}

		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
		uploadPath := filepath.Join("uploads", filename)

		if err := c.SaveUploadedFile(file, uploadPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save cover file"})
			return
		}

		coverPath = uploadPath
	}

	game := models.Game{
		Title:       title,
		Genre:       genre,
		ReleaseYear: releaseYear,
		Description: description,
		Cover:       coverPath,
		UploadedByID: userID,
	}

	if err := config.DB.Create(&game).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create game"})
		return
	}

	// preload uploader
	config.DB.Preload("UploadedBy").First(&game, game.ID)

	c.JSON(http.StatusCreated, gin.H{"data": game})
}

func GetGames(c *gin.Context) {
	var games []models.Game
	if err := config.DB.Preload("UploadedBy").Preload("Reviews.User").Find(&games).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch games"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": games})
}

func GetGameByID(c *gin.Context) {
	id := c.Param("id")

	var game models.Game
	err := config.DB.Preload("UploadedBy").Preload("Reviews.User").First(&game, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch game"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": game})
}

func DeleteGame(c *gin.Context) {
	id := c.Param("id")

	currentUserIDVal, exists := c.Get("currentUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := currentUserIDVal.(uint)

	var game models.Game
	err := config.DB.First(&game, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch game"})
		return
	}

	if game.UploadedByID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own games"})
		return
	}

	if err := config.DB.Delete(&game).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete game"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game deleted"})
}
