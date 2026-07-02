from django.core.exceptions import ValidationError

from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.blocks import (
    StructBlock,
    CharBlock,
    TextBlock,
    URLBlock,
    RichTextBlock,
    ListBlock,
    PageChooserBlock,
    ChoiceBlock,
)
from wagtail.images.blocks import ImageChooserBlock
from wagtail.snippets.blocks import SnippetChooserBlock
from wagtail.admin.panels import FieldPanel

# --- Blocks ---


class LinkBlock(StructBlock):
    HOMEPAGE_SECTION_CHOICES = [
        ("home-hero", "Accueil - Hero"),
        ("home-presentation", "Accueil - Presentation"),
        ("home-espaces", "Accueil - Espaces"),
        ("home-espaces-mondes", "Accueil - Espaces mondes"),
        ("home-guests", "Accueil - Invites"),
        ("home-info", "Accueil - Infos pratiques"),
        ("home-ticker", "Accueil - Ticker"),
        ("home-hero-fomo", "Accueil - Hero FOMO"),
    ]

    page = PageChooserBlock(label="Page interne", required=False)
    section_anchor = ChoiceBlock(
        choices=HOMEPAGE_SECTION_CHOICES,
        label="Section de la page d'accueil",
        required=False,
        help_text="Optionnel. Utilisé seulement si la page interne choisie est la page d'accueil.",
    )
    external_url = URLBlock(label="URL externe", required=False)

    def clean(self, value):
        value = super().clean(value)
        page = value.get("page")
        section_anchor = value.get("section_anchor")
        external_url = value.get("external_url")

        if page and external_url:
            raise ValidationError(
                "Choisissez soit une page interne, soit une URL externe, pas les deux."
            )

        if section_anchor and not page:
            raise ValidationError(
                {
                    "section_anchor": "Choisissez d'abord une page interne avant de renseigner une section."
                }
            )

        if section_anchor and page and page.content_type.model != "homepage":
            raise ValidationError(
                {
                    "section_anchor": "La section est disponible uniquement quand la page d'accueil est selectionnée."
                }
            )

        return value

    class Meta:
        icon = "link"
        label = "Lien"


class LandingPageBlock(StructBlock):
    title = CharBlock(
        label="Titre",
        placeholder="Incarne l'histoire",
        default="Incarne l'histoire",
    )
    subtitle = TextBlock(
        label="Sous-titre",
        placeholder="L'histoire s'écrit. Le site aussi.\nEn attendant, la suite est par ici...",
        default="L'histoire s'écrit. Le site aussi.\nEn attendant, la suite est par ici...",
    )
    tagline = CharBlock(
        label="Tagline",
        placeholder="Cité Fertile - Pantin - 11 oct. 2026",
        default="Cité Fertile - Pantin - 11 oct. 2026",
    )
    ticket_url = URLBlock(
        label="Lien billetterie",
        default="https://www.helloasso.com/associations/wyrd/evenements/billetterie-wyrd-2026",
    )
    instagram_url = URLBlock(
        label="Lien Instagram", default="https://www.instagram.com/wyrd.folks/"
    )
    ticker_text = ListBlock(
        CharBlock(label="Texte"),
        label="Textes défilants",
        default=[
            "zero prerequis",
            "observe",
            "joue en famille",
        ],
    )

    class Meta:
        icon = "home"
        label = "Landing page Ludiverse"
        description = "Landing page de la page d'accueil du site pour Ludiverse, avec titre, sous-titre, tagline et liens vers la billetterie et Instagram. Si ce bloc est utilisé, aucun autre block de la page ne sera affiché."


class HeroBlock(StructBlock):
    title = CharBlock(label="Titre")
    subtitle = CharBlock(label="Sous-titre", required=False)
    tagline = CharBlock(label="Tagline", required=False)
    ticket_url = LinkBlock(label="Lien billetterie", required=False)
    about_url = LinkBlock(label="Lien à propos", required=False)
    text_about_url = CharBlock(
        label="Texte du lien à propos",
        required=False,
        default="...Mais avant, qu'est-ce que c'est ?",
    )

    class Meta:
        icon = "pick"
        label = "Hero"


class PresentationBlock(StructBlock):
    class PresentationCardBlock(StructBlock):
        text = CharBlock(label="Texte de la carte")
        link = LinkBlock(label="Lien", required=False)

        class Meta:
            icon = "link"
            label = "Carte"

    title = CharBlock(label="Titre")
    description = RichTextBlock(label="Description", required=False)
    cards = ListBlock(
        PresentationCardBlock(),
        label="Cartes",
        max_num=5,
    )

    class Meta:
        icon = "doc-full"
        label = "Présentation"


class EspacesBlock(StructBlock):
    intro = CharBlock(label="Introduction", required=False)
    title = CharBlock(label="Titre")
    subtitle = CharBlock(label="Sous-titre", required=False)
    mondes = ListBlock(
        SnippetChooserBlock("core.Monde"),
        label="Mondes",
    )
    picture = ImageChooserBlock(label="Image", required=False)

    class Meta:
        icon = "globe"
        label = "Espaces"


class GuestsBlock(StructBlock):
    title = CharBlock(label="Titre")
    guests = ListBlock(
        SnippetChooserBlock("core.Guest"),
        label="Invités",
    )
    teaser_text = CharBlock(
        label="Texte d'accroche", default="Et bien plus encore...", required=False
    )
    cta = StructBlock(
        [
            (
                "label",
                CharBlock(label="Texte du bouton", default="Voir le programme"),
            ),
            ("url", LinkBlock(label="Lien du bouton")),
        ],
        label="Call to action",
        required=False,
    )

    class Meta:
        icon = "group"
        label = "Invités"


class InfoBlock(StructBlock):
    title = CharBlock(label="Titre")
    access = RichTextBlock(label="Accès", required=False)
    schedule = RichTextBlock(label="Horaires", required=False)
    directions_link = LinkBlock(label="Lien vers la page d'accès", required=False)
    faq_link = LinkBlock(label="Lien vers la FAQ", required=False)
    picture = ImageChooserBlock(label="Image", required=False)

    class Meta:
        icon = "info-circle"
        label = "Info"


class TickerBlock(StructBlock):
    texts = ListBlock(
        CharBlock(label="Texte"),
        label="Textes défilants",
    )

    class Meta:
        icon = "arrows-up-down"
        label = "Ticker"


class HeroFomoBlock(StructBlock):
    title = CharBlock(label="Titre")
    social_links = ListBlock(
        SnippetChooserBlock("core.SocialMediaLink"),
        label="Liens social media",
    )
    discord_url = LinkBlock(label="Lien Discord", required=False)
    ticket_url = LinkBlock(label="Lien billetterie", required=False)
    about_text = CharBlock(
        label="Texte d'accroche",
        default="Wyrd - Festival de jeu de rôle immersif - Cité Fertile, Pantin - 11 octobre 2026",
        required=False,
    )

    class Meta:
        icon = "warning"
        label = "Hero FOMO"


class HomePage(Page):
    body = StreamField(
        [
            ("landing_page", LandingPageBlock()),
            ("hero", HeroBlock()),
            ("presentation", PresentationBlock()),
            ("espaces", EspacesBlock()),
            ("guests", GuestsBlock()),
            ("info", InfoBlock()),
            ("ticker", TickerBlock()),
            ("hero_fomo", HeroFomoBlock()),
        ],
        blank=True,
        use_json_field=True,
        verbose_name="Sections",
    )

    content_panels = Page.content_panels + [
        FieldPanel("body"),
    ]

    subpage_types = [
        "core.AProposPage",
        "core.FAQPage",
        "core.ProgrammationPage",
        "blog.BlogIndexPage",
    ]

    class Meta:
        verbose_name = "Page d'accueil"
