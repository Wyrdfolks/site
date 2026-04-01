from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-6d&vn5ohzo_#1hh@1k-pb4u8!=$kw+ujgz+7x65ck3$7=s9v8r"

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]
INTERNAL_IPS = ["localhost", "127.0.0.1"]

INSTALLED_APPS += [
    "django_browser_reload",
]

MIDDLEWARE += [
    "django_browser_reload.middleware.BrowserReloadMiddleware",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0

try:
    from .local import *
except ImportError:
    pass
