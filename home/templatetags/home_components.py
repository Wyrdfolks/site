from typing import Literal
from django import template

register = template.Library()

COLORS = ["yellow", "pink", "purple", "green", "blue"]
BOARD_IMAGES = [
    "img/board_1.png",
    "img/board_2.png",
    "img/board_3.png",
    "img/board_4.png",
    "img/board_5.png",
]


@register.filter
def color_by_index(index):
    """Cycle through colors based on index."""
    return COLORS[int(index) % len(COLORS)]


def board_image_by_index(index: int | None) -> str:
    """Cycle through board images based on index."""
    if index is None:
        return BOARD_IMAGES[0]
    return BOARD_IMAGES[int(index) % len(BOARD_IMAGES)]


@register.inclusion_tag("home/components/presentation_card.html")
def render_presentation_card(
    title: str | None = None,
    link: str | None = None,
    color: Literal["pink", "purple", "green", "yellow", "blue"] = "purple",
    index: int | None = None,
    additional_class: str = "",
) -> dict:
    color_classes = {
        "pink": "card-pink bg-wyrd-pink-700 text-white",
        "purple": "card-purple bg-wyrd-purple-500 text-white",
        "green": "card-green bg-wyrd-green-500 text-wyrd-purple-500",
        "yellow": "card-yellow bg-wyrd-yellow-500 text-wyrd-purple-500",
        "blue": "card-blue bg-wyrd-teal-500 text-white",
    }.get(color, "card-purple bg-wyrd-purple-500 text-white")

    classes = " ".join(filter(None, [color_classes, additional_class]))
    board_image = board_image_by_index(index)
    safe_title = title.strip() if isinstance(title, str) else ""

    return {
        "title": safe_title,
        "card_url": link or "",
        "class_name": classes,
        "index": index,
        "board_image": board_image,
    }
