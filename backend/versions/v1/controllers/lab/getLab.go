package lab

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (lc *LabController) GetLabsByClassIDHandler(ctx *gin.Context) {
	authHeader := ctx.GetHeader("Authentication")

	claims, err := lc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	if claims.Role != "teacher" && claims.Role != "admin" && claims.Role != "student" {
		ctx.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to access this resource"})
		return
	}

	role := claims.Role
	userID := claims.UserID

	classIDStr := ctx.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	labs, err := lc.Service.GetLabs(classID, userID, role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch labs"})
		return
	}

	ctx.JSON(http.StatusOK, labs)
}
