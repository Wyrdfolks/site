from django.db import migrations


def set_empty_json(apps, schema_editor):
    HomePage = apps.get_model("home", "HomePage")
    HomePage.objects.filter(body="").update(body="[]")


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0003_homepage_body"),
    ]

    operations = [
        migrations.RunPython(set_empty_json, migrations.RunPython.noop),
    ]
