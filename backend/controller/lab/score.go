package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetStudentLabScore(c *gin.Context, labId gen.LabId, params gen.GetStudentLabScoreParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(401, gin.H{"message": "Unauthorized"})
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

	allowed := utils.IsUserTeacherAdminOrAssistantByLabID(labId, claims.UserID)
	if !allowed {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "You don't have permission to get score of this lab"})
		return
	}

	Scores, err := lab.GetLabScoreJSON(labId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get lab score: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, Scores)
}
