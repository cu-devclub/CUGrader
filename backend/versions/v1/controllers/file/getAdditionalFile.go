package file

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func (ac *AdditionalFileController) GetAdditionalFileByIDHandler(c *gin.Context) {
	additionalFileIDStr := c.Param("addfile_id")
	if additionalFileIDStr == "" {
		c.JSON(400, gin.H{"message": "Additional File ID is required"})
		return
	}

	additionalFileID, err := strconv.Atoi(additionalFileIDStr)
	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid Additional File ID format"})
		return
	}

	contentType, data, err := ac.Service.GetAdditionalFileByID(additionalFileID)
	if err != nil {
		c.JSON(404, gin.H{"message": "Additional file(s) not found"})
		return
	}

	c.Data(200, contentType, data)
}
