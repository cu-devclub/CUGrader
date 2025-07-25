package main

import (
	"cugrader/connection/config"
	"cugrader/connection/db"
	"cugrader/connection/message"
	"cugrader/router"
	"fmt"
)

func main() {
	config.LoadEnv()
	db.InitMongo(config.MongoURI)
	message.InitRabbitMQ(config.RabbitURI)
	db.InitYugabyte(config.YSQLDSN)

	// Start HTTP server
	r := router.SetupRouter()
	port := config.Port
	if port == "" {
		port = "5000"
	}

	err := r.Run(":" + port)
	fmt.Println("Error while listening on port " + port + " :" + err.Error())
}
