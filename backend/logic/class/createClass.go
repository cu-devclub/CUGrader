package class

import (
	"cugrader/connection/config"
	"cugrader/logic/utils"
	"cugrader/repository/class"
	"encoding/csv"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
)

func CreateClass(courseID int, name string, semester int, year int, pictureFile *multipart.FileHeader, csvFile *multipart.FileHeader, creatorUserID int) error {
	picture_id := 0

	if pictureFile != nil {
		ext := filepath.Ext(pictureFile.Filename)
		switch ext {
		case ".png", ".jpg", ".jpeg", ".gif":
			// valid extension
		default:
			return fmt.Errorf("unsupported file extension: %s", ext)
		}
		uuidName := fmt.Sprintf("%s%s", utils.GenerateUUID(), ext)
		savePath := filepath.Join(config.Path, uuidName)
		src, err := pictureFile.Open()
		if err != nil {
			return fmt.Errorf("failed to open uploaded file: %v", err)
		}
		defer src.Close()

		dst, err := os.Create(savePath)
		if err != nil {
			return fmt.Errorf("failed to create file: %v", err)
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			return fmt.Errorf("failed to save file: %v", err)
		}

		picture_id, err = class.InsertPicture(uuidName)
		if err != nil {
			return fmt.Errorf("failed to insert picture to db")
		}
	}

	classID, err := class.Insert(courseID, name, semester, year, picture_id, creatorUserID)
	if err != nil {
		return fmt.Errorf("failed to add class: %v", err)
	}

	if csvFile != nil {
		csvSrc, err := csvFile.Open()
		if err != nil {
			return fmt.Errorf("failed to open uploaded CSV file: %v", err)
		}
		defer csvSrc.Close()

		importCsvReader := csv.NewReader(csvSrc)
		records, err := importCsvReader.ReadAll()
		if err != nil {
			return fmt.Errorf("failed to read CSV content: %v", err)
		}

		if len(records) == 0 {
			return fmt.Errorf("CSV is empty")
		}
		header := records[0]
		colIdx := map[string]int{}
		for i, col := range header {
			colIdx[col] = i
		}
		// Must have at least: ID, Name (English), Section, Group
		required := []string{"ID", "Name (English)", "Section", "Group"}
		for _, req := range required {
			if _, ok := colIdx[req]; !ok {
				return fmt.Errorf("CSV missing required column: %s", req)
			}
		}
		for _, row := range records[1:] {
			if len(row) < len(header) {
				continue // skip incomplete row
			}
			id := row[colIdx["ID"]]
			name := row[colIdx["Name (English)"]]
			sectionStr := row[colIdx["Section"]]
			group := row[colIdx["Group"]]
			email := fmt.Sprintf("%s@student.chula.ac.th", id)

			userID, err := class.InsertUserIfNotExist(email, name)
			if err != nil {
				return fmt.Errorf("insert user: %w", err)
			}
			if err := class.InsertStudentIfNotExist(userID, id); err != nil {
				return fmt.Errorf("insert student: %w", err)
			}
			sectionNumber, err := strconv.Atoi(sectionStr)
			if err != nil {
				return fmt.Errorf("convert section number: %w", err)
			}
			sectionID, err := class.InsertSectionIfNotExist(classID, sectionNumber)
			if err != nil {
				return fmt.Errorf("insert section: %w", err)
			}
			var groupID *int
			groupVal := group
			if groupVal != "" && groupVal != "-" {
				gid, err := class.InsertGroupIfNotExist(classID, groupVal)
				if err != nil {
					return fmt.Errorf("insert group: %w", err)
				}
				groupID = &gid
			}
			if err := class.InsertClassStudent(classID, userID, sectionID, groupID); err != nil {
				return fmt.Errorf("insert class_student: %w", err)
			}
		}
	}
	return nil
}

func GetAllClasses() ([]class.ClassObjectModel, error) {
	return class.GetAllClasses()
}
