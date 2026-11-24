import os
from decimal import Decimal
from rest_framework import serializers
from .models import MiProductRate

ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg']
MAX_FILE_SIZE_MB = 10


class MiProductRateSerializer(serializers.ModelSerializer):
    """
    Serializer for MiProductRate model.
    Handles data validation, serialization, and file URL formatting.
    """
    attachment_url = serializers.SerializerMethodField(read_only=True)
    download_url = serializers.SerializerMethodField(read_only=True)
    rate = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = MiProductRate
        fields = [
            'id',
            'sr_id',
            'service',
            'executive_level',
            'rate',
            'created_date',
            'created_user',
            'updated_date',
            'updated_user',
            'status',
            'attachment',
            'attachment_url',
            'download_url',
            'comments',
        ]
        read_only_fields = [
            'id',
            'sr_id',
            'created_date',
            'updated_date',
        ]

    def get_attachment_url(self, obj):
        """
        Build full URL for viewing the uploaded attachment.
        """
        request = self.context.get('request')
        if obj.attachment:
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None

    def get_download_url(self, obj):
        """
        Build full URL for triggering an attachment download.
        """
        request = self.context.get('request')
        if obj.attachment:
            download_path = f"/api/mi-product-rates/{obj.id}/download/"
            if request:
                return request.build_absolute_uri(download_path)
            return download_path
        return None

    def validate_rate(self, value):
        """
        Validates that rate is non-negative and has at most 2 decimal places.
        """
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Rate cannot be negative.")

        exponent = abs(value.as_tuple().exponent)
        if exponent > 2:
            raise serializers.ValidationError("Rate cannot have more than 2 decimal places.")
        return value

    def validate_service(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Service name is required.")
        return value.strip()

    def validate_executive_level(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Executive Level is required.")
        return value.strip()

    def validate_status(self, value):
        if value not in ['Active', 'Inactive']:
            raise serializers.ValidationError("Status must be either 'Active' or 'Inactive'.")
        return value

    def validate_attachment(self, file_obj):
        """
        Validates file size (max 10MB) and allowed extensions.
        """
        if file_obj:
            if file_obj.size > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise serializers.ValidationError(f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_MB}MB.")

            ext = os.path.splitext(file_obj.name)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(
                    f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
                )
        return file_obj

    def create(self, validated_data):
        """
        Auto-assign SR_ID if not already present.
        """
        if 'sr_id' not in validated_data or not validated_data['sr_id']:
            validated_data['sr_id'] = MiProductRate.generate_next_sr_id()
        return super().create(validated_data)
