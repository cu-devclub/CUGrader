package lab

import (
	"net/http"
	"strconv"
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

	if claims.Role != "teacher" && claims.Role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No permission"})
		return
	}

	type AddLabLabData struct {
		QuestionNumber  int       `json:"number" binding:"required"`
		PublishDate     time.Time `json:"publish" binding:"required"`
		DueDate         time.Time `json:"due" binding:"required"`
		CloseOnDueDate  bool      `json:"close_on_due" binding:"required"`
		ExamMode        bool      `json:"exam_mode" binding:"required"`
		ShowScoreOnLock bool      `json:"show_score_on_lock" binding:"required"`
		ExamPin         string    `json:"exam_pin" binding:"required"`
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

	_, err = lc.Service.AddLab(
		req.ClassID,
		req.LabData.QuestionNumber,
		"Lab "+strconv.Itoa(req.LabData.QuestionNumber), // TODO(ptsgrn): seem like the spec didn't require name but we need to add it?      // TODO(ptsgrn): seem like the spec didn't require name but we need to add it?
		req.LabData.PublishDate,
		req.LabData.DueDate,
		req.LabData.CloseOnDueDate,
		req.LabData.ExamMode,
		req.LabData.ShowScoreOnLock,
		req.LabData.ExamPin,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add lab: " + err.Error()})
		return
	}

	// TODO(ptsgrn): spec expect to return some string (?) here (type: string, no schema?)
	c.JSON(http.StatusOK, gin.H{"message": "Lab added successfully"})
}
