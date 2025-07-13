package router

import (
	gen "cugrader/api-gen"
	"cugrader/controller/lab"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) UpdateLab(c *gin.Context, params gen.UpdateLabParams) {
	lab.EditLabHandler(c, params)
}

func (s *Server) CreateLab(c *gin.Context, params gen.CreateLabParams) {
	lab.AddLabHandler(c, params)
}

func (s *Server) GetLabInformation(c *gin.Context, labId gen.LabId, params gen.GetLabInformationParams) {
	lab.GetLabByIDHandler(c, labId, params)
}

func (s *Server) GetLabsInClass(c *gin.Context, classId gen.ClassId, params gen.GetLabsInClassParams) {
	lab.GetLabsByClassIDHandler(c, classId, params)
}

func (s *Server) GetNearDueDateLabs(c *gin.Context, params gen.GetNearDueDateLabsParams) {
	lab.GetNearDueDateHandler(c, params)
}

func (s *Server) DeleteAdditionalFile(c *gin.Context, addFileId gen.AddFileId, params gen.DeleteAdditionalFileParams) {
	lab.DeleteAdditionalFileByIDHandler(c, addFileId, params)
}

func (s *Server) GetAdditionalFileContent(c *gin.Context, addFileId gen.AddFileId, params gen.GetAdditionalFileContentParams) {
	lab.GetAdditionalFileByIDHandler(c, addFileId, params)
}

func (s *Server) GetQuestionInformation(c *gin.Context, questionId gen.QuestionId, params gen.GetQuestionInformationParams) {
	lab.GetQuestionForStudentController(c, questionId, params)
}

func (s *Server) GetExaminationPin(c *gin.Context, labId gen.LabId, params gen.GetExaminationPinParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) GetTestcaseInfomation(c *gin.Context, testCaseId gen.TestCaseId, params gen.GetTestcaseInfomationParams) {
	lab.GetTestcaseCodeByTestcaseIDHandler(c, testCaseId, params)
}

func (s *Server) GetMultilanguageTestcaseInformation(c *gin.Context, questionId gen.QuestionId, params gen.GetMultilanguageTestcaseInformationParams) {
	lab.GetMultilangTestcaseCodeByQuestionIDHandler(c, questionId, params)
}
