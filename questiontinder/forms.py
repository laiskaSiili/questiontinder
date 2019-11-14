from django import forms
from .models import Question, Topic


class TopicDropdownForm(forms.ModelForm):

    class Meta:
        model = Question
        fields = ('topic',)
        labels = {
            'topic': '',
        }

    def __init__(self, *args, **kwargs):
        super(TopicDropdownForm, self).__init__(*args, **kwargs)
        self.fields['topic'].queryset = Topic.objects.all().filter(active=True)


class QuestionAddForm(forms.ModelForm):

    class Meta:
        model = Question
        fields = ('topic', 'question',)
        widgets = {
            'question': forms.Textarea(attrs={
                'rows':2,
                'cols':20,
                'placeholder': 'Your question... (40 characters max)'
                }),
        }
        labels = {
            'question': '',
            'topic': 'Slammer',
        }

    def __init__(self, *args, **kwargs):
        super(QuestionAddForm, self).__init__(*args, **kwargs)
        self.fields['topic'].queryset = Topic.objects.all().filter(active=True)

    def clean(self):
        cleaned_data = super().clean()
        question = cleaned_data.get("question")
        topic = cleaned_data.get("topic")
        if Question.objects.filter(question__iexact=question, topic=topic).exists():
            self.add_error('question', 'This question already exists for this slammer.')