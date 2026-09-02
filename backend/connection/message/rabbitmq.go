package message

import (
	"log"
	"time"

	"github.com/streadway/amqp"
)

var RabbitConn *amqp.Connection
var RabbitChannel *amqp.Channel

func InitRabbitMQ(uri string) {
	if uri == "" {
		log.Println("RabbitMQ URI is empty, skipping RabbitMQ init")
		return
	}

	var conn *amqp.Connection
	var ch *amqp.Channel
	var err error

	for attempts := 1; attempts <= 15; attempts++ {
		conn, err = amqp.Dial(uri)
		if err == nil {
			ch, err = conn.Channel()
		}

		if err == nil {
			log.Println("Successfully connected to RabbitMQ")
			RabbitConn = conn
			RabbitChannel = ch
			return
		}

		log.Printf("RabbitMQ connection attempt %d/15 failed: %v. Retrying in 2s...", attempts, err)
		time.Sleep(2 * time.Second)
	}

	log.Fatalf("RabbitMQ connection failed after retries: %v", err)
}
