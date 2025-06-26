package question

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (qc *QuestionController) GetTestcaseCodeByTestcaseIDHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := qc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	testcaseIDStr := c.Param("testcaseId")
	testcaseID, err := strconv.Atoi(testcaseIDStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid testcase_id"})
		return
	}

	// Check access permissions (admin/teacher have full access)
	if claims.Role != "teacher" && claims.Role != "admin" {
		// For non-admin/teacher users, check if they have access via assistant role or student assignment
		isAssistant, err := qc.Service.Utils.IsUserAnAssistantToTestcase(testcaseID, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
			return
		}

		if !isAssistant {
			isAssigned, err := qc.Service.Utils.IsStudentAssignedToLabByTestcaseID(claims.UserID, testcaseID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
				return
			}

			if !isAssigned {
				c.JSON(http.StatusForbidden, gin.H{"message": "You do not have access to this testcase"})
				return
			}
		}
	}

	testcaseCode, err := qc.Service.GetTestcaseCodeByTestcaseID(testcaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get testcase code"})
		return
	}

	if testcaseCode == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Testcase not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"testcase": testcaseCode.Testcase})
}
