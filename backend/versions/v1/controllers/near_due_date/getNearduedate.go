package nearduedate

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (lc *NearDueDateController) GetNearDueDateHandler(c *gin.Context) {
	labs, err := lc.Service.GetAllLabsNearDue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "internal error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"labs": labs,
	})
}
