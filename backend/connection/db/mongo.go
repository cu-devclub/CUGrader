package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

func InitMongo(uri string) {
	if uri == "" {
		log.Println("MongoDB URI is empty, skipping Mongo init")
		return
	}

	var client *mongo.Client
	var err error

	for attempts := 1; attempts <= 15; attempts++ {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err == nil {
			err = client.Ping(ctx, nil)
		}
		cancel()

		if err == nil {
			log.Println("Successfully connected to MongoDB")
			MongoClient = client
			return
		}

		log.Printf("MongoDB connection attempt %d/15 failed: %v. Retrying in 2s...", attempts, err)
		time.Sleep(2 * time.Second)
	}

	log.Fatalf("MongoDB connection failed after retries: %v", err)
}
