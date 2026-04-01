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


class LinkBlock(StructBlock):
    label = CharBlock(label="Texte du lien")
    url = URLBlock(label="Lien")
    open_in_new_tab = BooleanBlock(
        label="Ouvrir dans un nouvel onglet?", default=False, required=False
    )

    class Meta:
        icon = "link"
        label = "Lien"


class CardBlock(StructBlock):
    title = CharBlock(label="Titre", required=False)
    subtitle = CharBlock(label="Sous-titre", required=False)
    picture = ImageBlock(label="Image", required=False)
    pictureLabel = CharBlock(label="Label de l'image", required=False)
    pictureAlt = CharBlock(label="Texte alternatif de l'image", required=False)
    size = ChoiceBlock(
        label="Taille",
        choices=[("S", "S"), ("M", "M"), ("L", "L")],
        default="M",
    )
    color = ChoiceBlock(
        label="Couleur",
        choices=[
            ("purple", "Violet"),
            ("green", "Vert"),
            ("pink", "Rose"),
            ("yellow", "Jaune"),
        ],
    )

    class Meta:
        icon = "image"
        label = "Card"


class FaqItemBlock(StructBlock):
    question = CharBlock(label="Question")
    answer = RichTextBlock(label="Reponse")

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
