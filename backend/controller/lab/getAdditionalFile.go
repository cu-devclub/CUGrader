package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"

	"github.com/gin-gonic/gin"
)

func GetAdditionalFileByIDHandler(c *gin.Context, addFileId gen.AddFileId, params gen.GetAdditionalFileContentParams) {
	// TODO: add authen
	contentType, data, err := lab.GetAdditionalFileByID(addFileId)
	if err != nil {
		c.JSON(404, gin.H{"message": "Additional file(s) not found"})
		return
	}

	c.Data(200, contentType, data)
}
