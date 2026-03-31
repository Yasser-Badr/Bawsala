// المسار: controllers/category_controller.go
package controllers

import (
	"github.com/Yasser-Badr/Bawsala/backend/database"
	"github.com/Yasser-Badr/Bawsala/backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ==========================================
// 1. مسارات الإدارة (تحتاج صلاحيات أدمن)
// ==========================================

// إضافة قسم جديد (Create Category)
func CreateCategory(c *fiber.Ctx) error {
	category := new(models.Category)

	// استقبال البيانات (Name, Slug, Description)
	if err := c.BodyParser(category); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "بيانات غير صالحة",
		})
	}

	// حفظ القسم في قاعدة البيانات
	if err := database.DB.Create(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "حدث خطأ أثناء حفظ القسم، قد يكون الـ Slug أو الاسم مكرراً",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  "تم إضافة القسم بنجاح!",
		"category": category,
	})
}

// تعديل قسم (Update Category)
func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category

	// البحث عن القسم
	if err := database.DB.First(&category, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "القسم غير موجود",
		})
	}

	// استقبال التعديلات
	if err := c.BodyParser(&category); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "بيانات غير صالحة",
		})
	}

	database.DB.Save(&category)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "تم تعديل القسم بنجاح",
		"category": category,
	})
}

// حذف قسم (Delete Category)
func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category

	if err := database.DB.First(&category, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "القسم غير موجود",
		})
	}

	database.DB.Delete(&category)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "تم حذف القسم بنجاح",
	})
}

// ==========================================
// 2. المسارات العامة (للزوار)
// ==========================================

// عرض جميع الأقسام (Get All Categories)
func GetAllCategories(c *fiber.Ctx) error {
	var categories []models.Category

	// جلب كل الأقسام من قاعدة البيانات
	database.DB.Find(&categories)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"categories": categories,
	})
}

// عرض قسم واحد مع المقالات الخاصة به (Get Category By Slug)
func GetCategoryBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var category models.Category

	// 👇 التعديل: جلب القسم مع فلاتر للمقالات (منشورة فقط + ترتيب بالأحدث)
	err := database.DB.Preload("Articles", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_published = ?", true).Order("created_at desc")
	}).Where("slug = ?", slug).First(&category).Error

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "القسم غير موجود",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"category": category,
	})
}

// جلب الأقسام المسموح للمحرر بالنشر فيها
func GetMyCategories(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	userIDRaw := c.Locals("user_id")
	var userID uint
	if userIDRaw != nil {
		userID = uint(userIDRaw.(float64))
	}

	if role == "superadmin" {
		var categories []models.Category
		database.DB.Find(&categories)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"categories": categories})
	}

	var user models.User
	if err := database.DB.Preload("Categories").First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "المستخدم غير موجود"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"categories": user.Categories})
}
