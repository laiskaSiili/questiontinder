from django.urls import path
from .views import Swipe, AddQuestion, Thanks, ApiGetQuestions, ApiVoteQuestion, Wordcloud, Control

urlpatterns = [
    path('', Swipe.as_view(), name='swipe'),
    path('add/', AddQuestion.as_view(), name='addquestion'),
    path('thanks/', Thanks.as_view(), name='thanks'),
    path('api/getquestions/', ApiGetQuestions.as_view(), name='api_getquestions'),
    path('api/votequestion/', ApiVoteQuestion.as_view(), name='api_votequestion'),
    path('wordcloud/', Wordcloud.as_view(), name='wordcloud'),
    path('control/', Control.as_view(), name='control'),
]
