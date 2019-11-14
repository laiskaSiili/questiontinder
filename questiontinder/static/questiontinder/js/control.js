"use strict";

console.log('control')

$(document).ready(function() {

    /* -------
     Questions
    --------*/
    var questionUpdateIntervallHandler = null
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

    startQuestionUpdateIntervall()

    function startQuestionUpdateIntervall() {
        if (questionUpdateIntervallHandler !== null) return
        console.log('startQuestionUpdateIntervall')

        datatable.ajax.reload( null, false );
        questionUpdateIntervallHandler = setInterval( function () {
            console.log('data refresh')
            datatable.ajax.reload( null, false ); // user paging is not reset on reload
        }, 5000 );
    }

    function stopQuestionUpdateIntervall() {
        if (questionUpdateIntervallHandler === null) return
        console.log('stopQuestionUpdateIntervall')

        clearInterval(questionUpdateIntervallHandler)
        questionUpdateIntervallHandler = null
    }

    function confirm(elementId, stopUpdating) {
        let el = document.getElementById(elementId)
        let textContent = el.textContent
        el.classList.add('confirm')
        el.classList.remove('btn-secondary')
        el.classList.add('btn-danger')
        el.textContent = 'Confirm'
        if (stopUpdating) {
            stopQuestionUpdateIntervall()
        }
        setTimeout(function() {
            let el = document.getElementById(elementId)
            if (el !== null) {
                el.classList.remove('confirm')
                el.classList.add('btn-secondary')
                el.classList.remove('btn-danger')
                el.textContent = textContent
            }
            let nrDeleteQuestionBtnsPendingConfirmation = document.querySelectorAll('.delete-question.confirm').length
            if (stopUpdating && nrDeleteQuestionBtnsPendingConfirmation == 0) {
                startQuestionUpdateIntervall()
            }
        }, 3000)

    }

    document.querySelector('#questions-datatable').addEventListener('click', function(e) {
        if (!e.target.classList.contains('delete-question')) return
        if (!e.target.classList.contains('confirm')) {
            confirm(e.target.id, true)
        } else {
            let payload = {
                'action': 'delete_question',
                'question_id': e.target.id.split('_')[1]
            }
            post('', payload, deleteQuestionProcessResponse, displayError)
        }
    })

    function deleteQuestionProcessResponse(response) {
        let questionId = response['question_id']
        let btn = document.getElementById('deletequestion_' + questionId)
        btn.disabled = true
        btn.textContent = 'Deleted'
        console.log('question ' + questionId + ' deleted')
    }

    /* -------
     Topics
    --------*/
    document.querySelector('#topics-datatable').addEventListener('click', function(e) {
        if (!e.target.classList.contains('toggle-active') && !e.target.classList.contains('reset-votes') && !e.target.classList.contains('delete-all') ) {
            return
        }

        let topicId = e.target.id.split('_')[1]

        if (e.target.classList.contains('toggle-active')) {
            let payload = {
                'action': 'toggle_active',
                'topic_id': topicId
            }
            post('', payload, handleToggleActiveSuccess, displayError)
        }

        if (e.target.classList.contains('reset-votes')) {
            if (!e.target.classList.contains('confirm')) {
                confirm(e.target.id, false)
            } else {
                let payload = {
                    'action': 'reset_votes',
                    'topic_id': topicId
                }
                post('', payload, handleResetAllSuccess, displayError)
            }
        }

        if (e.target.classList.contains('delete-all')) {
            if (!e.target.classList.contains('confirm')) {
                confirm(e.target.id, false)
            } else {
                let payload = {
                    'action': 'delete_all',
                    'topic_id': topicId
                }
                post('', payload, handleToggleActiveSuccess, displayError)
            }
        }
    })

    function handleToggleActiveSuccess(response) {
        console.log(response['active'])
        document.getElementById('toggleactive_' + response['topic_id']).checked = response['active']
    }

    function handleResetAllSuccess(response) {
        console.log('All reset')
        let el = document.getElementById('resetvotes_' + response['topic_id'])
        let textContent = el.textContent
        el.classList.add('noselect')
        el.textContent = 'Done'
        el.disabled = true
        setTimeout(function() {
            el.classList.remove('noselect')
            el.textContent = textContent
            el.disabled = false
        }, 3000)
    }

    function handleResetAllSuccess(response) {
        console.log('All reset')
        let el = document.getElementById('deleteall' + response['topic_id'])
        let textContent = el.textContent
        el.classList.add('noselect')
        el.textContent = 'Done'
        el.disabled = true
        setTimeout(function() {
            el.classList.remove('noselect')
            el.textContent = textContent
            el.disabled = false
        }, 3000)
    }

} );