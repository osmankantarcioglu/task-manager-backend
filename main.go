package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/osmankantarcioglu/task-manager-backend/database"
	"github.com/osmankantarcioglu/task-manager-backend/handlers"
	"github.com/osmankantarcioglu/task-manager-backend/middleware"
	"github.com/osmankantarcioglu/task-manager-backend/models"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(".env file is not loaded", err)
	}

	database.Connect()
	database.DB.AutoMigrate(&models.User{}) //
	database.DB.AutoMigrate(&models.Task{})

	app := fiber.New()

	// Add CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))

	app.Post("/register", handlers.Register)
	app.Post("/login", handlers.Login)
	app.Post("/tasks", middleware.Protected(), handlers.CreateTask)
	app.Get("/tasks", middleware.Protected(), handlers.GetTasks)
	app.Put("/tasks/:id", middleware.Protected(), handlers.UpdateTask)
	app.Delete("/tasks/:id", middleware.Protected(), handlers.DeleteTask)

	log.Println("Server starting on port 8080...")
	app.Listen(":8080")
}
