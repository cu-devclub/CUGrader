package main

import (
	v1 "CUGrader/Auth/versions/v1"
	"log"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	r := gin.Default()

	store := cookie.NewStore([]byte(os.Getenv("COOKIE_SECRET")))
	r.Use(sessions.Sessions("AuthenSession", store))

	v1.RegisterRoutes(r.Group("/v1"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "6000"
	}

	r.Run(":" + port)
}
