// المسار: backend/database/database_config.go
package database

import (
	"fmt"
	"log"
	"os"

	"github.com/Yasser-Badr/Bawsala/backend/models"
	"gorm.io/driver/postgres" // 👈 استخدمنا درايفر بوستجريس
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	var err error

	// جلب بيانات الاتصال من ملف البيئة .env
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// إنشاء نص الاتصال (DSN)
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Africa/Cairo",
		host, user, password, dbname, port)

	// الاتصال بـ PostgreSQL
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("❌ فشل الاتصال بقاعدة بيانات PostgreSQL! \nتأكد من صحة بيانات الـ .env ومن تشغيل خدمة قواعد البيانات\n", err)
	}

	fmt.Println("✅ تم الاتصال بقاعدة بيانات PostgreSQL بنجاح!")

	// تفعيل الجداول (Auto Migration)
	err = DB.AutoMigrate(&models.User{}, &models.Category{}, &models.Article{})
	if err != nil {
		log.Fatal("❌ فشل في إنشاء الجداول: \n", err)
	}

	fmt.Println("✅ تم إنشاء الجداول بنجاح!")
}
