package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetTestcaseCodeByTestcaseIDHandler(c *gin.Context, testCaseId gen.TestCaseId, params gen.GetTestcaseInfomationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
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
		isAssistant, err := utils.IsUserAnAssistantToTestcase(testcaseID, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
			return
		}

		if !isAssistant {
			isAssigned, err := utils.IsStudentAssignedToLabByTestcaseID(claims.UserID, testcaseID)
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

	testcaseCode, err := lab.GetTestcaseCodeByTestcaseID(testcaseID)
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

func GetMultilangTestcaseCodeByQuestionIDHandler(c *gin.Context, questionId gen.QuestionId, params gen.GetMultilanguageTestcaseInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	questionIDStr := c.Param("questionId")
	questionID, err := strconv.Atoi(questionIDStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid question_id"})
		return
	}

	isGetSecretTestcase := false
	if claims.Role != "teacher" && claims.Role != "admin" {
		isAssistant, err := utils.IsUserAnAssistantToQuestion(questionID, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
			return
		}

		if !isAssistant {
			isAssigned, err := utils.IsStudentAssignedToQuestion(claims.UserID, questionID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
				return
			}

			if !isAssigned {
				c.JSON(http.StatusForbidden, gin.H{"message": "You do not have access to this question"})
				return
			}
		}
	}

	testcase, err := lab.GetMultilangTestcaseByQuestionID(questionID, isGetSecretTestcase)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get testcase code"})
		return
	}

	c.JSON(http.StatusOK, testcase)
}
