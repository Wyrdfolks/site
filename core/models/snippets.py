from django.db import models

from wagtail.fields import RichTextField
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel, MultiFieldPanel

SOCIAL_MEDIA_TYPES = [
    ("instagram", "Instagram"),
    ("facebook", "Facebook"),
    ("twitter", "Twitter / X"),
    ("tiktok", "TikTok"),
    ("youtube", "YouTube"),
    ("discord", "Discord"),
    ("twitch", "Twitch"),
    ("other", "Autre"),
]


@register_snippet
class SocialMediaLink(models.Model):
    name = models.CharField("Nom", max_length=100)
    url = models.URLField("URL")
    icon = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Icône",
    )
    platform_type = models.CharField(
        "Type de plateforme",
        max_length=20,
        choices=SOCIAL_MEDIA_TYPES,
        default="other",
    )

    panels = [
        FieldPanel("name"),
        FieldPanel("url"),
        FieldPanel("icon"),
        FieldPanel("platform_type"),
    ]

    def __str__(self):
        return f"{self.name} ({self.get_platform_type_display()})"

    class Meta:
        verbose_name = "Lien social media"
        verbose_name_plural = "Liens social media"


@register_snippet
class Guest(models.Model):
    title = models.CharField("Titre", max_length=255)
    subtitle = models.CharField("Sous-titre", max_length=255, blank=True)
    description = RichTextField("Description", blank=True)
    photo = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Photo",
    )

    panels = [
        FieldPanel("title"),
        FieldPanel("subtitle"),
        FieldPanel("description"),
        FieldPanel("photo"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Invité"
        verbose_name_plural = "Invités"


@register_snippet
class Monde(models.Model):
    title = models.CharField("Titre", max_length=255)
    description = RichTextField("Description", blank=True)
    cta_text = models.CharField("Texte du CTA", max_length=100, blank=True)
    cta_link = models.URLField("Lien du CTA", blank=True)

    panels = [
        FieldPanel("title"),
        FieldPanel("description"),
        MultiFieldPanel(
            [
                FieldPanel("cta_text"),
                FieldPanel("cta_link"),
            ],
            heading="Call to Action",
        ),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Monde"
        verbose_name_plural = "Mondes"
