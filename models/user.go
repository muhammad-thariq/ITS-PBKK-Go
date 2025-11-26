package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Email        string    `gorm:"size:100;not null;unique" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`

	// Tell GORM which field on Game is the FK
	Games   []Game   `gorm:"foreignKey:UploadedByID" json:"-"`
	// This one GORM can infer (because Review has UserID), but we make it explicit:
	Reviews []Review `gorm:"foreignKey:UserID" json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
