from typing import Literal
from django import template

register = template.Library()

COLORS = ["yellow", "pink", "purple", "green", "blue"]


@register.filter
def color_by_index(index):
    """Cycle through colors based on index."""
    return COLORS[int(index) % len(COLORS)]


@register.inclusion_tag("home/components/presentation_card.html")
def render_presentation_card(
    title: str | None = None,
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

    return {
        "title": title,
        "class_name": classes,
        "index": index,
    }
