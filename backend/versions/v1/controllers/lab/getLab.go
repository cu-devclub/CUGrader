package lab

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (lc *LabController) GetLabByIDHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := lc.Service.Utils.GetJWTClaims(authHeader)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	labId := c.Param("lab_id")
	if labId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Lab ID is required"})
		return
	}

	var labIdInt int
	_, err = fmt.Sscanf(labId, "%d", &labIdInt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Lab ID format"})
		return
	}

	isEnrolledStudent, err := lc.Service.Model.CanStudentAccessLab(labIdInt, claims.UserID)
	isClassInstructor := lc.Service.Utils.IsUserTeacherAdminOrAssistantByLabID(labIdInt, claims.UserID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check lab access"})
		return
	}

	if !isEnrolledStudent && !isClassInstructor {
		c.JSON(http.StatusForbidden, gin.H{"message": "You do not have access to this lab"})
		return
	}

	if isClassInstructor {
		// More detailed lab information for instructors
		lab, err := lc.Service.GetLabByIdForInstructor(labIdInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lab"})
			return
		}
		if lab == nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Lab not found"})
			return
		}

		c.JSON(http.StatusOK, lab)
	}

	// If the user is a student, fetch the lab details for students
	lab, err := lc.Service.GetLabByIdForStudent(labIdInt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lab"})
		return
	}

	if lab == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Lab not found"})
		return
	}

	c.JSON(http.StatusOK, lab)
}
