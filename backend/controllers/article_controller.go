// المسار: controllers/article_controller.go
package controllers

import (
	"github.com/Yasser-Badr/Bawsala/backend/database"
	"github.com/Yasser-Badr/Bawsala/backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// 1. إضافة مقال جديد
func CreateArticle(c *fiber.Ctx) error {
	article := new(models.Article)

	if err := c.BodyParser(article); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "خطأ في قراءة البيانات",
		})
	}

	userIDRaw := c.Locals("user_id")
	var userID uint
	if userIDRaw != nil {
		userID = uint(userIDRaw.(float64))
	}

	roleRaw := c.Locals("role")
	var role string
	if roleRaw != nil {
		role = roleRaw.(string)
	}

	if role != "superadmin" {
		var user models.User
		database.DB.Preload("Categories").First(&user, userID)

		hasPermission := false
		for _, cat := range user.Categories {
			if cat.ID == article.CategoryID {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "عذراً، أنت لا تملك صلاحية النشر في هذا القسم!",
			})
		}
	}

	article.AuthorID = userID
	article.IsPublished = true

	if err := database.DB.Create(&article).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "حدث خطأ أثناء حفظ المقال في قاعدة البيانات",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "تم إضافة المقال بنجاح!",
		"article": article,
	})
}

// 2. تعديل مقال
func UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	var article models.Article

	// جلب المقال القديم
	if err := database.DB.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "المقال غير موجود",
		})
	}

	// ⚠️ حفظ القيم الحساسة القديمة عشان البارسر ميمسحهاش ويصفرها بالغلط
	authorID := article.AuthorID
	views := article.Views
	createdAt := article.CreatedAt

	// استقبال التعديلات الجديدة
	if err := c.BodyParser(&article); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "خطأ في قراءة البيانات المرسلة",
		})
	}

	// ✅ استرجاع القيم وإجبار حالة النشر
	article.AuthorID = authorID
	article.Views = views
	article.CreatedAt = createdAt
	article.IsPublished = true // 👈 السطر ده هيمنع المقال من الاختفاء للزوار

	database.DB.Save(&article)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "تم تعديل المقال بنجاح!",
		"article": article,
	})
}

// 3. حذف مقال
func DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	var article models.Article

	if err := database.DB.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "المقال غير موجود",
		})
	}

	database.DB.Delete(&article)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "تم حذف المقال بنجاح!",
	})
}

// ==========================================
// مسارات عامة للزوار
// ==========================================

func GetPublishedArticles(c *fiber.Ctx) error {
	var articles []models.Article

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	database.DB.Preload("Category").
		Where("is_published = ?", true).
		Order("created_at desc").
		Offset(offset).
		Limit(limit).
		Find(&articles)

	var total int64
	database.DB.Model(&models.Article{}).Where("is_published = ?", true).Count(&total)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": articles,
		"meta": fiber.Map{
			"total_articles": total,
			"page":           page,
			"limit":          limit,
		},
	})
}

// عرض المقال للزائر (بدون حساب مشاهدة)
func GetArticleBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var article models.Article

	if err := database.DB.Preload("Category").Where("slug = ? AND is_published = ?", slug, true).First(&article).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "المقال غير موجود أو غير منشور",
		})
	}

	// ❌ تم إزالة كود زيادة المشاهدات من هنا

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"article": article,
	})
}

// مسار جديد لزيادة عدد المشاهدات بناءً على طلب من الـ Frontend
func IncrementView(c *fiber.Ctx) error {
	slug := c.Params("slug")

	// تنفيذ استعلام مباشر لتحديث المشاهدات بدون تحميل المقال بالكامل لتوفير الأداء
	result := database.DB.Model(&models.Article{}).Where("slug = ?", slug).UpdateColumn("views", gorm.Expr("views + ?", 1))

	if result.Error != nil || result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "المقال غير موجود",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "تم احتساب المشاهدة",
	})
}

// جلب مقالات المحرر فقط (أو كل المقالات للسوبر أدمن)
func GetMyArticles(c *fiber.Ctx) error {
	role := c.Locals("role").(string)

	userIDRaw := c.Locals("user_id")
	var userID uint
	if userIDRaw != nil {
		userID = uint(userIDRaw.(float64))
	}

	var articles []models.Article

	if role == "superadmin" {
		database.DB.Preload("Category").Order("created_at desc").Find(&articles)
	} else {
		database.DB.Preload("Category").Where("author_id = ?", userID).Order("created_at desc").Find(&articles)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": articles})
}

// أضف هذه الدالة في آخر ملف backend/controllers/article_controller.go

// دالة البحث المباشر (Live Search)
func GlobalSearch(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"articles":   []models.Article{},
			"categories": []models.Category{},
		})
	}

	searchPattern := "%" + query + "%"
	var articles []models.Article
	var categories []models.Category

	// 👇 التعديل هنا: ضفنا (title LIKE ? OR content LIKE ?) عشان يبحث في العنوان والمحتوى مع بعض
	// ومهم جداً الأقواس () عشان نتأكد إنه بيجيب المقالات المنشورة بس
	database.DB.Where("is_published = ? AND (title LIKE ? OR content LIKE ?)", true, searchPattern, searchPattern).
		Limit(5).
		Find(&articles)

	// 👇 التعديل هنا: خلينا البحث في الأقسام يشمل (اسم القسم) أو (وصف القسم)
	database.DB.Where("name LIKE ? OR description LIKE ?", searchPattern, searchPattern).
		Limit(3).
		Find(&categories)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"articles":   articles,
		"categories": categories,
	})
}
