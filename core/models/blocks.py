from wagtail.blocks import (
    BooleanBlock,
    StructBlock,
    CharBlock,
    TimeBlock,
    URLBlock,
    RichTextBlock,
    ChoiceBlock,
)
from wagtail.images.blocks import ImageBlock

# Blocks for reusable UI components. These are not page-specific


class ButtonBlock(StructBlock):
    label = CharBlock(label="Texte du bouton", default="Billetterie")
    url = URLBlock(label="Lien", required=False)
    variant = ChoiceBlock(
        label="Variant",
        choices=[
            ("primary", "Primary"),
            ("secondary", "Secondary"),
            ("ghost", "Ghost"),
        ],
        default="primary",
    )
    color = ChoiceBlock(
        label="Couleur",
        choices=[
            ("purple", "Violet"),
            ("green", "Vert"),
            ("pink", "Rose"),
        ],
        default="purple",
        required=False,
        help_text="Utilise avec le variant secondary seulement",
    )

    class Meta:
        icon = "pick"
        label = "Bouton"


class FaqItemBlock(StructBlock):
    question = CharBlock(label="Question")
    answer = RichTextBlock(label="Réponse")

    class Meta:
        icon = "help"
        label = "Item de FAQ"


class ScheduleItemBlock(StructBlock):
    title = CharBlock(label="Titre")
    time = TimeBlock(label="Horaire")
    description = RichTextBlock(label="Description", required=False)

    class Meta:
        icon = "date"
        label = "Item du programme"
