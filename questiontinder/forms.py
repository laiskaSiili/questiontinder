from django import forms
from .models import Question

class QuestionAddForm(forms.ModelForm):

    class Meta:
        model = Question
        fields = ('question',)
        widgets = {
            'question': forms.Textarea(attrs={
                'rows':6,
                'cols':20,
                'placeholder': 'Ask a question here...'
                }),
        }
        labels = {
            'question': '',
        }