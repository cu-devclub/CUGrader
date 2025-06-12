package class

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) EditClassHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if err := cc.Utils.Verify_JWT(authHeader); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	classIDStr := c.PostForm("class_id")
	if classIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "class_id is required"})
		return
	}
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class_id"})
		return
	}

	updates := make(map[string]interface{})

	if courseIDStr := c.PostForm("course_id"); courseIDStr != "" {
		courseID, err := strconv.Atoi(courseIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course_id"})
			return
		}
		updates["course_id"] = courseID
	}

	if name := c.PostForm("name"); name != "" {
		updates["name"] = name
	}

	if semesterStr := c.PostForm("semester"); semesterStr != "" {
		semester, err := strconv.Atoi(semesterStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester"})
			return
		}
		updates["semester"] = semester
	}

	if yearStr := c.PostForm("year"); yearStr != "" {
		year, err := strconv.Atoi(yearStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
			return
		}
		updates["year"] = year
	}

	// จัดการภาพ
	imageFile, err := c.FormFile("image")
	if err == nil {
		savePath := "temp/" + imageFile.Filename
		if err := c.SaveUploadedFile(imageFile, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
		pic := "/temp/" + imageFile.Filename
		updates["picture_id"] = pic
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	err = cc.Service.EditClass(classID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
