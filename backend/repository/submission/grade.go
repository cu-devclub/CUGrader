package submission

import (
	"cugrader/connection/config"
	"cugrader/connection/db"
	"cugrader/connection/message"
	"cugrader/repository/utils"
	submissionStruct "cugrader/structure/submission"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/streadway/amqp"
)

// AppendToQueue publishes a message to the specified RabbitMQ queue.
// queueName: name of the queue
// body: data to be marshaled and sent
func AppendToQueue(queueName string, body submissionStruct.QueueData) error {
	if message.RabbitChannel == nil {
		return amqp.ErrClosed
	}

	q, err := message.RabbitChannel.QueueDeclare(
		queueName,
		true,  // durable
		false, // autoDelete
		false, // exclusive
		false, // noWait
		nil,   // args
	)
	if err != nil {
		return err
	}

	msgBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	return message.RabbitChannel.Publish(
		"",     // exchange
		q.Name, // routing key (queue name)
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        msgBody,
		},
	)
}

func LoadSubmissionQuestionInfo(SubmissionId int) (submissionStruct.QuestionSubInfo, error) {
	SQInfo := submissionStruct.QuestionSubInfo{
		SubmissionId: SubmissionId,
	}
	var testCaseObjectId string
	var secretTestCaseObjectId string
	var SubmissionObjectId string
	query := `SELECT 
			s.question_id,
			q.testcase_id,
			t.testcase_object_id,
			t.secret_testcase_object_id,
			q.score,
			s.object_id,
			sl.service_name
		FROM 
			submission s
			LEFT JOIN question q ON q.id = s.question_id
			LEFT JOIN testcase t ON t.id = q.testcase_id
			LEFT JOIN system_language sl ON sl.id = s.system_language_id
		WHERE 
			s.id = $1`
	row := db.YSQL.QueryRow(query, SubmissionId)
	if err := row.Scan(&SQInfo.QuestionId, &SQInfo.TestcaseId, &testCaseObjectId, &secretTestCaseObjectId, &SQInfo.Score, &SubmissionObjectId, &SQInfo.Channel); err != nil {
		fmt.Println(err.Error())
		return SQInfo, err
	}

	pages, err := GetPages(SubmissionObjectId)
	if err != nil {
		return SQInfo, fmt.Errorf("error while getting pages: %w", err)
	}

	for _, page := range pages {
		content, err := utils.GetCodeContent(page.CodeObjectID.Hex())
		if err != nil {
			return SQInfo, fmt.Errorf("error while getting page content: %w", err)
		}
		SQInfo.Codes = append(SQInfo.Codes, submissionStruct.CodeStruct{
			PageName: page.Name,
			Content:  content,
		})
	}

	content, err := utils.GetCodeContent(testCaseObjectId)
	if err != nil {
		return SQInfo, fmt.Errorf("error while getting testcase: %w", err)
	}
	SQInfo.Testcase = content

	content, err = utils.GetCodeContent(secretTestCaseObjectId)
	if err != nil {
		return SQInfo, fmt.Errorf("error while getting secret testcase: %w", err)
	}
	SQInfo.SecretTestcase = content

	AddFilesQuery := `
		SELECT 
			af.filename,
			af.path
		FROM 
			addition_files af
			LEFT JOIN question q ON af.lab_id = q.lab_id
		WHERE 
			q.id = $1`
	rows, err := db.YSQL.Query(AddFilesQuery, SQInfo.QuestionId)
	if err != nil {
		return SQInfo, err
	}
	defer rows.Close()

	for rows.Next() {
		var info submissionStruct.AdditionalFiles
		var path string
		if err := rows.Scan(&info.Filename, &path); err != nil {
			return SQInfo, err
		}
		data, err := ReadFileContent(config.Path, path)
		if err != nil {
			return SQInfo, fmt.Errorf("error reading additional file %s: %w", path, err)
		}
		info.Content = data
		SQInfo.AdditionalFiles = append(SQInfo.AdditionalFiles, info)
	}

	return SQInfo, nil
}

// ReadFileContent reads the content of a file given a base path and a relative path.
func ReadFileContent(basePath, relativePath string) ([]byte, error) {
	fullPath := filepath.Join(basePath, relativePath)
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, err
	}
	return data, nil
}
