package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/osmankantarcioglu/task-manager-backend/database"
	"github.com/osmankantarcioglu/task-manager-backend/models"
)

func CreateTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	type TaskInput struct {
		Title       string `json:"title"`
		Description string `json:"description"`
	}

	var taskInput TaskInput
	if err := c.BodyParser(&taskInput); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	task := models.Task{
		Title:       taskInput.Title,
		Description: taskInput.Description,
		UserID:      userID,
		Done:        false,
	}

	if err := database.DB.Create(&task).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(task)

}
