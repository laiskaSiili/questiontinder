from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
from django.views import View
from django.contrib.sessions.models import Session
from .forms import QuestionAddForm
from .models import Question
from random import shuffle
import json


class Swipe(View):

    def get(self, request):
        ctx = {
            'js_variables': {
                'fetch_questions_url': reverse('api_getquestions'),
                'vote_questions_url': reverse('api_votequestion'),
            }
        }
        return render(request, 'questiontinder/swipe.html', ctx)


class AddQuestion(View):

    def get(self, request):
        ctx = {}
        ctx['add_form'] = QuestionAddForm()
        return render(request, 'questiontinder/addquestion.html', ctx)

    def post(self, request):
        ctx = {}
        add_form = QuestionAddForm(request.POST)
        if add_form.is_valid():
            Question.objects.create(**add_form.cleaned_data)
            return redirect('thanks')
        else:
            ctx['add_form'] = add_form
            return render(request, 'questiontinder/addquestion.html', ctx)


class Thanks(View):

    def get(self, request):
        return render(request, 'questiontinder/thanks.html', {})


class ApiGetQuestions(View):

    def post(self, request):
        questions_received_id = request.session.get('questions_received_id', [])
        questions = list(Question.objects.all().values('id', 'question'))
        if questions_received_id:
            questions_ids = set(question['id'] for question in questions)
            questions_received_id_set = set(questions_received_id)
            questions = [question for question in questions if question['id'] not in questions_received_id_set]
        questions = questions[:20]
        shuffle(questions)

        request.session['questions_received_id'] = questions_received_id + [question['id'] for question in questions]
        request.session.set_expiry(3600)

        data = {
            'status': 'OK',
            'questions': questions
        }
        return JsonResponse(data)


class ApiVoteQuestion(View):

    def post(self, request):
        request_data = json.loads(request.body)
        question_id = int(request_data['question_id'])
        upvote_flag = request_data['upvote_flag']
        questions_voted_id = request.session.get('questions_voted_id', [])
        questions_voted_id_set = set(questions_voted_id)
        if upvote_flag and question_id not in questions_voted_id:
            question = Question.objects.get(id=question_id)
            question.votes += 1
            question.save()
        request.session['questions_voted_id'] = questions_voted_id + [question_id]
        request.session.set_expiry(3600)

        data = {
            'status': 'OK',
        }
        return JsonResponse(data)


class AdminView(View):

    def get(self, request):
        ctx = {}
        return render(request, 'questiontinder/adminview.html', ctx)

    def post(self, request):
        if 'reset' in request.POST:
            print('SESSIONS DELETED')
            Session.objects.all().delete()
            #Question.objects.all().delete()
        return redirect('swipe')