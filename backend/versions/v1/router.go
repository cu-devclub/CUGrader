package v1

import (
	classController "CUGrader/backend/versions/v1/controllers/class"
	userController "CUGrader/backend/versions/v1/controllers/user"
	classModel "CUGrader/backend/versions/v1/models/class"
	userModel "CUGrader/backend/versions/v1/models/user"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	classService "CUGrader/backend/versions/v1/services/class"
	userService "CUGrader/backend/versions/v1/services/user"
	"crypto/rsa"
	"crypto/x509"
	"database/sql"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"

	"github.com/gin-gonic/gin"
)

var db *sql.DB
var privKey *rsa.PrivateKey
var jwt_key []byte

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

func loadPrivateKeyFromEnv() (*rsa.PrivateKey, error) {
	privKeyPEM := os.Getenv("PRIVATE_KEY")
	block, _ := pem.Decode([]byte(privKeyPEM))
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the private key")
	}
	privKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return privKey, nil
}

func RegisterRoutes(r *gin.RouterGroup) {
	db = initDB()
	var err error
	privKey, err = loadPrivateKeyFromEnv()
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	jwt_key = []byte(os.Getenv("JWT_KEY"))

	is_dev := os.Getenv("SERVICE_ENV") == "development"

	utilsModel := &utilsModel.UtilsModel{DB: db, JWT_KEY: jwt_key}

	classModel := &classModel.ClassModel{DB: db}
	classService := &classService.ClassService{Model: classModel, Utils: utilsModel}
	classController := &classController.ClassController{Service: classService}

	userModel := &userModel.UserModel{DB: db}
	userService := &userService.UserService{Model: userModel, PrivKey: privKey, IsDev: is_dev, JWT_Key: jwt_key}
	userController := &userController.UserController{Service: userService, IsDev: is_dev}

	r.POST("/class", classController.CreateClassHandler)
	r.GET("/classes/semesters", classController.GetSemesterHandler)
	r.GET("/classes/classes/:yearSemester", classController.GetClassByYearSemesterHandler)
	r.GET("/section/:classId", classController.GetSectionsHandler)
	r.GET("/group/:classId", classController.GetGroupsHandler)

	r.POST("/callback", userController.Callback)
}
