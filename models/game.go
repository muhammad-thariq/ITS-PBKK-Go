package models

import "time"

type Game struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `gorm:"size:255;not null" json:"title"`
	Genre       string `gorm:"size:100" json:"genre"`
	ReleaseYear *int   `json:"release_year"`
	Description string `gorm:"type:text" json:"description"`
	Cover       string `json:"cover"`

	// FK to User
	UploadedByID uint `json:"uploaded_by_id"`
	UploadedBy   User `json:"uploaded_by" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	// 1 Game -> many Reviews
	Reviews []Review `json:"reviews,omitempty" gorm:"constraint:OnDelete:CASCADE;"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
