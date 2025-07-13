package lab

import (
	"cugrader/repository/lab"
	"time"
)

func AddLab(classID int, questionNumber int, name string, publishDate time.Time, dueDate time.Time, closeOnDueDate bool, examMode bool, showScoreOnLock bool, examPin int) (int, error) {
	// TODO(ptsgrn): change testcaseID to the reasonate value
	return lab.InsertLab(classID, questionNumber, name, publishDate, dueDate, closeOnDueDate, examMode, showScoreOnLock, examPin, 0)
}
