"use strict";

console.log('control')

$(document).ready(function() {
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
    var datatable = $('#questions-datatable').DataTable({
        "order": [[ 0, "asc" ]],
        "responsive": true,
        "ajax": {
            'url': '',
            'type': 'POST',
            'beforeSend': function (request) {
                request.setRequestHeader("X-CSRFToken", csrfToken);
            }
        },
    });

    setInterval( function () {
        console.log('data refresh')
        datatable.ajax.reload( null, false ); // user paging is not reset on reload
    }, 5000 );

    document.querySelector('table').addEventListener('click', function(e) {
        if (!e.target.classList.contains('delete-question')) return

        let payload = {
            'action': 'delete_question',
            'question_id': e.target.id
        }
        post('', payload, deleteQuestionProcessResponse, displayError)
    })

    function deleteQuestionProcessResponse(response) {
        let questionId = response['question_id']
        let btn = document.getElementById(questionId)
        btn.disabled = true
        console.log('question ' + questionId + ' deleted')
    }
} );