package class

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func (s *ClassService) EditClass(id int, pictureFile *multipart.FileHeader, csvFile *multipart.FileHeader, updates map[string]interface{}) error {

	if pictureFile != nil {
		ext := filepath.Ext(pictureFile.Filename)
		switch ext {
		case ".png", ".jpg", ".jpeg", ".gif":
			// valid extension
		default:
			return fmt.Errorf("unsupported file extension: %s", ext)
		}

		path, picture_id, err := s.Model.GetPicturePathByClassID(id)
		if err != nil {
			return fmt.Errorf("failed to load picture path from DB: %s", err)
		}
		if picture_id == 0 {
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
			updates := map[string]interface{}{"picture_id": picture_id}
			if err := s.Model.Edit(id, updates); err != nil {
				return fmt.Errorf("failed to update class with new picture_id: %v", err)
			}
		} else {
			oldExt := filepath.Ext(path)
			uuidName := filepath.Base(path[:len(path)-len(filepath.Ext(path))])

			filesPath := os.Getenv("FILES_PATH")
			var savePath string

			if ext == oldExt {
				savePath = filepath.Join(filesPath, uuidName+ext)
			} else {
				oldFilePath := filepath.Join(filesPath, uuidName+oldExt)
				os.Remove(oldFilePath)
				savePath = filepath.Join(filesPath, uuidName+ext)
				if err := s.Model.UpdatePicturePath(picture_id, uuidName+ext); err != nil {
					return fmt.Errorf("failed to update picture path in DB: %v", err)
				}
			}

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
		}
	}

	err := s.Model.Edit(id, updates)
	if err != nil {
		return fmt.Errorf("failed to edit class: %v", err)
	}

	if csvFile != nil {
		current, err := s.Model.GetClassStudentMap(id)
		if err != nil {
			return fmt.Errorf("failed to get class student: %v", err)
		}

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
			return errors.New("empty csv")
		}
		// Validate header
		header := records[0]
		colIdx := map[string]int{}
		for i, col := range header {
			colIdx[strings.TrimSpace(col)] = i
		}
		required := []string{"ID", "Name (English)", "Section", "Group"}
		for _, req := range required {
			if _, ok := colIdx[req]; !ok {
				return errors.New("csv not correct format: missing " + req)
			}
		}

		// Build reverse map: student_id -> class_student_id
		studentIDToCSID := make(map[string]int)
		for csid, v := range current {
			for _, row := range records[1:] {
				id := strings.TrimSpace(row[colIdx["ID"]])
				if v.Section == strings.TrimSpace(row[colIdx["Section"]]) &&
					v.Group == strings.TrimSpace(row[colIdx["Group"]]) {
					studentIDToCSID[id] = csid
				}
			}
		}

		// Track seen class_student_ids
		seenCSID := make(map[int]bool)

		for _, row := range records[1:] {
			studentID := strings.TrimSpace(row[colIdx["ID"]])
			name := strings.TrimSpace(row[colIdx["Name (English)"]])
			sectionStr := strings.TrimSpace(row[colIdx["Section"]])
			groupStr := strings.TrimSpace(row[colIdx["Group"]])

			// Find if student already in class_student
			var foundCSID int
			var foundSection, foundGroup string
			for csid, v := range current {
				if studentID == "" {
					continue
				}
				// Get student_id from user_id
				var dbStudentID string
				err := s.Model.DB.QueryRow(`SELECT student_id FROM student WHERE user_id = (SELECT user_id FROM class_student WHERE id = $1)`, csid).Scan(&dbStudentID)
				if err == nil && dbStudentID == studentID {
					foundCSID = csid
					foundSection = v.Section
					foundGroup = v.Group
					break
				}
			}

			if foundCSID == 0 {
				// Not found, insert new student
				email := studentID + "@student.chula.ac.th"
				userID, err := s.Model.InsertUserIfNotExist(email, name)
				if err != nil {
					return err
				}
				if err := s.Model.InsertStudentIfNotExist(userID, studentID); err != nil {
					return err
				}
				sectionNum, _ := strconv.Atoi(sectionStr)
				sectionID, err := s.Model.InsertSectionIfNotExist(id, sectionNum)
				if err != nil {
					return err
				}
				var groupID *int
				groupStrTrim := strings.TrimSpace(groupStr)
				if groupStrTrim != "" && groupStrTrim != "-" {
					gid, err := s.Model.InsertGroupIfNotExist(id, groupStrTrim)
					if err != nil {
						return err
					}
					groupID = &gid
				}
				if err := s.Model.InsertClassStudent(id, userID, sectionID, groupID); err != nil {
					return err
				}
			} else {
				seenCSID[foundCSID] = true
				// Section update
				if foundSection != sectionStr {
					sectionNum, _ := strconv.Atoi(sectionStr)
					sectionID, err := s.Model.InsertSectionIfNotExist(id, sectionNum)
					if err != nil {
						return err
					}
					if err := s.Model.UpdateClassStudentSection(foundCSID, sectionID); err != nil {
						return err
					}
				}
				// Group update
				groupStrTrim := strings.TrimSpace(groupStr)
				if foundGroup != groupStrTrim {
					var groupID *int
					if groupStrTrim != "" && groupStrTrim != "-" {
						gid, err := s.Model.InsertGroupIfNotExist(id, groupStrTrim)
						if err != nil {
							return err
						}
						groupID = &gid
					}
					if err := s.Model.UpdateClassStudentGroup(foundCSID, groupID); err != nil {
						return err
					}
				}
			}
		}

		// Delete class_student not in CSV
		for csid := range current {
			if !seenCSID[csid] {
				_, err := s.Model.DB.Exec(`DELETE FROM class_student WHERE id = $1`, csid)
				if err != nil {
					return err
				}
			}
		}

	}
	return nil
}
