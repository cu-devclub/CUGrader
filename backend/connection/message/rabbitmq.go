package message

import (
	"log"

	"github.com/streadway/amqp"
)

var RabbitConn *amqp.Connection
var RabbitChannel *amqp.Channel

func InitRabbitMQ(uri string) {
	conn, err := amqp.Dial(uri)
	if err != nil {
		log.Fatalf("RabbitMQ connection error: %v", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("RabbitMQ channel error: %v", err)
	}

	RabbitConn = conn
	RabbitChannel = ch
}
