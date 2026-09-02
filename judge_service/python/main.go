package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
)

type Submission struct {
	TimeoutSeconds int `json:"timeout_seconds"`
	QuestionID     int `json:"question_id"`
	SubmissionID   int `json:"submission_id"`
	Codes          []struct {
		Filename string `json:"page_name"`
		Content  string `json:"content"`
	} `json:"codes"`
	IsMultilang       bool   `json:"is_multilang"`
	TestcaseID        *int   `json:"testcase_id"`
	Testcase          string `json:"testcase"`
	SecretTestcase    string `json:"secret_testcase"`
	MultilangTestcase []struct {
		Input  string `json:"input"`
		Output string `json:"output"`
	} `json:"multilang_testcase"`
	MultilangSecretTestcase []struct {
		Input  string `json:"input"`
		Output string `json:"output"`
	} `json:"multilang_secret_testcase"`
	AdditionFiles []struct {
		Filename string `json:"filename"`
		Content  []byte `json:"content"`
	} `json:"addition_files"`
	Score int `json:"score"`
}

func main() {
	_ = godotenv.Load()

	ysqlDSN := os.Getenv("YSQL_DSN")
	if ysqlDSN == "" {
		ysqlDSN = "postgres://yugabyte:yugabyte@yugabyte:5433/cugrader?sslmode=disable"
	}

	rabbitURI := os.Getenv("RABBIT_URI")
	if rabbitURI == "" {
		rabbitURI = "amqp://guest:guest@rabbitmq:5672/"
	}

	channelName := os.Getenv("CHANNEL")
	if channelName == "" {
		channelName = "python"
	}

	var db *sql.DB
	var err error

	log.Println("Connecting to YSQL database...")
	for attempts := 1; attempts <= 20; attempts++ {
		db, err = sql.Open("postgres", ysqlDSN)
		if err == nil {
			err = db.Ping()
		}
		if err == nil {
			log.Println("Connected to YSQL successfully")
			break
		}
		log.Printf("YSQL connection attempt %d/20 failed: %v. Retrying in 2s...", attempts, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("Fatal: could not connect to YSQL: %v", err)
	}
	defer db.Close()

	var conn *amqp.Connection
	log.Println("Connecting to RabbitMQ...")
	for attempts := 1; attempts <= 20; attempts++ {
		conn, err = amqp.Dial(rabbitURI)
		if err == nil {
			log.Println("Connected to RabbitMQ successfully")
			break
		}
		log.Printf("RabbitMQ connection attempt %d/20 failed: %v. Retrying in 2s...", attempts, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("Fatal: could not connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open RabbitMQ channel: %v", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		channelName,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		log.Printf("Queue declare note: %v", err)
	}

	msgs, err := ch.Consume(channelName, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
	}

	log.Printf("Judge Python service started. Waiting for submissions on queue '%s'...", channelName)

	for d := range msgs {
		var sub Submission
		if err := json.Unmarshal(d.Body, &sub); err != nil {
			log.Println("Invalid JSON received:", err)
			continue
		}

		log.Printf("Processing submission #%d (Question #%d)", sub.SubmissionID, sub.QuestionID)
		deleteResults(db, sub.SubmissionID)

		if sub.TimeoutSeconds <= 0 {
			sub.TimeoutSeconds = 10
		} else if sub.TimeoutSeconds > 30 {
			sub.TimeoutSeconds = 30
		}

		// Process normal testcase
		Nmessage, NisFailed, Ntimeout, Npassed, Ntotal := processSubmission(sub, sub.Testcase)
		if Ntimeout {
			Nmessage = "running timeout " + strconv.Itoa(sub.TimeoutSeconds) + "s"
			NisFailed = true
		}

		// Process secret testcase
		Smessage, SisFailed, Stimeout, Spassed, Stotal := processSubmission(sub, sub.SecretTestcase)
		var Nscore int
		var Sscore int
		if Ntotal+Stotal > 0 {
			Nscore = int(float64(sub.Score) * (float64(Npassed) / float64(Ntotal+Stotal)))
			Sscore = int(float64(sub.Score) * (float64(Spassed) / float64(Ntotal+Stotal)))
		}

		if Stimeout {
			Smessage = "running timeout " + strconv.Itoa(sub.TimeoutSeconds) + "s"
			SisFailed = true
		} else if SisFailed {
			Smessage = "" // hide secret testcase failure details from students
		}

		saveResult(db, sub, Nmessage, NisFailed, sub.TestcaseID, nil, Nscore)
		saveResult(db, sub, Smessage, SisFailed, nil, sub.TestcaseID, Sscore)
	}
}

func deleteResults(db *sql.DB, submissionID int) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := db.ExecContext(ctx, `DELETE FROM result WHERE submission_id = $1`, submissionID)
	if err != nil {
		if strings.Contains(err.Error(), `relation "result" does not exist`) {
			return
		}
		log.Println("Failed to delete previous results:", err)
	}
}

func processSubmission(sub Submission, testcase string) (string, bool, bool, int, int) {
	boxID := "0"
	boxPath := "/var/local/lib/isolate/" + boxID + "/box"

	// Try isolate cleanup and init
	isolateAvailable := true
	if err := exec.Command("isolate", "--box-id="+boxID, "--cleanup").Run(); err != nil {
		isolateAvailable = false
	}
	if isolateAvailable {
		if err := exec.Command("isolate", "--box-id="+boxID, "--init").Run(); err != nil {
			isolateAvailable = false
		}
	}

	workDir := boxPath
	if !isolateAvailable {
		// Fallback to local temporary sandbox directory
		tmpDir, err := os.MkdirTemp("", "judge-box-*")
		if err != nil {
			return "Internal judge sandbox error: " + err.Error(), true, false, 0, 0
		}
		defer os.RemoveAll(tmpDir)
		workDir = tmpDir
	}

	_ = os.MkdirAll(workDir, 0755)

	// Write user codes with sanitized filenames (prevent path traversal)
	for _, code := range sub.Codes {
		cleanName := filepath.Base(filepath.Clean(code.Filename))
		if cleanName == "." || cleanName == "/" || cleanName == "\\" {
			cleanName = "solution"
		}
		_ = os.WriteFile(filepath.Join(workDir, cleanName+".py"), []byte(code.Content), 0644)
	}

	testcaseScript := "import unittest\nfrom main import *\n" + testcase + "\n\ntest_result = unittest.main(verbosity=1, exit=False)\nresult_value = test_result.result\n\nprint(result_value.failures)"
	_ = os.WriteFile(filepath.Join(workDir, "testcase.py"), []byte(testcaseScript), 0644)

	// Write additional files with sanitized filenames
	for _, file := range sub.AdditionFiles {
		cleanName := filepath.Base(filepath.Clean(file.Filename))
		if cleanName != "." && cleanName != "/" && cleanName != "\\" {
			_ = os.WriteFile(filepath.Join(workDir, cleanName), file.Content, 0644)
		}
	}

	var cmd *exec.Cmd
	var ctx context.Context
	var cancel context.CancelFunc

	if isolateAvailable {
		cmd = exec.Command("isolate", "--box-id="+boxID, "--time="+strconv.Itoa(sub.TimeoutSeconds), "--run", "--", "/usr/bin/python3", "testcase.py")
	} else {
		ctx, cancel = context.WithTimeout(context.Background(), time.Duration(sub.TimeoutSeconds)*time.Second)
		defer cancel()
		cmd = exec.CommandContext(ctx, "python3", "testcase.py")
		cmd.Dir = workDir
	}

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	err := cmd.Run()

	if isolateAvailable {
		_ = exec.Command("isolate", "--box-id="+boxID, "--cleanup").Run()
	}

	output := out.String()
	timeout := isTimeout(err) || (ctx != nil && ctx.Err() == context.DeadlineExceeded)
	isFailed := err != nil || strings.Contains(output, "FAIL") || strings.Contains(output, "Error")

	passed, total := countUnittestFailures(output)
	if timeout {
		passed = 0
	}
	return output, isFailed, timeout, passed, total
}

func countUnittestFailures(output string) (int, int) {
	lines := strings.Split(output, "\n")
	totalTests := 0
	failures := 0

	for _, line := range lines {
		if strings.HasPrefix(line, "Ran ") && strings.Contains(line, " test") {
			parts := strings.Split(line, " ")
			if len(parts) >= 2 {
				if n, err := strconv.Atoi(parts[1]); err == nil {
					totalTests = n
				}
			}
		}
		if strings.Contains(line, "FAILED (") {
			left := strings.Index(line, "(")
			right := strings.Index(line, ")")
			if left != -1 && right != -1 && right > left {
				substring := line[left+1 : right]
				pairs := strings.Split(substring, ",")
				for _, p := range pairs {
					if strings.Contains(p, "=") {
						kv := strings.Split(p, "=")
						if len(kv) >= 2 && (strings.Contains(kv[0], "failures") || strings.Contains(kv[0], "errors")) {
							if val, err := strconv.Atoi(strings.TrimSpace(kv[1])); err == nil {
								failures += val
							}
						}
					}
				}
			}
		}
	}

	if totalTests == 0 {
		return 0, 0
	}
	passed := totalTests - failures
	if passed < 0 {
		passed = 0
	}
	return passed, totalTests
}

func isTimeout(err error) bool {
	if err == nil {
		return false
	}
	var exitErr *exec.ExitError
	if errors.As(err, &exitErr) {
		return exitErr.ExitCode() == 143 || exitErr.ExitCode() == 137
	}
	return false
}

func saveResult(db *sql.DB, sub Submission, message string, isFailed bool, testcaseID, secretTestcaseID *int, score int) {
	var finalMessage string
	if !isFailed {
		if strings.Contains(message, "(") {
			parts := strings.Split(message, "(")
			if len(parts) > 1 {
				subParts := strings.Split(parts[1], ",")
				fields := strings.Fields(subParts[0])
				if len(fields) >= 2 {
					finalMessage = fields[0] + " " + fields[1]
				} else if len(fields) == 1 {
					finalMessage = fields[0]
				} else {
					finalMessage = "OK"
				}
			} else {
				finalMessage = "OK"
			}
		} else {
			finalMessage = "OK"
		}
	} else {
		finalMessage = message
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.ExecContext(ctx, `
		INSERT INTO result (
			question_id, submission_id, testcase_id, secret_testcase_id,
			multilang_testcase_id, multilang_secret_testcase_id,
			message, score, is_failed
		)
		VALUES ($1, $2, $3, $4, NULL, NULL, $5, $6, $7)
	`, sub.QuestionID, sub.SubmissionID, testcaseID, secretTestcaseID,
		finalMessage, score, isFailed)

	if err != nil {
		log.Println("DB insert failed:", err)
	} else {
		log.Println("Result saved for submission", sub.SubmissionID)
	}
}
