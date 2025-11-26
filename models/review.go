package models

import "time"

type Review struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Rating int    `gorm:"not null" json:"rating"`
	Body   string `gorm:"type:text" json:"body"`

	UserID uint `json:"user_id"`
	User   User `json:"user"`

	GameID uint `json:"game_id"`
	Game   Game `json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
