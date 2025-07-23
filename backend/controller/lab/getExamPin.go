package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetExaminationPin(c *gin.Context, labId gen.LabId, params gen.GetExaminationPinParams) {
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

	allowed := utils.IsUserTeacherAdminOrAssistantByLabID(labId, claims.UserID)
	if !allowed {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "You don't have permission to edit this lab"})
		return
	}

	pin, err := lab.GetExaminationPin(labId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to get examination pin: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exam_pin": pin})
}
