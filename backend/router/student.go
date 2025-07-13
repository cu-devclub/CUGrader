package router

import (
	gen "cugrader/api-gen"
	"cugrader/controller/student"

	"github.com/gin-gonic/gin"
)

func (s *Server) DeleteStudentFromClass(c *gin.Context, params gen.DeleteStudentFromClassParams) {
	student.DeleteStudentHandler(c, params)
}

func (s *Server) EditStudentInClass(c *gin.Context, params gen.EditStudentInClassParams) {
	student.PatchStudentHandler(c, params)
}

func (s *Server) InsertStudentToClass(c *gin.Context, params gen.InsertStudentToClassParams) {
	student.AddStudentHandler(c, params)
}

func (s *Server) GetStudentsIncClass(c *gin.Context, classId gen.ClassId, params gen.GetStudentsIncClassParams) {
	student.GetStudentsHandler(c, classId, params)
}
