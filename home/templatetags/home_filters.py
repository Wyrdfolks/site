from django import template
from wagtail.models import Page

register = template.Library()


# Custom filter to get the first landing page block from the StreamField
@register.filter
def first_landing(blocks):
    for block in blocks:
        if getattr(block, "block_type", None) == "landing_page":
            return block
    return None


@register.filter
def linkblock_url(link_value):
    if not link_value:
        return ""

    if isinstance(link_value, str):
        return link_value.strip()

    if not hasattr(link_value, "get"):
        return ""

    page = link_value.get("page")
    external_url = link_value.get("external_url")
    section_anchor = link_value.get("section_anchor")

    if page:
        if not hasattr(page, "url"):
            page_id = None
            if isinstance(page, int):
                page_id = page
            elif isinstance(page, str) and page.isdigit():
                page_id = int(page)

            if page_id is not None:
                page = Page.objects.filter(pk=page_id).first()

        if not page:
            return ""

        base_url = page.url or ""
        if section_anchor and page.content_type.model == "homepage":
            return f"{base_url}#{section_anchor}"
        return base_url

    return external_url or ""
