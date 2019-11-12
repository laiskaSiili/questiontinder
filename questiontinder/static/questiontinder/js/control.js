"use strict";

console.log('control')

$(document).ready(function() {
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
    var datatable = $('#questions-datatable').DataTable({
        "order": [[ 0, "desc" ]],
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
    }, 4000 );
} );