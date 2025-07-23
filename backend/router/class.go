package router

import (
	gen "cugrader/api-gen"
	"cugrader/controller/class"

	"github.com/gin-gonic/gin"
)

func (s *Server) CreateClass(c *gin.Context, params gen.CreateClassParams) {
	class.CreateClassHandler(c, params)
}

func (s *Server) EditClass(c *gin.Context, params gen.EditClassParams) {
	class.EditClassHandler(c, params)
}

func (s *Server) GetClassInformation(c *gin.Context, classId gen.ClassId, params gen.GetClassInformationParams) {
	class.GetClassInformation(c, classId, params)
}

func (s *Server) GetClasses(c *gin.Context, yearSemester string, params gen.GetClassesParams) {
	class.GetClassByYearSemesterHandler(c, yearSemester, params)
}

func (s *Server) GetSemesterOfUser(c *gin.Context, params gen.GetSemesterOfUserParams) {
	class.GetSemesterHandler(c, params)
}

func (s *Server) GetSectionInClass(c *gin.Context, classId gen.ClassId, params gen.GetSectionInClassParams) {
	class.GetSectionsHandler(c, classId, params)
}

func (s *Server) GetGroupsInClass(c *gin.Context, classId gen.ClassId, params gen.GetGroupsInClassParams) {
	class.GetGroupsHandler(c, classId, params)
}
