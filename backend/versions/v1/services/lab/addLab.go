package lab

import "time"

func (lc *LabService) AddLab(classID int, questionNumber int, name string, publishDate time.Time, dueDate time.Time, closeOnDueDate bool, examMode bool, showScoreOnLock bool, examPin string) (int, error) {
	// TODO(ptsgrn): change testcaseID to the reasonate value
	return lc.Model.InsertLab(classID, questionNumber, name, publishDate, dueDate, closeOnDueDate, examMode, showScoreOnLock, examPin, 0)
}
