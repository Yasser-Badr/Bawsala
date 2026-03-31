// المسار: models/schema.go
package models

import (
	"time"
)

type Category struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"unique;not null"`
	Slug        string `gorm:"unique;not null"`
	Description string
	Articles    []Article
	Admins      []User `gorm:"many2many:user_categories;"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type Article struct {
	ID          uint   `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Slug        string `gorm:"unique;not null"`
	Content     string `gorm:"type:text;not null"`
	ImageURL    string
	VideoURL    string
	IsPublished bool `gorm:"default:false"`
	Views       int  `gorm:"default:0"`

	CategoryID uint
	Category   Category `gorm:"foreignKey:CategoryID"`

	AuthorID  uint `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type User struct {
	ID         uint       `gorm:"primaryKey"`
	Name       string     `gorm:"not null"`
	Email      string     `gorm:"unique;not null"`
	Password   string     `gorm:"not null"`
	Role       string     `gorm:"default:'editor'"`
	Articles   []Article  `gorm:"foreignKey:AuthorID"`
	Categories []Category `gorm:"many2many:user_categories;"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
