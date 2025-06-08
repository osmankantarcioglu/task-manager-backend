package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/osmankantarcioglu/task-manager-backend/database"
	"github.com/osmankantarcioglu/task-manager-backend/handlers"
	"github.com/osmankantarcioglu/task-manager-backend/models"
	"log"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal(".env file is not loaded", err)
	}

	database.Connect()
	database.DB.AutoMigrate(&models.User{}) //

	app := fiber.New()

	app.Post("/register", handlers.Register)
	app.Post("/login", handlers.Login)

	app.Listen(":3000")
}
