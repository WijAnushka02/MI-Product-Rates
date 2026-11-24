from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import MiProductRate
from .serializers import MiProductRateSerializer


class MiProductRateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for full CRUD operations on MI Product Rates:
    - GET /api/mi-product-rates/ (List)
    - GET /api/mi-product-rates/<id>/ (Retrieve)
    - POST /api/mi-product-rates/ (Create)
    - PUT/PATCH /api/mi-product-rates/<id>/ (Update)
    - DELETE /api/mi-product-rates/<id>/ (Destroy)
    """
    queryset = MiProductRate.objects.all().order_by('-id')
    serializer_class = MiProductRateSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sr_id', 'service', 'executive_level', 'created_user', 'status']
    ordering_fields = ['id', 'sr_id', 'rate', 'created_date', 'status']

    def perform_create(self, serializer):
        created_user = self.request.data.get('created_user') or 'System Admin'
        serializer.save(created_user=created_user)

    def perform_update(self, serializer):
        updated_user = self.request.data.get('updated_user') or 'System Admin'
        serializer.save(updated_user=updated_user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Clean up physical file attachment if exists
        if instance.attachment:
            instance.attachment.delete(save=False)
        self.perform_destroy(instance)
        return Response(
            {"message": f"Product rate record {instance.sr_id} successfully deleted."},
            status=status.HTTP_200_OK
        )
