package exampin

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (pc *PinController) GetExamPinHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	_, err := pc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	labIDStr := c.Param("lab_id")
	labID, err := strconv.Atoi(labIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lab_id"})
		return
	}

	examPin, err := pc.Service.GetExamPin(labID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lab not found or exam mode not enabled"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exam_pin": examPin})
}
