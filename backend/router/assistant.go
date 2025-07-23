package router

import (
	gen "cugrader/api-gen"
	"cugrader/controller/assistant"

	"github.com/gin-gonic/gin"
)

func (s *Server) DeleteAssistantFromClass(c *gin.Context, assistantId gen.AssistantId, params gen.DeleteAssistantFromClassParams) {
	assistant.RemoveAssistantHandler(c, assistantId, params)
}
func (s *Server) InsertAssistantToClass(c *gin.Context, params gen.InsertAssistantToClassParams) {
	assistant.InsertAssistantHandler(c, params)
}
func (s *Server) GetAssistantsInClass(c *gin.Context, classId gen.ClassId, params gen.GetAssistantsInClassParams) {
	assistant.GetAssistantListHandler(c, classId, params)
}
