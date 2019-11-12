from django.contrib import admin
from .models import Question, Topic

class QuestionAdmin(admin.ModelAdmin):
    pass

class TopicAdmin(admin.ModelAdmin):
    pass

admin.site.register(Question, QuestionAdmin)
admin.site.register(Topic, TopicAdmin)