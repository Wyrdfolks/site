import base64

from django.conf import settings
from django.http import HttpResponse


class StagingPasswordMiddleware:
    """Block access to the staging environment behind HTTP Basic Auth.

    Activated only when STAGING_PASSWORD is set in settings.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        password = getattr(settings, "STAGING_PASSWORD", None)
        if not password:
            return self.get_response(request)

        if request.path.startswith(settings.STATIC_URL) or request.path.startswith(settings.MEDIA_URL):
            return self.get_response(request)

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Basic "):
            try:
                decoded = base64.b64decode(auth_header[6:]).decode("utf-8")
                _, provided_password = decoded.split(":", 1)
                if provided_password == password:
                    return self.get_response(request)
            except (ValueError, UnicodeDecodeError):
                pass

        response = HttpResponse("Access denied", status=401)
        response["WWW-Authenticate"] = 'Basic realm="Staging"'
        return response
