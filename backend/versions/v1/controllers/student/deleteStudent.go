package student

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type deleteStudentRequest struct {
	ClassID int `json:"class_id"`
	UserID  int `json:"user_id"`
}

func (sc *StudentController) DeleteStudentHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := sc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req deleteStudentRequest

	if err := c.ShouldBindJSON(&req); err != nil || req.ClassID <= 0 || req.UserID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if allow := sc.Service.Utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = sc.Service.DeleteStudent(req.ClassID, req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
