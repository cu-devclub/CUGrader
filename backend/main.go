package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		message := os.Getenv("APP_MESSAGE")
		if message == "" {
			message = "Hello from Gin inside Docker!"
		}
		c.JSON(http.StatusOK, gin.H{"message": message})
	})

	router.Run(":8080") // Listen and serve on 0.0.0.0:8080
}
