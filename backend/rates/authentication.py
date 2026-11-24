from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom DRF SessionAuthentication that disables CSRF enforcement
    for API endpoints, allowing SPA / REST clients with credentials
    to execute POST, PUT, PATCH, and DELETE operations without CSRF token errors.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF enforcement for REST API calls
