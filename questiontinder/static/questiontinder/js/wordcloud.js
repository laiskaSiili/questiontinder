"use strict";

//Simple animated example of d3-cloud - https://github.com/jasondavies/d3-cloud
//Based on https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html

// Encapsulate the word cloud functionality

var bbox = document.getElementById('wordcloud').getBoundingClientRect()
var width = bbox.width
var height = bbox.height
var seed, topicId, refreshIntervallHandler, fontSizeScale
var refreshIntervallMs = 5000
var maxFontsizePx = width / 20
var questions
var myWordCloud = wordCloud('#wordcloud')

document.getElementById('text_plus').addEventListener('click', function(e) {
    maxFontsizePx += 5;
    seed = topicId
    updateWordcloud(questions)
})

document.getElementById('text_minus').addEventListener('click', function(e) {
    maxFontsizePx -= 5;
    seed = topicId
    updateWordcloud(questions)
})

Math.random = function() {
    if (seed === undefined) {
        return Math.random()
    }
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

document.querySelector('#topic-dropdown select').addEventListener('change', function(e) {
    topicId = e.target.options[e.target.selectedIndex].value
    clearInterval(refreshIntervallHandler)
    if (topicId) {
        post('', {'topic_id': topicId}, processResponse, displayError)
        startPeriodicRefresh()
    } else {
        myWordCloud.update([])
    }
})

function startPeriodicRefresh() {
    refreshIntervallHandler = setInterval(function() {
        console.log('refresh ' + topicId)
        post('', {'topic_id': topicId}, processResponse, displayError)
    }, refreshIntervallMs)
}

function processResponse(response) {
    seed = response['topicId']
    questions = response['questions']
    updateWordcloud(questions)
}

function updateWordcloud(questions) {

    let maxVotes = Math.max.apply(Math, questions.map(function(item) { return item.votes; }))
    let minVotes = Math.min.apply(Math, questions.map(function(item) { return item.votes; }))
    fontSizeScale = d3.scale.linear().domain([minVotes,maxVotes]).range([0.1, 1]);

    let wordcloudData = []
    for (let i=0; i<questions.length; i++) {
        wordcloudData.push({
            'text': questions[i].question,
            'size': fontSizeScale(questions[i].votes) * maxFontsizePx
        })
    }

    console.log(wordcloudData)
    myWordCloud.update(wordcloudData)
}

function wordCloud(selector) {

    var fill = d3.scale.category20();

    //Construct the word cloud's SVG element
     svg = d3.select(selector).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", "translate(" + Math.floor(width/2) + "," + Math.floor(height/2) + ")")

    //Draw the word cloud
    function draw(words) {
        var cloud = svg.selectAll("g text")
                        .data(words, function(d) { return d.text; })

        //Entering words
        cloud.enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; });

        //Entering and existing words
        cloud
            .transition()
                .duration(600)
                .attr("font-size", function(d) { return d.size })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("fill-opacity", 1);

        //Exiting words
        cloud.exit()
            .transition()
                .duration(200)
                .style('fill-opacity', 1e-6)
                .attr('font-size', 1)
                .remove();
    }


    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {

        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function(words) {
            d3.layout.cloud().size([width, height])
                .words(words)
                .padding(5)
                .rotate(function() { return 0})
                //.rotate(function() { return ~~(Math.random() * 2) * 90; })
                .font("Impact")
                .fontSize(function(d) { return d.size })
                .on("end", draw)
                .start();
        }
    }

}


function getWords() {
    var data = []

    for (let k=0; k<50; k++) {
        data.push({
            'text': sentence(),
            'size': Math.floor(Math.random() * 20),
        })
    }
    return data
}