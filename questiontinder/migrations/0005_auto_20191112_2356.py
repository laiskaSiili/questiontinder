# Generated by Django 2.2.7 on 2019-11-12 22:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('questiontinder', '0004_auto_20191112_2355'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='topic',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='questiontinder.Topic'),
        ),
    ]
