package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetLabByIDHandler(c *gin.Context, labId gen.LabId, params gen.GetLabInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	exist, err := utils.LabIDExists(labId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while checking lab existence: " + err.Error()})
		return
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"message": "Lab not found"})
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
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lab"})
			return
		}

		c.JSON(http.StatusOK, lab)
		return
	}

	// If the user is a student, fetch the lab details for students
	lab, err := lab.GetLabByIdForStudent(labId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lab"})
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

	exist, err := utils.ClassIDExists(classId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Error while checking class existence: " + err.Error()})
		return
	}
	if !exist {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	role := claims.Role
	userID := claims.UserID

	labs, err := lab.GetLabs(classId, userID, role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch labs"})
		return
	}

	ctx.JSON(http.StatusOK, labs)
}
