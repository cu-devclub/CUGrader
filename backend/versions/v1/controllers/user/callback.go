package user

import (
	"github.com/gin-gonic/gin"
)

func (uc *UserController) Callback(c *gin.Context) {
	var payload struct {
		Key        string `json:"key"`
		Credential string `json:"credential"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{"error": "invalid JSON"})
		return
	}

	if uc.IsDev {
		if payload.Credential == "" {
			c.JSON(400, gin.H{"error": "missing credential"})
			return
		}
		payload.Key = ""
	} else {
		if payload.Key == "" || payload.Credential == "" {
			c.JSON(400, gin.H{"error": "missing key or credential"})
			return
		}
	}

	jwtToken, code, err := uc.Service.Callback(payload.Key, payload.Credential)
	if err != nil {
		c.JSON(code, gin.H{"error": err.Error()})
		return
	}
	c.JSON(code, gin.H{"access-token": jwtToken})
}
