package user

import (
	gen "cugrader/api-gen"
	"cugrader/logic/user"

	"github.com/gin-gonic/gin"
)

func GetPicture(c *gin.Context, pictureId gen.PictureId) {
	contentType, data, err := user.GetPictureByID(pictureId)
	if err != nil {
		c.JSON(404, gin.H{"message": "Picture not found"})
		return
	}
	c.Data(200, contentType, data)
}
