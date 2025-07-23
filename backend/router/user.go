package router

import (
	gen "cugrader/api-gen"
	"cugrader/connection/config"
	"cugrader/controller/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) RedirectUserToAuthenticationSystem(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{"error": "You have to call this in authen."})
}

func (s *Server) GetCallback(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{"error": "You have to call this in authen."})
}

func (s *Server) GetUserAndClassPicture(c *gin.Context, pictureId gen.PictureId) {
	user.GetPicture(c, pictureId)
}

func (s *Server) GetUserDataFromGoogle(c *gin.Context) {
	user.Callback(c)
}

func (s *Server) UserForCreateTestUser(c *gin.Context) {
	if !config.Is_dev {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This is for develop env."})
	}
	user.TestCallback(c)
}

func (s *Server) GetUserProgress(c *gin.Context, classId gen.ClassId, params gen.GetUserProgressParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) GetUserRank(c *gin.Context, classId gen.ClassId, params gen.GetUserRankParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}

func (s *Server) GetUserScore(c *gin.Context, classId gen.ClassId, params gen.GetUserScoreParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}
