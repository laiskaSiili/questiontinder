from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
from django.views import View
from django.contrib.sessions.models import Session
from .forms import QuestionAddForm, TopicDropdownForm
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
        request_data = json.loads(request.body)
        questions_voted_ids = request.session.get('questions_voted_ids', [])
        prefetched_questions_ids = request.session.get('prefetched_questions_ids', [])
        if request_data.get('clear_prefetched'):
            prefetched_questions_ids = []
        to_exclude = prefetched_questions_ids + questions_voted_ids
        questions = list(Question.objects.all().exclude(id__in=to_exclude).exclude(topic__frozen=True).values('id', 'question'))
        questions = questions[:10]
        shuffle(questions)

        request.session['prefetched_questions_ids'] = prefetched_questions_ids + [question['id'] for question in questions]
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
        questions_voted_ids = request.session.get('questions_voted_ids', [])
        questions_voted_ids_set = set(questions_voted_ids)
        if question_id not in questions_voted_ids:
            request.session['questions_voted_ids'] = questions_voted_ids + [question_id]
            request.session.set_expiry(3600)
            if upvote_flag:
                question = Question.objects.get(id=question_id)
                question.votes += 1
                question.save()

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


class Wordcloud(View):

    def get(self, request):
        ctx = {}
        ctx['topic_dropdown'] = TopicDropdownForm()
        return render(request, 'questiontinder/wordcloud.html', ctx)

    def post(self, request):
        request_data = json.loads(request.body)
        topic_id = int(request_data.get('topic_id'))
        questions = list(Question.objects.all().filter(topic_id=topic_id).order_by('-votes').values('question', 'votes'))
        questions = [{'text': q['question'], 'size': q['votes']} for q in questions]
        data = {
            'status': 'OK',
            'questions': questions,
        }
        return JsonResponse(data)


class Control(View):

    def get(self, request):
        ctx = {}
        return render(request, 'questiontinder/control.html', ctx)

    def post(self, request):
        questions = list(Question.objects.all().select_related('topic__name').order_by('-votes').values_list('votes','question', 'topic__name', 'id'))
        data = {
            'status': 'OK',
            'data': questions,
        }
        return JsonResponse(data)