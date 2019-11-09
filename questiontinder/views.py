from django.shortcuts import render
from django.views import View


class Home(View):

    def get(self, request):
        ctx = {
            'questions': [
                'Question 1',
                'Question 2',
                'Question 3',
            ]
        }
        return render(request, 'questiontinder/home.html', ctx)