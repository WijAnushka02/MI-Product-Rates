from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MiProductRateViewSet

router = DefaultRouter()
router.register(r'mi-product-rates', MiProductRateViewSet, basename='mi-product-rate')

urlpatterns = [
    path('', include(router.urls)),
]
