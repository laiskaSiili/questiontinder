# Generated by Django 2.2.7 on 2019-11-12 22:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questiontinder', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='question',
            field=models.TextField(),
        ),
    ]
