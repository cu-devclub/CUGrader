package class

import (
	"crypto/rand"
	"encoding/csv"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
)

func (s *ClassService) CreateClass(courseID int, name string, semester int, year int, pictureFile *multipart.FileHeader, csvFile *multipart.FileHeader, creatorUserID int) error {
	picture_id := 0

	if pictureFile != nil {
		ext := filepath.Ext(pictureFile.Filename)
		switch ext {
		case ".png", ".jpg", ".jpeg", ".gif":
			// valid extension
		default:
			return fmt.Errorf("unsupported file extension: %s", ext)
		}
		uuidName := fmt.Sprintf("%s%s", generateUUID(), ext)
		savePath := filepath.Join(os.Getenv("FILES_PATH"), uuidName)
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

		picture_id, err = s.Model.InsertPicture(uuidName)
		if err != nil {
			return fmt.Errorf("failed to insert picture to db")
		}
	}

	classID, err := s.Model.Insert(courseID, name, semester, year, picture_id, creatorUserID)
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

			userID, err := s.Model.InsertUserIfNotExist(email, name)
			if err != nil {
				return fmt.Errorf("insert user: %w", err)
			}
			if err := s.Model.InsertStudentIfNotExist(userID, id); err != nil {
				return fmt.Errorf("insert student: %w", err)
			}
			sectionNumber := 0
			fmt.Sscanf(sectionStr, "%d", &sectionNumber)
			sectionID, err := s.Model.InsertSectionIfNotExist(classID, sectionNumber)
			if err != nil {
				return fmt.Errorf("insert section: %w", err)
			}
			var groupID *int
			groupVal := group
			if groupVal != "" && groupVal != "-" {
				gid, err := s.Model.InsertGroupIfNotExist(classID, groupVal)
				if err != nil {
					return fmt.Errorf("insert group: %w", err)
				}
				groupID = &gid
			}
			if err := s.Model.InsertClassStudent(classID, userID, sectionID, groupID); err != nil {
				return fmt.Errorf("insert class_student: %w", err)
			}
		}
	}
	return nil
}

// generateUUID generates a random UUID v4 string.
func generateUUID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	// Set version (4) and variant bits as per RFC 4122
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
