// المسار: main.go
package main

import (
	"log"

	"github.com/Yasser-Badr/Bawsala/backend/database"
	"github.com/Yasser-Badr/Bawsala/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// 1. الاتصال بقاعدة البيانات
	database.ConnectDB()

	// 2. تهيئة تطبيق Fiber
	app := fiber.New()

	// 3. إضافة الـ Middlewares (أدوات مساعدة)
	app.Use(logger.New()) // لتسجيل الطلبات في الـ Terminal
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // للسماح للـ Frontend بالاتصال بالـ Backend بدون مشاكل
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// 👇 التعديل هنا: إتاحة مجلد الـ frontend بالكامل للزوار
	// السيرفر هيبحث تلقائياً عن ملف index.html ويعرضه أول ما تفتح الرابط
	app.Static("/", "../frontend")

	// 5. تهيئة مسارات الـ API (الأقسام، المقالات، الإدارة)
	routes.SetupRoutes(app)

	// 6. تشغيل الخادم على بورت 3000
	log.Fatal(app.Listen(":3000"))
}
