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

func GetTasks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var tasks []models.Task
	if err := database.DB.Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
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
	}

	var input UpdateInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Sadece gelen alanları güncelle
	if input.Title != "" {
		task.Title = input.Title
	}
	if input.Description != "" {
		task.Description = input.Description
	}
	if input.Done != nil {
		task.Done = *input.Done
	}

	if err := database.DB.Save(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(task)
}
