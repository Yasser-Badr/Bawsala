// المسار: backend/routes/api.go
package routes

import (
	"github.com/Yasser-Badr/Bawsala/backend/controllers"
	"github.com/Yasser-Badr/Bawsala/backend/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/login", controllers.Login)

	//api.Post("/setup-first-admin", controllers.Register)

	api.Get("/categories", controllers.GetAllCategories)
	api.Get("/categories/:slug", controllers.GetCategoryBySlug)
	api.Get("/articles", controllers.GetPublishedArticles)
	api.Get("/articles/:slug", controllers.GetArticleBySlug)

	// 👇 المسار الجديد لاحتساب المشاهدات (يتم استدعاؤه بعد دقيقة من الفرونت إند)
	api.Post("/articles/:slug/view", controllers.IncrementView)

	api.Get("/search", controllers.GlobalSearch) // 👈 مسار البحث المباشر

	adminGroup := app.Group("/api/admin")

	adminGroup.Use(middleware.IsAuthenticated)

	adminGroup.Get("/my-categories", controllers.GetMyCategories)
	adminGroup.Get("/my-articles", controllers.GetMyArticles)

	adminGroup.Post("/articles", controllers.CreateArticle)
	adminGroup.Put("/articles/:id", controllers.UpdateArticle)
	adminGroup.Delete("/articles/:id", controllers.DeleteArticle)

	adminGroup.Post("/register", middleware.IsSuperAdmin, controllers.Register)
	adminGroup.Post("/categories", middleware.IsSuperAdmin, controllers.CreateCategory)
	adminGroup.Put("/categories/:id", middleware.IsSuperAdmin, controllers.UpdateCategory)
	adminGroup.Delete("/categories/:id", middleware.IsSuperAdmin, controllers.DeleteCategory)
	adminGroup.Post("/assign-category", middleware.IsSuperAdmin, controllers.AssignCategoryToEditor)
	adminGroup.Get("/users", middleware.IsSuperAdmin, controllers.GetAllUsers)
}
