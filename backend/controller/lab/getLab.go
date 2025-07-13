package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetLabByIDHandler(c *gin.Context, labId gen.LabId, params gen.GetLabInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	isEnrolledStudent, err := utils.IsStudentAssignedToLabID(claims.UserID, labId)
	isClassInstructor := utils.IsUserTeacherAdminOrAssistantByLabID(labId, claims.UserID)

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
		lab, err := lab.GetLabByIdForInstructor(labId)
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
	lab, err := lab.GetLabByIdForStudent(labId)

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

func GetLabsByClassIDHandler(ctx *gin.Context, classId gen.ClassId, params gen.GetLabsInClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	if claims.Role != "teacher" && claims.Role != "admin" && claims.Role != "student" {
		ctx.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to access this resource"})
		return
	}

	role := claims.Role
	userID := claims.UserID

	classIDStr := ctx.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	labs, err := lab.GetLabs(classID, userID, role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch labs"})
		return
	}

	ctx.JSON(http.StatusOK, labs)
}
