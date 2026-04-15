from django.db import models

from wagtail.models import Page
from wagtail.fields import RichTextField, StreamField
from wagtail.blocks import (
    StructBlock,
    CharBlock,
    RichTextBlock,
    ListBlock,
    DateBlock,
    TimeBlock,
)
from wagtail.snippets.blocks import SnippetChooserBlock
from wagtail.admin.panels import FieldPanel


class FAQItemBlock(StructBlock):
    question = CharBlock(label="Question")
    answer = RichTextBlock(label="Réponse")

    class Meta:
        icon = "help"
        label = "Question / Réponse"


class FAQCategoryBlock(StructBlock):
    title = CharBlock(label="Titre de la catégorie")
    questions = ListBlock(FAQItemBlock(), label="Questions")

    class Meta:
        icon = "list-ul"
        label = "Catégorie"


class AnimationBlock(StructBlock):
    title = CharBlock(label="Titre")
    date = DateBlock(label="Date")
    start_time = TimeBlock(label="Heure")
    description = RichTextBlock(label="Description", required=False)
    guests = ListBlock(
        SnippetChooserBlock("core.Guest"),
        label="Invités",
        min_num=0,
    )

    class Meta:
        icon = "date"
        label = "Animation"


class ProgrammationTabBlock(StructBlock):
    title = CharBlock(label="Titre du tab")
    animations = ListBlock(AnimationBlock(), label="Animations")

    class Meta:
        icon = "tasks"
        label = "Tab"


class AboutCategoryBlock(StructBlock):
    title = CharBlock(label="Titre de la catégorie")
    content = RichTextBlock(label="Contenu", required=False)

    class Meta:
        icon = "list-ul"
        label = "Catégorie"


class AProposPage(Page):
    subtitle = models.CharField("Sous-titre", max_length=255, blank=True)
    content = StreamField(
        [("category", AboutCategoryBlock())],
        blank=True,
        use_json_field=True,
        verbose_name="Contenu",
    )

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
        FieldPanel("content"),
    ]

    parent_page_types = ["home.HomePage"]
    subpage_types = []

    class Meta:
        verbose_name = "À Propos"


class FAQPage(Page):
    subtitle = models.CharField("Sous-titre", max_length=255, blank=True)
    categories = StreamField(
        [("category", FAQCategoryBlock())],
        blank=True,
        use_json_field=True,
        verbose_name="Catégories",
    )

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
        FieldPanel("categories"),
    ]

    parent_page_types = ["home.HomePage"]
    subpage_types = []

    class Meta:
        verbose_name = "FAQ"


class ProgrammationPage(Page):
    subtitle = models.CharField("Sous-titre", max_length=255, blank=True)
    tabs = StreamField(
        [("tab", ProgrammationTabBlock())],
        blank=True,
        use_json_field=True,
        verbose_name="Tabs",
    )

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
        FieldPanel("tabs"),
    ]

    parent_page_types = ["home.HomePage"]
    subpage_types = []

    class Meta:
        verbose_name = "Programmation"
