from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.blocks import (
    StructBlock,
    CharBlock,
    URLBlock,
    RichTextBlock,
    ListBlock,
)
from wagtail.snippets.blocks import SnippetChooserBlock
from wagtail.admin.panels import FieldPanel

# --- Blocks ---


class HeroBlock(StructBlock):
    title = CharBlock(label="Titre")
    subtitle = CharBlock(label="Sous-titre", required=False)
    tagline = CharBlock(label="Tagline", required=False)
    ticket_url = URLBlock(label="Lien billetterie", required=False)
    about_url = URLBlock(label="Lien à propos", required=False)
    text_about_url = CharBlock(
        label="Texte du lien à propos",
        required=False,
        default="...Mais avant, qu'est-ce que c'est ?",
    )

    class Meta:
        icon = "pick"
        label = "Hero"


class PresentationBlock(StructBlock):
    title = CharBlock(label="Titre")
    description = RichTextBlock(label="Description", required=False)
    cards = ListBlock(
        CharBlock(label="Texte de la carte"),
        label="Cartes",
        max_num=5,
    )

    class Meta:
        icon = "doc-full"
        label = "Présentation"


class EspacesBlock(StructBlock):
    title = CharBlock(label="Titre")
    subtitle = CharBlock(label="Sous-titre", required=False)
    mondes = ListBlock(
        SnippetChooserBlock("core.Monde"),
        label="Mondes",
    )

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
            ("url", URLBlock(label="Lien du bouton")),
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
    discord_url = URLBlock(label="Lien Discord", required=False)
    ticket_url = URLBlock(label="Lien billetterie", required=False)
    about_text = CharBlock(
        label="Texte d'accroche",
        default="WWyrd - Festival de jeu de rôle immersif - Cité Fertile, Pantin - 11 octobre 2026",
        required=False,
    )

    class Meta:
        icon = "warning"
        label = "Hero FOMO"


class HomePage(Page):
    body = StreamField(
        [
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
