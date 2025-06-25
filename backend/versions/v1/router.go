package v1

import (
	// Controllers
	assistantController "CUGrader/backend/versions/v1/controllers/assistant"
	classController "CUGrader/backend/versions/v1/controllers/class"
	additionalFileController "CUGrader/backend/versions/v1/controllers/file"
	languageController "CUGrader/backend/versions/v1/controllers/language"
	labController "CUGrader/backend/versions/v1/controllers/lab"
	pictureController "CUGrader/backend/versions/v1/controllers/picture"
	questionController "CUGrader/backend/versions/v1/controllers/question"
	studentController "CUGrader/backend/versions/v1/controllers/student"
	userController "CUGrader/backend/versions/v1/controllers/user"

	// Models
	assistantModel "CUGrader/backend/versions/v1/models/assistant"
	classModel "CUGrader/backend/versions/v1/models/class"
	additionalFileModel "CUGrader/backend/versions/v1/models/file"
	labModel "CUGrader/backend/versions/v1/models/lab"
	languageModel "CUGrader/backend/versions/v1/models/language"
	pictureModel "CUGrader/backend/versions/v1/models/picture"
	questionModel "CUGrader/backend/versions/v1/models/question"
	studentModel "CUGrader/backend/versions/v1/models/student"
	userModel "CUGrader/backend/versions/v1/models/user"
	utilsModel "CUGrader/backend/versions/v1/models/utils"

	// Services
	assistantService "CUGrader/backend/versions/v1/services/assistant"
	classService "CUGrader/backend/versions/v1/services/class"
	additionalFileService "CUGrader/backend/versions/v1/services/file"
	languageService "CUGrader/backend/versions/v1/services/language"
	labService "CUGrader/backend/versions/v1/services/lab"
	pictureService "CUGrader/backend/versions/v1/services/picture"
	questionService "CUGrader/backend/versions/v1/services/question"
	studentService "CUGrader/backend/versions/v1/services/student"
	userService "CUGrader/backend/versions/v1/services/user"

	"context"
	"crypto/rsa"
	"crypto/x509"
	"database/sql"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

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

func initMongoDB() *mongo.Client {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI environment variable is not set")
	}

	client, err := mongo.Connect(options.Client().ApplyURI(uri))

	if err != nil {
		panic(err)
	}
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	return client
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
	mongoClient := initMongoDB()

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

	assistantModel := &assistantModel.AssistantModel{DB: db}
	assistantService := &assistantService.AssistantService{Model: assistantModel, Utils: utilsModel}
	assistantController := &assistantController.AssistantController{Service: assistantService}

	studentModel := &studentModel.StudentModel{DB: db}
	studentService := &studentService.StudentService{Model: studentModel, Utils: utilsModel}
	studentController := &studentController.StudentController{Service: studentService}

	pictureModel := &pictureModel.PictureModel{DB: db}
	pictureService := &pictureService.PictureService{Model: pictureModel}
	pictureController := &pictureController.PictureController{Service: pictureService}

	languageModel := &languageModel.LanguageModel{DB: db}

	questionModel := &questionModel.QuestionModel{DB: db, MongoDB: mongoClient}
	questionService := &questionService.QuestionService{Model: questionModel, Utils: utilsModel}
	questionController := &questionController.QuestionController{Service: questionService}

	additionalFileModel := &additionalFileModel.AdditionalFileModel{DB: db}
	additionalFileService := &additionalFileService.AdditionalFileService{Model: additionalFileModel, Utils: utilsModel}
	additionalFileController := &additionalFileController.AdditionalFileController{Service: additionalFileService}


	languageModel := &languageModel.LanguageModel{DB: db}
	languageService := &languageService.LanguageService{Model: languageModel}
	languageController := &languageController.LanguageController{Service: languageService}

	labModel := &labModel.LabModel{DB: db}
	labService := &labService.LabService{
		Model:               labModel,
		Utils:               utilsModel,
		QuestionModel:       questionModel,
		LanguageModel:       languageModel,
		AdditionalFileModel: additionalFileModel,
	}
	labController := &labController.LabController{Service: labService}


	r.POST("/callback", userController.Callback)
	r.POST("/test/callback", userController.TestCallback)

	r.POST("/class", classController.CreateClassHandler)
	r.PATCH("/class", classController.EditClassHandler)
	r.GET("/classes/semesters", classController.GetSemesterHandler)
	r.GET("/classes/classes/:yearSemester", classController.GetClassByYearSemesterHandler)
	r.GET("/section/:classId", classController.GetSectionsHandler)
	r.GET("/group/:classId", classController.GetGroupsHandler)

	r.POST("/TA", assistantController.InsertAssistantHandler)
	r.DELETE("/TA", assistantController.RemoveAssistantHandler)
	r.GET("/TA/:classId", assistantController.GetAssistantListHandler)

	r.POST("/student", studentController.AddStudentHandler)
	r.DELETE("/student", studentController.DeleteStudentHandler)
	r.PATCH("/student", studentController.PatchStudentHandler)
	r.GET("/student/:classId", studentController.GetStudentsHandler)

	r.GET("/picture/:pictureId", pictureController.GetPicture)

	r.GET("/lab/:lab_id", labController.GetLabByIDHandler)
	r.POST("/lab", labController.AddLabHandler)
	r.PATCH("/lab", labController.EditLabHandler)

	r.GET("/question/:questionId", questionController.GetQuestionForStudentController)

	r.GET("/addfile/:addfile_id", additionalFileController.GetAdditionalFileByIDHandler)
	r.DELETE("/addfile/:addfile_id", additionalFileController.DeleteAdditionalFileByIDHandler)

	r.GET("/language", languageController.GetLanguagesHandler)
}
