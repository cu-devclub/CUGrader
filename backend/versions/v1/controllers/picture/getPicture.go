package picture

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func (pc *PictureController) GetPicture(c *gin.Context) {
	pictureID := c.Param("pictureId")
	if pictureID == "" {
		c.JSON(400, gin.H{"message": "Picture ID is required"})
		return
	}

	picture_id, err := strconv.Atoi(pictureID)
	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid Picture ID format"})
		return
	}

	contentType, data, err := pc.Service.GetPictureByID(picture_id)
	if err != nil {
		c.JSON(404, gin.H{"message": "Picture not found"})
		return
	}
	c.Data(200, contentType, data)
}
