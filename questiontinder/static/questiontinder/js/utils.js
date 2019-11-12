"use strict";

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
