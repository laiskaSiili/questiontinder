from django.db import models
import uuid

class Question(models.Model):
    question = models.TextField(null=False, blank=False, max_length=40)
    votes = models.IntegerField(null=False, blank=False, default=0)
    topic = models.ForeignKey('Topic', null=False, blank=False, on_delete=models.CASCADE, related_name='questions')
    added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question

class Topic(models.Model):
    name = models.CharField(null=False, blank=False, max_length=20)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name