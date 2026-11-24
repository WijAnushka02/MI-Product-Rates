import os
import re
from decimal import Decimal
from django.db import models, transaction
from django.core.validators import MinValueValidator


def attachment_upload_path(instance, filename):
    """
    Generate clean upload path for attachments:
    e.g., attachments/SR001/rate_approval.pdf
    """
    folder = instance.sr_id if instance.sr_id else "temp"
    return os.path.join("attachments", folder, filename)


class MiProductRate(models.Model):
    """
    Model representing table SIA_MI_PRODUCT_RATES in Oracle Database.
    Stores telecommunication MI product rates, executive tiers,
    audit metadata, and optional document attachments.
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    id = models.AutoField(
        primary_key=True,
        db_column='ID',
        help_text="Unique auto-incrementing primary key"
    )

    sr_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        db_column='SR_ID',
        help_text="Unique auto-generated identifier (e.g., SR001)"
    )

    service = models.CharField(
        max_length=150,
        db_column='SERVICE',
        help_text="Service Name (e.g., Dedicated Internet, Cloud Connect)"
    )

    executive_level = models.CharField(
        max_length=100,
        db_column='EXECUTIVE_LEVEL',
        help_text="Executive Level Name (e.g., Enterprise Gold, Platinum)"
    )

    rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        db_column='RATE',
        help_text="Rate amount with up to 12 digits and 2 decimal places"
    )

    created_date = models.DateTimeField(
        auto_now_add=True,
        db_column='CREATED_DATE',
        help_text="Creation timestamp"
    )

    created_user = models.CharField(
        max_length=100,
        db_column='CREATED_USER',
        help_text="Username who created the record"
    )

    updated_date = models.DateTimeField(
        auto_now=True,
        db_column='UPDATED_DATE',
        help_text="Last updated timestamp"
    )

    updated_user = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_column='UPDATED_USER',
        help_text="Username who last updated the record"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active',
        db_column='STATUS',
        help_text="Record status (Active / Inactive)"
    )

    attachment = models.FileField(
        upload_to=attachment_upload_path,
        null=True,
        blank=True,
        db_column='ATTACHMENT',
        help_text="Optional supporting document / rate card file"
    )

    comments = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        db_column='COMMENTS',
        help_text="Optional remarks or notes"
    )

    class Meta:
        db_table = 'SIA_MI_PRODUCT_RATES'
        verbose_name = 'MI Product Rate'
        verbose_name_plural = 'MI Product Rates'
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.sr_id} - {self.service} ({self.executive_level}): {self.rate}"

    @classmethod
    def generate_next_sr_id(cls):
        """
        Calculates the next sequential SR_ID (e.g., SR001, SR002...).
        Safely scans existing records to find the maximum integer suffix.
        """
        with transaction.atomic():
            records = cls.objects.filter(sr_id__startswith='SR').values_list('sr_id', flat=True)
            max_num = 0
            for sr in records:
                match = re.search(r'SR(\d+)', str(sr))
                if match:
                    val = int(match.group(1))
                    if val > max_num:
                        max_num = val
            next_num = max_num + 1
            return f"SR{next_num:03d}"

    def save(self, *args, **kwargs):
        """
        Automatically populate SR_ID on save if not provided.
        """
        if not self.sr_id:
            self.sr_id = self.generate_next_sr_id()
        super().save(*args, **kwargs)
