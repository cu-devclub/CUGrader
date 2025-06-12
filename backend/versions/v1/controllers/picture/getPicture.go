package picture

import (
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (cc *PictureController) GetPicture(c *gin.Context) {
	pictureID := c.Param("picture_id")
	if pictureID == "" {
		c.JSON(400, gin.H{"message": "Picture ID is required"})
		return
	}

	// is pictureID a number?
	if _, err := strconv.Atoi(pictureID); err != nil {
		c.JSON(400, gin.H{"message": "Invalid Picture ID format"})
		return
	}

	fullName := filepath.Join("temp", pictureID+".png")

	if _, err := filepath.Abs(fullName); err != nil {
		c.JSON(500, gin.H{"message": "Internal server error"})
		return
	}
	// Check if the file exists
	if _, err := filepath.Abs(fullName); err != nil {
		c.JSON(404, gin.H{"message": "File not found"})
		return
	}

	c.File(fullName)
}
