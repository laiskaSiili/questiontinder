from django import forms
from .models import Question

class QuestionAddForm(forms.ModelForm):

    class Meta:
        model = Question
        fields = ('topic', 'question',)
        widgets = {
            'question': forms.Textarea(attrs={
                'rows':6,
                'cols':20,
                'placeholder': 'Ask a question here...'
                }),
        }
        labels = {
            'question': '',
            'topic': 'Slammer',
        }

    def clean(self):
        cleaned_data = super().clean()
        question = cleaned_data.get("question")
        topic = cleaned_data.get("topic")
        if Question.objects.filter(question__iexact=question, topic=topic).exists():
            self.add_error('question', 'This question already exists for this slammer.')