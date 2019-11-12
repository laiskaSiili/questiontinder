"use strict";

/* LikeCarousel (c) 2019 Simone P.M. github.com/simonepm - Licensed MIT */
/* https://github.com/simonepm/likecarousel */
class Carousel {

    constructor(element) {
        this.verbose = true

        this.fetchTriggerNr = 3
        this.fetchIntervallMs = 10000
        this.fetchIntervallHandler = null

        this.board = element

        this.blockSwipe = true
        this.addLastCard()

        let jsVariables = JSON.parse(document.getElementById('jsVariables').textContent);
        this.voteQuestionUrl = jsVariables['vote_questions_url']
        this.fetchQuestionsUrl = jsVariables['fetch_questions_url']

        // fetch questions
        this.fetchNewQuestions(true)
        this.startPeriodicFetch()
    }

    handle() {
        if (this.verbose) console.log('handle')

        // list all cards
        this.cards = this.board.querySelectorAll('.card')

        // get top card
        this.topCard = this.cards[this.cards.length - 1]
        // get next card
        this.nextCard = this.cards[this.cards.length - 2]

        // if at least one card is present
        if (this.cards.length > 0) {
            // set default top card position and scale
            this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
            // get overlay
            this.topCardOverlay = this.topCard.querySelector('.card-overlay')
            // destroy previous Hammer instance, if present
            if (this.hammer) this.hammer.destroy()
            // listen for tap and pan gestures on top card
            this.hammer = new Hammer(this.topCard)
            this.hammer.add(new Hammer.Pan({ position: Hammer.position_ALL, threshold: 0 }))
            // pass events data to custom callbacks
            this.hammer.on('pan', (e) => { this.onPan(e) })
        }

        if (this.topCard !== undefined && this.topCard.classList.contains('last-card') && !this.blockSwipe) {
            if (this.verbose) console.log('blockSwipe = true')
            this.blockSwipe = true
            this.startPeriodicFetch()
        }
    }

    onPan(e) {
        if (this.blockSwipe && this.verbose) console.log('pan blocked')
        if (this.blockSwipe) return

        if (this.verbose) console.log('onPan')

        if (!this.isPanning) {
            this.isPanning = true
            // remove transition properties
            this.topCard.style.transition = null
            this.topCardOverlay.style.transition = null
            if (this.nextCard) this.nextCard.style.transition = null
            // get top card coordinates in pixels
            let style = window.getComputedStyle(this.topCard)
            let mx = style.transform.match(/^matrix\((.+)\)$/)
            this.startPosX = mx ? parseFloat(mx[1].split(', ')[4]) : 0
            this.startPosY = mx ? parseFloat(mx[1].split(', ')[5]) : 0
            // get top card bounds
            let bounds = this.topCard.getBoundingClientRect()
            // get finger position on top card, top (1) or bottom (-1)
            this.isDraggingFrom = (e.center.y - bounds.top) > this.topCard.clientHeight / 2 ? -1 : 1
        }

        // calculate new coordinates
        let posX = e.deltaX + this.startPosX
        let posY = e.deltaY + this.startPosY
        // get ratio between swiped pixels and the axes
        let propX = e.deltaX / this.board.clientWidth
        let propY = e.deltaY / this.board.clientHeight
        // get swipe direction, left (-1) or right (1)
        let dirX = e.deltaX < 0 ? -1 : 1
        // calculate rotation, between 0 and +/- 45 deg
        let deg = this.isDraggingFrom * dirX * Math.abs(propX) * 45
        // calculate scale ratio, between 95 and 100 %
        //let scale = (95 + (5 * Math.abs(propX))) / 100
        // set classes and opacity of thumbs overlay based on
        if (e.deltaX < 0 && !this.topCardOverlay.classList.contains('fa-thumbs-down')) {
            this.topCardOverlay.classList.remove('fa-thumbs-up')
            this.topCardOverlay.classList.remove('color-thumbsup')
            this.topCardOverlay.classList.add('fa-thumbs-down')
            this.topCardOverlay.classList.add('color-thumbsdown')
        } else if (e.deltaX > 0 && !this.topCardOverlay.classList.contains('fa-thumbs-up')) {
            this.topCardOverlay.classList.add('fa-thumbs-up')
            this.topCardOverlay.classList.add('color-thumbsup')
            this.topCardOverlay.classList.remove('fa-thumbs-down')
            this.topCardOverlay.classList.remove('color-thumbsdown')
        }
        this.topCardOverlay.style.opacity = Math.min(0.75, Math.abs(propX))
        // move top card
        this.topCard.style.transform = 'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg) rotateY(0deg) scale(1)'
        // scale next card
        //if (this.nextCard) this.nextCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(' + scale + ')'

        if (e.isFinal) {
            this.isPanning = false
            let successful = false
            let upvoteFlag = false
            // set back transition properties
            this.topCard.style.transition = 'transform 200ms ease-out'
            if (this.nextCard) this.nextCard.style.transition = 'transform 100ms linear'
            // check threshold
            if (propX > 0.25 && e.direction == Hammer.DIRECTION_RIGHT) {
                successful = true
                upvoteFlag = true
                // get right border position
                posX = this.board.clientWidth
            } else if (propX < -0.25 && e.direction == Hammer.DIRECTION_LEFT) {
                successful = true
                upvoteFlag = false
                // get left border position
                posX = - (this.board.clientWidth + this.topCard.clientWidth)
            }

            if (successful) {
                let question_id = this.topCard.id.split('_')[1]
                // post voting
                this.voteQuestion(question_id, upvoteFlag)
                // throw card in the chosen direction
                this.topCard.style.transform = 'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg)'

                // wait transition end
                setTimeout(() => {
                    // remove swiped card
                    this.board.removeChild(this.topCard)
                    // check if a new fetch must be triggered
                    if (this.cards.length < this.fetchTriggerNr) {
                        this.addLastCard()
                        this.fetchNewQuestions(false)
                    }
                    // reassign handle to new top card
                    this.handle()
                }, 200)

            } else {
                // reset cards position
                this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
                this.topCardOverlay.style.transition = 'opacity 200ms ease-out'
                this.topCardOverlay.style.opacity = 0
                //if (this.nextCard) this.nextCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)'
            }
        }
    }

    post(url, payload, successCallback, errorCallback) {
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

    voteQuestion(questionId, upvoteFlag) {
        if (this.verbose) console.log('voteQuestion, questionId = ' + questionId + ', upvoteFlag = ' + upvoteFlag)
        let payload = {
            'question_id': questionId,
            'upvote_flag': upvoteFlag,
        }
        this.post(this.voteQuestionUrl, payload, displaySuccess, displayError)
    }

    fetchNewQuestions(clearPrefetched) {
        if (this.verbose) console.log('fetchNewQuestions, clearPrefetched = ' + clearPrefetched)
        let data = {
            'clear_prefetched': clearPrefetched
        }
        this.post(this.fetchQuestionsUrl, data, this.fetchNewQuestionsSuccess.bind(this), displayError)
    }

    addLastCard() {
        if (this.verbose) console.log('addLastCard')
        let questions = [{
            'id':'last' + Math.floor(Math.random() * 1000),
            'question': 'There are currently no more questions to swipe. Try again a little later or add one of your own!',
            'class': 'last-card'
        }]
        this.addQuestionsToBoard(questions)
    }

    removeLastCard() {
        if (this.verbose) console.log('removeLastCard')
        Array.from(document.querySelectorAll('.last-card')).forEach(function(el) {
            el.parentNode.removeChild(el)
        })
    }

    fetchNewQuestionsSuccess(response) {
        let questions = response['questions']
        if (this.verbose) console.log('fetchNewQuestionsSuccess')
        if (this.verbose) console.log(questions)
        this.addQuestionsToBoard(questions)
        if (questions.length > 0) {
            this.stopPeriodicFetch()
            this.removeLastCard()
            this.blockSwipe = false
        }
        if (questions.length == 1) {
            this.addLastCard()
        }
        this.handle()
    }

    startPeriodicFetch() {
        if (this.verbose) console.log('startPeriodicFetch')
        this.fetchIntervallHandler = setInterval(function() {
            this.fetchNewQuestions(false)
        }.bind(this), this.fetchIntervallMs)
    }

    stopPeriodicFetch() {
        if (this.verbose) console.log('stopPeriodicFetch')
        clearInterval(this.fetchIntervallHandler)
    }

    addQuestionsToBoard(questions) {
        if (this.verbose) console.log('addQuestionsToBoard')
        if (this.verbose) console.log(questions)
        for (let i=0; i<questions.length; i++) {
            let question = questions[i];
            let card = document.createElement('div')
            card.className = 'card p-4'
            if (question.class !== undefined) {
                card.classList.add(question.class)
            }
            card.textContent = question.question
            card.id = 'question_' + question.id

            // create thumbs overlay elements
            let thumbsUpOverlay = document.createElement('i')
            thumbsUpOverlay.className = 'card-overlay far fa-10x'
            thumbsUpOverlay.style.opacity = 0
            card.appendChild(thumbsUpOverlay)

            if (this.board.firstChild) {
                this.board.insertBefore(card, this.board.firstChild)
            } else {
                this.board.append(card)
            }
        }
    }
}