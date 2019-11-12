"use strict";

console.log('overview');

function post(url, payload, successCallback, errorCallback) {
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
    let options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: new Headers(),
        credentials: 'same-origin',
    }
    options.headers.append('X-CSRFToken', csrfToken)
    options.headers.append('X-Requested-With', 'XMLHttpRequest')
    options.headers.append('Content-Type', 'application/json; charset=UTF-8')

    fetch(url, options)
    .then(function(response) {
        return response.json()
    })
    .then(successCallback)
    .catch(errorCallback);
}

function displayError(error) {
    console.log('ERROR')
    console.log(error)
}

function displaySuccess(response) {
    console.log('SUCCESS')
    console.log(response)
}

function displayQuestions(response) {
    let spacing = 80;
    let status = response.status
    let questions = response.questions
    console.log(questions)

    var u = d3.select('#questionlist-container')
        .selectAll('div')
        .data(questions)

    u.enter()
        .append('div')
        .merge(u)
        .text(function(d) {
        return d.question;
        })
        .style('top', function (d, i) {
            return spacing * i + 'px';
        })
        .attr('class', 'question')

    u.exit().remove()
}

/* SCRIPT */
let url = ''
let payload = {}
let updateIntervalMs = 4000

post(url, payload, displayQuestions, displayError)
setInterval(function() {
    post(url, payload, displayQuestions, displayError)
}, updateIntervalMs)
