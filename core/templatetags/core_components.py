from typing import Literal
from django import template

register = template.Library()

BUTTON_VARIANT_CLASSES = {
    "primary": "btn-primary",
    "secondary": "btn-secondary",
    "ghost": "btn-ghost",
}

BUTTON_SECONDARY_COLOR_CLASSES = {
    "green": "btn-green",
    "pink": "btn-pink",
    "purple": "btn-purple",
}


def build_button_classes(
    variant: Literal["primary", "secondary", "ghost"],
    color: Literal["pink", "purple", "green"],
    size: Literal["small", "medium"],
    disabled: bool,
    additional_class: str,
) -> str:
    class_names = ["btn", BUTTON_VARIANT_CLASSES.get(variant, "btn-primary")]

    if variant == "secondary" or variant == "ghost":
        class_names.append(BUTTON_SECONDARY_COLOR_CLASSES.get(color, "btn-purple"))
    if variant == "ghost" and size == "small":
        class_names.append("btn-small")
    if disabled:
        class_names.append("is-disabled")
    if additional_class:
        class_names.append(additional_class)

    return " ".join(class_names)


@register.inclusion_tag("includes/button.html")
def render_button(
    label: str | None = None,
    url: str | None = None,
    variant: Literal["primary", "secondary", "ghost"] = "primary",
    color: Literal[
        "pink", "purple", "green"
    ] = "purple",  ## only applied to secondary and ghost variants
    size: Literal["small", "medium"] = "medium",  ## only applied to ghost variant
    disabled: bool = False,
    additional_class: str = "",
    target: str = "",
    rel: str = "",
) -> dict:
    """
    Render the shared button component from `includes/button.html`.
    Returns a template context with the computed classes based on
    variant, color, size, and disabled state, as well as other
    attributes like href, target.
    """
    classes = build_button_classes(variant, color, size, disabled, additional_class)

    return {
        "href": url or "",
        "label": label,
        "classes": classes,
        "show_icon": variant == "ghost",
        "target": target,
        "rel": f"noopener noreferrer {rel}" if rel else "noopener noreferrer",
        "is_disabled": disabled,
    }
