from django.db import models

from modelcluster.models import ClusterableModel
from modelcluster.fields import ParentalKey
from wagtail.models import Orderable
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


@register_setting
class HeaderSettings(ClusterableModel, BaseSiteSetting):
    logo = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Logo",
    )

    panels = [
        FieldPanel("logo"),
        InlinePanel("navigation_links", label="Liens de navigation"),
    ]

    class Meta:
        verbose_name = "Header"


class HeaderNavigationLink(Orderable):
    header = ParentalKey(
        HeaderSettings,
        on_delete=models.CASCADE,
        related_name="navigation_links",
    )
    label = models.CharField("Libellé", max_length=100)
    page = models.ForeignKey(
        "wagtailcore.Page",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Page",
    )
    external_url = models.URLField("URL externe", blank=True)

    panels = [
        FieldPanel("label"),
        FieldPanel("page"),
        FieldPanel("external_url"),
    ]


@register_setting
class FooterSettings(ClusterableModel, BaseSiteSetting):
    press_document = models.ForeignKey(
        "wagtaildocs.Document",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Document Presse & Pro",
    )

    panels = [
        InlinePanel("footer_social_links", label="Liens social media"),
        FieldPanel("press_document"),
        InlinePanel("footer_page_links", label="Liens de pages"),
    ]

    class Meta:
        verbose_name = "Footer"


class FooterSocialLink(Orderable):
    footer = ParentalKey(
        FooterSettings,
        on_delete=models.CASCADE,
        related_name="footer_social_links",
    )
    social_media = models.ForeignKey(
        "core.SocialMediaLink",
        on_delete=models.CASCADE,
        verbose_name="Lien social media",
    )

    panels = [
        FieldPanel("social_media"),
    ]


class FooterPageLink(Orderable):
    footer = ParentalKey(
        FooterSettings,
        on_delete=models.CASCADE,
        related_name="footer_page_links",
    )
    label = models.CharField("Libellé", max_length=100)
    page = models.ForeignKey(
        "wagtailcore.Page",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="Page",
    )

    panels = [
        FieldPanel("label"),
        FieldPanel("page"),
    ]
