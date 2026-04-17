from django import template

register = template.Library()


# Custom filter to get the first landing page block from the StreamField
@register.filter
def first_landing(blocks):
    for block in blocks:
        if getattr(block, "block_type", None) == "landing_page":
            return block
    return None
