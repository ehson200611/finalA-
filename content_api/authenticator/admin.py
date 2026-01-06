from django.contrib import admin
from .models import AdminUser, NotificationAdmin, UserProfile

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['name', 'phoneNumber', 'role', 'is_active']
    search_fields = ['name', 'phoneNumber']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['get_user_name', 'phone']
    search_fields = ['user__name', 'phone']
    
    def get_user_name(self, obj):
        return obj.user.name
    get_user_name.short_description = 'User Name'

@admin.register(NotificationAdmin)
class NotificationAdminAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'type', 'status', 'date']
    list_filter = ['type', 'status', 'date']


