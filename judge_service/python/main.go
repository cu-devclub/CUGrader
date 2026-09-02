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

func IfThenElse(condition bool, a interface{}, b interface{}) interface{} {
	if condition {
		return a
	}
	return b
}

func main() {
	_ = godotenv.Load()

	db, err := sql.Open("postgres", os.Getenv("YSQL_DSN"))
	// update host later
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	conn, err := amqp.Dial(os.Getenv("RABBIT_URI"))
	// update host later
	if err != nil {
		log.Fatal(err)
	}
	ch, _ := conn.Channel()
	msgs, _ := ch.Consume(os.Getenv("CHANNEL"), "", true, false, false, false, nil)

	forever := make(chan bool)
	log.Println("Waiting for messages...")
	go func() {
		for d := range msgs {
			var sub Submission
			if err := json.Unmarshal(d.Body, &sub); err != nil {
				log.Println("Invalid JSON:", err)
				continue
			}

			deleteResults(db, sub.SubmissionID)

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
			if Ntotal == 0 {
				Nscore = 0
			}
			if Stotal == 0 {
				Sscore = 0
			}
			if !(Ntotal == 0 && Stotal == 0) {
				Sscore = int(float64(sub.Score) * (float64(Spassed) / float64(Ntotal+Stotal)))
				Nscore = int(float64(sub.Score) * (float64(Npassed) / float64(Ntotal+Stotal)))
			}

			if Stimeout {
				Smessage = "running timeout " + strconv.Itoa(sub.TimeoutSeconds) + "s"
				SisFailed = true
			} else if SisFailed {
				Smessage = "" // hide details
			}
			saveResult(db, sub, Nmessage, NisFailed, sub.TestcaseID, nil, Nscore)
			saveResult(db, sub, Smessage, SisFailed, nil, sub.TestcaseID, Sscore)
		}
	}()
	<-forever
}

func deleteResults(db *sql.DB, submissionID int) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	_, err := db.ExecContext(ctx, `DELETE FROM result WHERE submission_id = $1`, submissionID)
	if err != nil {
		// Ignore error if table does not exist
		if strings.Contains(err.Error(), `relation "result" does not exist`) {
			log.Println("Table 'result' does not exist, skipping delete.")
			return
		}
		log.Println("Failed to delete previous results:", err)
	}
}

func processSubmission(sub Submission, testcase string) (string, bool, bool, int, int) {
	boxID := "0"
	boxPath := "/var/local/lib/isolate/" + boxID + "/box"

	exec.Command("isolate", "--box-id="+boxID, "--cleanup").Run()
	exec.Command("isolate", "--box-id="+boxID, "--init").Run()
	// Traceback (most recent call last):  File "/box/testcase.py", line 1, in <module>    from main import *ModuleNotFoundError: No module named 'main'Exited with error status 1

	for _, code := range sub.Codes {
		os.WriteFile(boxPath+"/"+code.Filename+".py", []byte(code.Content), 0644)
	}
	os.WriteFile(boxPath+"/testcase.py", []byte("import unittest\nfrom main import *\n"+testcase+"\n\ntest_result = unittest.main(verbosity=1, exit=False)\nresult_value = test_result.result\n\nprint(result_value.failures)"), 0644)

	for _, file := range sub.AdditionFiles {
		path := boxPath + "/" + file.Filename
		os.WriteFile(path, []byte(file.Content), 0644)
	}

	// Now run the code inside the sandbox
	cmd := exec.Command("isolate", "--box-id="+boxID, "--time="+strconv.Itoa(sub.TimeoutSeconds), "--run", "--", "/usr/bin/python3", "testcase.py")
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	err := cmd.Run()
	exec.Command("isolate", "--box-id="+boxID, "--cleanup").Run()

	output := out.String()
	timeout := isTimeout(err)
	isFailed := err != nil || strings.Contains(output, "FAIL") || strings.Contains(output, "Error")

	passed, total := countUnittestFailures(output)
	if timeout {
		passed = 0 // if timeout, all tests are considered failed
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
						if strings.Contains(kv[0], "failures") || strings.Contains(kv[0], "errors") {
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
		finalMessage = strings.Join(strings.Split(strings.Split(strings.Split(message, "(")[1], ",")[0], " ")[0:2], " ")
	} else {
		finalMessage = message
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
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
