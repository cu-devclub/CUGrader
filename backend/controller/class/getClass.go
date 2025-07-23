package class

import (
	gen "cugrader/api-gen"
	"cugrader/logic/class"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetClassInformation(c *gin.Context, classId gen.ClassId, params gen.GetClassInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	exist, err := utils.ClassIDExists(classId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while checking class existence: " + err.Error()})
		return
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	if !utils.IsUserCanAccessClass(classId, claims.UserID) {
		c.JSON(403, gin.H{"error": "You dont have permission"})
		return
	}

	class, err := class.GetClassInformation(int(classId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while getting class information: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, class)
}
