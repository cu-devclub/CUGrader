package lab

import (
	"net/http"

	"github.com/gin-gonic/gin"

	labModel "CUGrader/backend/versions/v1/models/lab"
)

func (lc *LabController) EditLabHandler(c *gin.Context) {
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

	type EditLabRequest struct {
		LabID   int                   `json:"lab_id" binding:"required"`
		LabData labModel.LabEditModel `json:"lab_data" binding:"required"`
	}

	var req EditLabRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data: " + err.Error()})
		return
	}

	err = lc.Service.EditLab(req.LabID, req.LabData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to edit lab: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lab edited successfully"})
}
