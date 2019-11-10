from django.urls import path
from .views import Swipe, AddQuestion, Thanks, ApiGetQuestions, AdminView, ApiVoteQuestion

urlpatterns = [
    path('', Swipe.as_view(), name='swipe'),
    path('add', AddQuestion.as_view(), name='addquestion'),
    path('thanks', Thanks.as_view(), name='thanks'),
    path('api/getquestions', ApiGetQuestions.as_view(), name='api_getquestions'),
    path('api/votequestion', ApiVoteQuestion.as_view(), name='api_votequestion'),
    path('admin', AdminView.as_view(), name='admin_view'),
]
