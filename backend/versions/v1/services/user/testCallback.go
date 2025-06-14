package user

import (
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

func (us *UserService) TestCallback(credential string) (string, int, error) {
	email := credential
	name := "Test User"
	picture := ""

	if !us.IsDev {
		return "", 400, errors.New("This path is not allow on production")
	}

	if !strings.HasSuffix(email, "chula.ac.th") {
		return "", 400, errors.New("email not allow")
	}

	userID, code, err := us.Model.Callback(email, name, picture)
	if err != nil {
		return "", code, err
	}

	nameParts := strings.Fields(name)
	firstname := ""
	lastname := ""
	if len(nameParts) > 0 {
		firstname = nameParts[0]
	}
	if len(nameParts) > 1 {
		lastname = nameParts[len(nameParts)-1]
	}
	role := ""
	if strings.HasSuffix(email, "@student.chula.ac.th") {
		role = "student"
	} else if strings.HasSuffix(email, "@chula.ac.th") {
		role = "teacher"
	}
	claims := jwt.MapClaims{
		"firstname": firstname,
		"lastname":  lastname,
		"email":     email,
		"user_id":   userID,
		"profile":   picture,
		"role":      role,
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(us.JWT_Key)
	if err != nil {
		return "", 500, err
	}

	tokenString = "Bearer " + tokenString

	return tokenString, 200, nil
}
