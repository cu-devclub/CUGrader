package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	labStuct "cugrader/structure/lab"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func EditLabHandler(c *gin.Context, params gen.UpdateLabParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(401, gin.H{"message": "Unauthorized"})
		return
	}

	LabID, err := strconv.Atoi(c.PostForm("LabId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid LabId"})
		return
	}

	exist, err := utils.LabIDExists(LabID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while checking lab existence: " + err.Error()})
		return
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"message": "Lab not found"})
		return
	}

	labDataStr := c.PostForm("lab_data")
	var labData labStuct.EditLabData
	err = json.Unmarshal([]byte(labDataStr), &labData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	req := labStuct.EditLab{LabID: LabID, LabData: labData}

	allowed := utils.IsUserTeacherAdminOrAssistantByLabID(req.LabID, claims.UserID)
	if !allowed {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "You don't have permission to edit this lab"})
		return
	}

	err = lab.EditLab(req.LabID, req.LabData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to edit lab: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lab edited successfully"})
}
