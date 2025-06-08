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
		Done        bool   `json:"done"`
		Position    int    `json:"position"`
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
		Done:        taskInput.Done,
		Position:    taskInput.Position,
	}

	if err := database.DB.Create(&task).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(task)
}

func GetTasks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var tasks []models.Task
	if err := database.DB.Where("user_id = ?", userID).Order("position").Find(&tasks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(tasks)
}

func UpdateTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	taskID := c.Params("id")

	var task models.Task
	if err := database.DB.First(&task, "id = ? AND user_id = ?", taskID, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	type UpdateInput struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Done        *bool  `json:"done"`
		Position    *int   `json:"position"`
	}

	var input UpdateInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if input.Title != "" {
		task.Title = input.Title
	}
	if input.Description != "" {
		task.Description = input.Description
	}
	if input.Done != nil {
		task.Done = *input.Done
	}
	if input.Position != nil {
		task.Position = *input.Position
	}

	if err := database.DB.Save(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(task)
}

func DeleteTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	taskID := c.Params("id")

	var task models.Task
	if err := database.DB.First(&task, "id = ? AND user_id = ?", taskID, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if err := database.DB.Delete(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Task deleted",
	})
}

func ReorderTasks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	type ReorderInput struct {
		TaskIDs []uint `json:"taskIds"`
	}

	var input ReorderInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Update positions for each task
	for position, taskID := range input.TaskIDs {
		var task models.Task
		if err := tx.First(&task, "id = ? AND user_id = ?", taskID, userID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Task not found",
			})
		}

		task.Position = position
		if err := tx.Save(&task).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tasks reordered successfully",
	})
}
