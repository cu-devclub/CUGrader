package router

import (
	gen "cugrader/api-gen"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GradeUsersCode(c *gin.Context, params gen.GradeUsersCodeParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) SaveCodeToSystem(c *gin.Context, params gen.SaveCodeToSystemParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) GetCodeFromSystem(c *gin.Context, questionId gen.QuestionId, params gen.GetCodeFromSystemParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) GetGradedReult(c *gin.Context, submissionId gen.SubmissionId, params gen.GetGradedReultParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}
