package lab

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (lc *LabController) AddLabHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := lc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(401, gin.H{"message": "Unauthorized"})
		return
	}

	type AddLabLabData struct {
		QuestionNumber  int       `json:"number" binding:"required"`
		Name            string    `json:"name" binding:"required"`
		PublishDate     time.Time `json:"publish" binding:"required"`
		DueDate         time.Time `json:"due" binding:"required"`
		CloseOnDue      bool      `json:"close_on_due" binding:"required"`
		ExamMode        bool      `json:"exam_mode" binding:"required"`
		ShowScoreOnLock bool      `json:"show_score_on_lock" binding:"required"`
		ExamPin         int       `json:"exam_pin" binding:"required"` // 6 digits with leading zeroes
		Testcase        string    `json:"testcase" binding:"required"`
		SecretTestcase  string    `json:"secret_testcase" binding:"required"`
	}

	type AddLabRequest struct {
		ClassID int           `json:"class_id" binding:"required"`
		LabData AddLabLabData `json:"lab_data" binding:"required"`
	}

	var req AddLabRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	if req.LabData.ExamPin < 0 || req.LabData.ExamPin > 999999 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam pin must be a 6-digit number"})
		return
	}
	if req.LabData.PublishDate.After(req.LabData.DueDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Publish date must be before due date"})
		return
	}
	if req.LabData.QuestionNumber < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Question number must be greater than 0"})
		return
	}

	allowed := lc.Service.Utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID)
	if !allowed {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You don't have permission to add lab"})
		return
	}

	_, err = lc.Service.AddLab(
		req.ClassID,
		req.LabData.QuestionNumber,
		req.LabData.Name,
		req.LabData.PublishDate,
		req.LabData.DueDate,
		req.LabData.CloseOnDue,
		req.LabData.ExamMode,
		req.LabData.ShowScoreOnLock,
		req.LabData.ExamPin,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add lab: " + err.Error()})
		return
	}

	// Seem like the message is unnecessary, but keeping it for consistency
	c.JSON(http.StatusOK, gin.H{"message": "Lab added successfully"})
}
