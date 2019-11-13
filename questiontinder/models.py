from django.db import models
import uuid

class Question(models.Model):
    question = models.TextField(null=False, blank=False, max_length=40)
    votes = models.IntegerField(null=False, blank=False, default=0)
    topic = models.ForeignKey('Topic', null=False, blank=False, on_delete=models.CASCADE, related_name='questions')

    def __str__(self):
        return self.question

class Topic(models.Model):
    name = models.CharField(null=False, blank=False, max_length=20)
    frozen = models.BooleanField(default=False)

    def __str__(self):
        return self.name