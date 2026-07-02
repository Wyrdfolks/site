from .base import *
import os

DEBUG = os.environ.get("DEBUG", "False").strip().lower() == "true"

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-6d&vn5ohzo_#1hh@1k-pb4u8!=$kw+ujgz+7x65ck3$7=s9v8r",
)

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "dev.wyrdfolks.com",
    "footsore-provolone-gating.ngrok-free.dev",
]
INTERNAL_IPS = ["localhost", "127.0.0.1", "footsore-provolone-gating.ngrok-free.dev"]

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

# Staging password protection (only active when STAGING_PASSWORD is set)
STAGING_PASSWORD = os.environ.get("STAGING_PASSWORD")
if STAGING_PASSWORD:
    MIDDLEWARE.insert(0, "core.middleware.StagingPasswordMiddleware")

if "DB_NAME" in os.environ:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ["DB_NAME"],
            "USER": os.environ["DB_USER"],
            "PASSWORD": os.environ["DB_PASSWORD"],
            "HOST": os.environ["DB_HOST"],
            "PORT": os.environ.get("DB_PORT", "3306"),
            "ATOMIC_REQUESTS": True,
            "CONN_MAX_AGE": 600,
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

try:
    from .local import *
except ImportError:
    pass
