// المسار: backend/controllers/auth_controller.go
package controllers

import (
	"os"
	"time"

	"github.com/Yasser-Badr/Bawsala/backend/database"
	"github.com/Yasser-Badr/Bawsala/backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func getSecretKey() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "secret_bawsala_key"
	}
	return secret
}

// دالة تسجيل حساب جديد (أصبحت محمية بـ middleware للسوبر أدمن)
func Register(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "بيانات غير صالحة"})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 10)

	user := models.User{
		Name:     data["name"],
		Email:    data["email"],
		Password: string(hashedPassword),
		Role:     data["role"],
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "حدث خطأ أثناء إنشاء الحساب، قد يكون البريد الإلكتروني مسجل مسبقاً"})
	}

	return c.JSON(fiber.Map{"message": "تم إنشاء الحساب بنجاح"})
}

// دالة تسجيل الدخول
func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "بيانات غير صالحة"})
	}

	var user models.User
	database.DB.Where("email = ?", data["email"]).First(&user)

	if user.ID == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "المستخدم غير موجود"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data["password"])); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "كلمة المرور خاطئة"})
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(getSecretKey()))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "فشل إنشاء التوكن"})
	}

	return c.JSON(fiber.Map{
		"message": "تم تسجيل الدخول بنجاح",
		"token":   t,
		"name":    user.Name,
		"role":    user.Role,
	})
}

type AssignData struct {
	UserID     uint `json:"user_id"`
	CategoryID uint `json:"category_id"`
}

// دالة لتعيين صلاحية قسم لمحرر
func AssignCategoryToEditor(c *fiber.Ctx) error {
	var data AssignData
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "بيانات غير صالحة"})
	}

	var user models.User
	var category models.Category

	database.DB.First(&user, data.UserID)
	database.DB.First(&category, data.CategoryID)

	if user.ID == 0 || category.ID == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "المستخدم أو القسم غير موجود"})
	}

	database.DB.Model(&user).Association("Categories").Append(&category)

	return c.JSON(fiber.Map{"message": "تم إعطاء الصلاحية بنجاح"})
}

// دالة جلب جميع المستخدمين
func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	database.DB.Preload("Categories").Find(&users)

	for i := range users {
		users[i].Password = "" // إخفاء كلمات المرور المشفرة من الرد
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"users": users,
	})
}
