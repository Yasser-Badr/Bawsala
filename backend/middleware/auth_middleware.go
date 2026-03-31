// المسار: backend/middleware/auth_middleware.go
package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// جلب المفتاح السري من البيئة، أو استخدام قيمة افتراضية للتطوير فقط
func getSecretKey() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "secret_bawsala_key" // للتطوير فقط، يجب تغييره في السيرفر
	}
	return secret
}

// التأكد من تسجيل الدخول (لأي مستخدم)
func IsAuthenticated(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "غير مصرح لك بالدخول، يرجى تسجيل الدخول",
		})
	}

	tokenString := strings.Split(authHeader, "Bearer ")
	if len(tokenString) != 2 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "صيغة التوكن غير صحيحة",
		})
	}

	token, err := jwt.Parse(tokenString[1], func(token *jwt.Token) (interface{}, error) {
		return []byte(getSecretKey()), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "التوكن غير صالح أو منتهي الصلاحية",
		})
	}

	claims := token.Claims.(jwt.MapClaims)

	c.Locals("user_id", claims["user_id"])
	c.Locals("role", claims["role"])

	return c.Next()
}

// التأكد من أن المستخدم مدير عام (Superadmin)
func IsSuperAdmin(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "عذراً، هذه الصلاحية مخصصة للمدير العام فقط!",
		})
	}
	return c.Next()
}
