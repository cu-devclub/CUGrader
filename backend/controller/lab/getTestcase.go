package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetTestcaseCodeByTestcaseIDHandler(c *gin.Context, testCaseId gen.TestCaseId, params gen.GetTestcaseInfomationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var isAssistant bool
	// Check access permissions (admin/teacher have full access)
	if claims.Role != "teacher" && claims.Role != "admin" {
		// For non-admin/teacher users, check if they have access via assistant role or student assignment
		isAssistant, err = utils.IsUserAnAssistantToTestcase(testCaseId, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
			return
		}

		if !isAssistant {
			isAssigned, err := utils.IsStudentAssignedToLabByTestcaseID(claims.UserID, testCaseId)
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

	with_secret := isAssistant || claims.Role == "teacher" || claims.Role == "admin"

	testcaseCode, err := lab.GetTestcaseCodeByTestcaseID(testCaseId, with_secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get testcase code"})
		return
	}

	if testcaseCode == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Testcase not found"})
		return
	}

	c.JSON(http.StatusOK, testcaseCode)
}

func GetMultilangTestcaseCodeByQuestionIDHandler(c *gin.Context, questionId gen.QuestionId, params gen.GetMultilanguageTestcaseInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	var isAssistant bool
	// isGetSecretTestcase := false
	if claims.Role != "teacher" && claims.Role != "admin" {
		isAssistant, err := utils.IsUserAnAssistantToQuestion(questionId, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check access"})
			return
		}

		if !isAssistant {
			isAssigned, err := utils.IsStudentAssignedToQuestion(claims.UserID, questionId)
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

	with_secret := isAssistant || claims.Role == "teacher" || claims.Role == "admin"

	testcase, err := lab.GetMultilangTestcaseByQuestionID(questionId, with_secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get testcase code: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, testcase)
}
