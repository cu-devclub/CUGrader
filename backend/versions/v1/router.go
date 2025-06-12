package v1

import (
	assistantController "CUGrader/backend/versions/v1/controllers/assistant"
	classController "CUGrader/backend/versions/v1/controllers/class"
	studentController "CUGrader/backend/versions/v1/controllers/student"
	assistantModel "CUGrader/backend/versions/v1/models/assistant"
	classModel "CUGrader/backend/versions/v1/models/class"
	studentModel "CUGrader/backend/versions/v1/models/student"
	utilsModel "CUGrader/backend/versions/v1/models/utils"
	assistantService "CUGrader/backend/versions/v1/services/assistant"
	classService "CUGrader/backend/versions/v1/services/class"
	studentService "CUGrader/backend/versions/v1/services/student"

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

	assistantModel := &assistantModel.AssistantModel{DB: db}
	assistantService := &assistantService.AssistantService{Model: assistantModel, Utils: utilsModel}
	assistantController := &assistantController.AssistantController{Service: assistantService}

	studentModel := &studentModel.StudentModel{DB: db}
	studentService := &studentService.StudentService{Model: studentModel, Utils: utilsModel}
	studentController := &studentController.StudentController{Service: studentService}

	r.POST("/class", classController.CreateClassHandler)
	r.PATCH("/class", classController.EditClassHandler)

	r.POST("/assistant", assistantController.InsertAssistantHandler)
	r.DELETE("/assistant", assistantController.RemoveAssistantHandler)
	r.GET("/assistant", assistantController.GetAssistantListHandler)

	r.POST("/student", studentController.AddStudentHandler)
	r.DELETE("/student", studentController.DeleteStudentHandler)
	r.PATCH("/student", studentController.PatchStudentHandler)
	r.GET("/student", studentController.GetStudentsHandler)
}
