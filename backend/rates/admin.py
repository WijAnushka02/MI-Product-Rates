from django.contrib import admin
from .models import MiProductRate


@admin.register(MiProductRate)
class MiProductRateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sr_id',
        'service',
        'executive_level',
        'rate',
        'status',
        'created_user',
        'created_date',
        'updated_date',
        'attachment_link',
    )
    list_filter = ('status', 'executive_level', 'created_date')
    search_fields = ('sr_id', 'service', 'executive_level', 'created_user', 'comments')
    readonly_fields = ('id', 'sr_id', 'created_date', 'updated_date')
    ordering = ('-id',)

    def attachment_link(self, obj):
        if obj.attachment:
            return obj.attachment.name
        return "No Attachment"
    attachment_link.short_description = "Attachment"
