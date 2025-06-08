package models

import "gorm.io/gorm"

type User struct {
	gorm.Model //automatically create ID, CreatedAt, UpdatedAt, DeletedAt
	Username   string
	Password   string
}
