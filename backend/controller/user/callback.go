package user

import (
	"cugrader/logic/user"

	"github.com/gin-gonic/gin"
)

func Callback(c *gin.Context) {
	var payload struct {
		Key        string `json:"key"`
		Credential string `json:"credential"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{"error": "invalid JSON"})
		return
	}

	if payload.Key == "" || payload.Credential == "" {
		c.JSON(400, gin.H{"error": "missing key or credential"})
		return
	}

	jwtToken, code, err := user.Callback(payload.Key, payload.Credential)
	if err != nil {
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}
	c.JSON(code, gin.H{"access-token": jwtToken})
}

func TestCallback(c *gin.Context) {
	var payload struct {
		Key        string `json:"key,omitempty"`
		Credential string `json:"credential"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{"error": "invalid JSON"})
		return
	}

	if payload.Credential == "" {
		c.JSON(400, gin.H{"error": "missing credential"})
		return
	}
	payload.Key = ""

	jwtToken, code, err := user.TestCallback(payload.Credential)
	if err != nil {
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}
	c.JSON(code, gin.H{"access-token": jwtToken})
}
