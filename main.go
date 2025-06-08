package main

import (
	"github.com/joho/godotenv"
	"github.com/osmankantarcioglu/task-manager-backend/database"
	"github.com/osmankantarcioglu/task-manager-backend/models"
)

func main() {

	godotenv.Load()
	database.Connect()

	database.DB.AutoMigrate(&models.User{}) //
}
