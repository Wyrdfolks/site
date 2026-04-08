from django.conf import settings
from django.http import HttpResponse
from django.template.loader import render_to_string


def robots_txt(request):
    if getattr(settings, "STAGING_PASSWORD", None):
        content = render_to_string("robots.txt")
        return HttpResponse(content, content_type="text/plain")
    return HttpResponse("User-agent: *\nAllow: /\n", content_type="text/plain")
