from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
from django.views import View
from django.contrib.sessions.models import Session
from django.utils import timezone
from .decorators import superuser_required
from .forms import QuestionAddForm, TopicDropdownForm
from .models import Question, Topic
from random import shuffle
import json
from datetime import timedelta


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
        questions = list(Question.objects.all().exclude(id__in=to_exclude).filter(topic__active=True).values('id', 'question'))
        questions = questions[:5]
        shuffle(questions)

        request.session['prefetched_questions_ids'] = prefetched_questions_ids + [question['id'] for question in questions]
        request.session.set_expiry(36000)

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
            request.session.set_expiry(36000)
            if upvote_flag:
                question = Question.objects.get(id=question_id)
                question.votes += 1
                question.save()

        data = {
            'status': 'OK',
        }
        return JsonResponse(data)


class Wordcloud(View):

    TIME_DELAY_SECONDS = 5

    def get(self, request):
        ctx = {}
        ctx['topic_dropdown'] = TopicDropdownForm()
        return render(request, 'questiontinder/wordcloud.html', ctx)

    def post(self, request):
        request_data = json.loads(request.body)
        topic_id = int(request_data.get('topic_id'))
        questions = list(Question.objects.all().filter(topic_id=topic_id).filter(added__lt=timezone.now() - timedelta(seconds=Wordcloud.TIME_DELAY_SECONDS)).order_by('-votes').values('question', 'votes'))
        # questions = [{'text': q['question'], 'size': q['votes']} for q in questions]
        data = {
            'status': 'OK',
            'topicId': topic_id,
            'questions': questions,
        }
        return JsonResponse(data)


@superuser_required()
class Control(View):

    def get(self, request):
        ctx = {}
        ctx['topics'] = Topic.objects.all()
        return render(request, 'questiontinder/control.html', ctx)

    def post(self, request):

        if request.body:
            request_data = json.loads(request.body)
            if request_data.get('action') == 'delete_question':
                question_id = int(request_data.get('question_id'))
                Question.objects.get(id=question_id).delete()
                data = {
                    'status': 'OK',
                    'question_id': question_id
                }
                return JsonResponse(data)

            if request_data.get('action') == 'toggle_active':
                topic_id = int(request_data.get('topic_id'))
                topic = Topic.objects.get(id=topic_id)
                topic.active = not topic.active
                topic.save()
                data = {
                    'status': 'OK',
                    'topic_id': topic.id,
                    'active': topic.active,
                }
                return JsonResponse(data)

            if request_data.get('action') == 'reset_votes':
                topic_id = int(request_data.get('topic_id'))
                questions = Question.objects.filter(topic_id=topic_id)
                questions.update({'votes': 0})
                data = {
                    'status': 'OK',
                    'topic_id': topic_id,
                }
                return JsonResponse(data)

            if request_data.get('action') == 'delete_all':
                topic_id = int(request_data.get('topic_id'))
                questions = Question.objects.filter(topic_id=topic_id)
                questions.delete()
                Session.objects.all().delete()
                data = {
                    'status': 'OK',
                    'topic_id': topic_id,
                }
                return JsonResponse(data)

        questions = list(Question.objects.all().select_related('topic__name').values('added', 'votes', 'question', 'topic__name', 'id'))
        now = timezone.now()
        data = []
        for q in questions:
            time_delta = now - q['added']
            delete = f'<button id="deletequestion_{q["id"]}" class="btn btn-secondary delete-question">Remove</button>'
            data.append((time_delta.seconds, q['votes'], q['question'], q['topic__name'], q['id'], delete))
        data = {
            'status': 'OK',
            'data': data,
        }
        return JsonResponse(data)