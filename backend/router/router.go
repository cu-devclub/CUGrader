package router

import (
	gen "cugrader/api-gen"

	"github.com/gin-gonic/gin"
)

type Server struct{}

func SetupRouter() *gin.Engine {
	r := gin.Default()

	gen.RegisterHandlers(r, &Server{})

	return r
}
