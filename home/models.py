from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.blocks import StructBlock, CharBlock, URLBlock, RichTextBlock, ListBlock
from wagtail.snippets.blocks import SnippetChooserBlock
from wagtail.admin.panels import FieldPanel

# --- Blocks ---


class HeroBlock(StructBlock):
    title = CharBlock(label="Titre")
    subtitle = CharBlock(label="Sous-titre", required=False)
    tagline = CharBlock(label="Tagline", required=False)
    ticket_url = URLBlock(label="Lien billetterie", required=False)

    class Meta:
        icon = "pick"
        label = "Hero"


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

    class Meta:
        icon = "warning"
        label = "Hero FOMO"


class HomePage(Page):
    body = StreamField(
        [
            ("hero", HeroBlock()),
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
