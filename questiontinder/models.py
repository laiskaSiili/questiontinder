from django.db import models
import uuid

class Question(models.Model):
    question = models.TextField(null=False, blank=False, unique=True)
    votes = models.IntegerField(null=False, blank=False, default=0)

# class OneWayKeys(models.Model):
#     key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)