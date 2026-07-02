from django.db import models
from django.core.exceptions import ValidationError

from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.models import Orderable


class HeaderNavigationLink(models.Model):
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
    email = models.EmailField("Email", blank=True)

    panels = [
        FieldPanel("label"),
        FieldPanel("page"),
        FieldPanel("external_url"),
        FieldPanel("email"),
    ]

    class Meta:
        abstract = True

    def clean(self):
        has_page = bool(self.page_id)
        has_external = bool(self.external_url)
        has_email = bool(self.email)

        selected_targets = sum([has_page, has_external, has_email])

        if selected_targets == 0:
            raise ValidationError(
                "Renseignez soit une Page, soit une URL externe, soit une adresse email pour le lien."
            )

        if selected_targets > 1:
            raise ValidationError(
                "Choisissez une seule destination: Page, URL externe ou Email."
            )


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
        MultiFieldPanel(
            [
                InlinePanel("nav_bar_left_links", label="Liens gauche"),
                InlinePanel("nav_bar_right_links", label="Liens droite"),
            ],
            heading="Nav bar",
        ),
        MultiFieldPanel(
            [
                InlinePanel("nav_menu_top_links", label="Liens haut"),
                InlinePanel("nav_menu_bottom_links", label="Liens bas"),
            ],
            heading="Nav menu",
        ),
    ]

    class Meta:
        verbose_name = "Header"


class HeaderNavBarLeftLink(Orderable, HeaderNavigationLink):
    header = ParentalKey(
        "HeaderSettings",
        on_delete=models.CASCADE,
        related_name="nav_bar_left_links",
    )


class HeaderNavBarRightLink(Orderable, HeaderNavigationLink):
    header = ParentalKey(
        "HeaderSettings",
        on_delete=models.CASCADE,
        related_name="nav_bar_right_links",
    )


class HeaderNavMenuTopLink(Orderable, HeaderNavigationLink):
    header = ParentalKey(
        "HeaderSettings",
        on_delete=models.CASCADE,
        related_name="nav_menu_top_links",
    )


class HeaderNavMenuBottomLink(Orderable, HeaderNavigationLink):
    header = ParentalKey(
        "HeaderSettings",
        on_delete=models.CASCADE,
        related_name="nav_menu_bottom_links",
    )


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
