package v1

import (
	classController "CUGrader/backend/versions/v1/controllers/class"
	classModel "CUGrader/backend/versions/v1/models/class"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	classService "CUGrader/backend/versions/v1/services/class"
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"

	"github.com/gin-gonic/gin"
)

var db *sql.DB

func initDB() *sql.DB {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	database, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Cannot open DB: %v", err)
	}
	if err := database.Ping(); err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	return database
}

func RegisterRoutes(r *gin.RouterGroup) {
	db = initDB()

	utilsModel := &utilsModel.UtilsModel{DB: db}

	classModel := &classModel.ClassModel{DB: db}
	classService := &classService.ClassService{Model: classModel, Utils: utilsModel}
	classController := &classController.ClassController{Service: classService}

	r.POST("/class", classController.CreateClassHandler)
}
