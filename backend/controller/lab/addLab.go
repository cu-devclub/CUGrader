package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	labStuct "cugrader/structure/lab"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AddLabHandler(c *gin.Context, params gen.CreateLabParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(401, gin.H{"message": "Unauthorized"})
		return
	}

	ClassId, err := strconv.Atoi(c.PostForm("ClassId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ClassId"})
		return
	}

	exist, err := utils.ClassIDExists(ClassId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while checking class existence: " + err.Error()})
		return
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	labDataStr := c.PostForm("lab_data")
	var labData labStuct.LabData
	err = json.Unmarshal([]byte(labDataStr), &labData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	req := labStuct.AddLab{ClassID: ClassId, LabData: labData}

	if req.LabData.ExamMode && (req.LabData.ExamPin == nil || *req.LabData.ExamPin < 0 || *req.LabData.ExamPin > 999999) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam pin must be a 6-digit number"})
		return
	}

	if req.LabData.PublishDate.After(req.LabData.DueDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Publish date must be before due date"})
		return
	}
	if len(req.LabData.Questions) < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Question number must be greater than 0"})
		return
	}

	allowed := utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID)
	if !allowed {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You don't have permission to add lab"})
		return
	}

	var addfiles []*multipart.FileHeader
	if f, err := c.MultipartForm(); err == nil && f != nil && f.File != nil {
		addfiles = f.File["addfiles"]
	}

	_, err = lab.AddLab(req.ClassID, req.LabData, addfiles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add lab: " + err.Error()})
		return
	}

	// Seem like the message is unnecessary, but keeping it for consistency
	c.JSON(http.StatusOK, gin.H{"message": "Lab added successfully"})
}
