package submission

import "go.mongodb.org/mongo-driver/bson/primitive"

type CodeStruct struct {
	PageName string `json:"page_name"`
	Content  string `json:"content"`
}

type SaveBody struct {
	LanguageId int          `json:"LanguageId"`
	QuestionId int          `json:"QuestionId"`
	Codes      []CodeStruct `json:"code"`
}

type Page struct {
	Name         string             `bson:"name" json:"name"`                     // must match bsonType: string
	CodeObjectID primitive.ObjectID `bson:"code_object_id" json:"code_object_id"` // must match bsonType: objectId
}

type LanguageInfo struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type GetCode struct {
	SubmissionId int          `json:"SubmissionId"`
	Language     LanguageInfo `json:"language"`
	Codes        []CodeStruct `json:"code"`
}

// {
//   "timeout_seconds": 20,
//   "question_id": 1,
//   "submission_id": 1,
//   "code": [
//     "def add_num(a, b):\n    return a / b"
//   ],
//   "is_multilang": false,
//   "testcase_id": 1,
//   "testcase": "import unittest\n\nclass MyTest(unittest.TestCase):\n    def test_hello_world(self):\n        self.assertEqual(add_num(1, 2), 0.5)\ntest_result = unittest.main(verbosity=1, exit=False)",
//   "secret_testcase": "import unittest\n\nclass MyTest(unittest.TestCase):\n    def test_hello_world(self):\n        self.assertEqual(add_num(1, 0), 0)\ntest_result = unittest.main(verbosity=1, exit=False)",
//   "multilang_testcase": [],
//   "multilang_secret_testcase": [],
//   "addition_files": [],
//   "score": 100
// }

type Mulitlang struct {
	Input  string `json:"input"`
	Output string `json:"output"`
}

type AdditionalFiles struct {
	Filename string `json:"filename"`
	Content  []byte `json:"content"`
}

type QueueData struct {
	TimeOut                 int               `json:"timeout_seconds"`
	QuestionId              int               `json:"question_id"`
	SubmissionId            int               `json:"submission_id"`
	Codes                   []CodeStruct      `json:"codes"`
	Multilang               bool              `json:"is_multilang"`
	TestcaseId              int               `json:"testcase_id"`
	Testcase                string            `json:"testcase"`
	SecretTestcase          string            `json:"secret_testcase"`
	MultilangTestcase       []Mulitlang       `json:"multilang_testcase"`
	SecretMultilangTestcase []Mulitlang       `json:"multilang_secret_testcase"`
	AdditionalFiles         []AdditionalFiles `json:"addition_files"`
	Score                   int               `json:"score"`
}

type QuestionSubInfo struct {
	QuestionId      int
	SubmissionId    int
	Codes           []CodeStruct
	TestcaseId      int
	Testcase        string
	SecretTestcase  string
	AdditionalFiles []AdditionalFiles
	Score           int
	Channel         string
}

type NormalTestcase struct {
	Input   string `json:"input"`
	Output  string `json:"output"`
	Message string `json:"message"`
	Status  string `json:"status"`
}

type SecretTestcase struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

type Result struct {
	Normal NormalTestcase `json:"normal"`
	Secret SecretTestcase `json:"secret"`
}
