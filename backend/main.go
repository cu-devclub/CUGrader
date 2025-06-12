package main

import (
	v1 "CUGrader/backend/versions/v1"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	r := gin.Default()

	v1.RegisterRoutes(r.Group("/v1"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	r.Run(":" + port)
}
