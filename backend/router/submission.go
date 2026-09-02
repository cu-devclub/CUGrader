package router

import (
	gen "cugrader/api-gen"
	"cugrader/controller/submission"

	"github.com/gin-gonic/gin"
)

func (s *Server) GradeUsersCode(c *gin.Context, params gen.GradeUsersCodeParams) {
	submission.GradeUsersCode(c, params)
}

func (s *Server) SaveCodeToSystem(c *gin.Context, params gen.SaveCodeToSystemParams) {
	submission.SaveCodeToSystem(c, params)
}

func (s *Server) GetCodeFromSystem(c *gin.Context, questionId gen.QuestionId, params gen.GetCodeFromSystemParams) {
	submission.GetCodeFromSystem(c, questionId, params)
}

func (s *Server) GetGradedReult(c *gin.Context, submissionId gen.SubmissionId, params gen.GetGradedReultParams) {
	submission.GetGradedReult(c, submissionId, params)
}
