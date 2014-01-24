// Your wave's got a little machine.

(function (window, undefined) {
    var canvas = document.getElementById('waves'),
        context = canvas.getContext('2d'),
        canvasWidth = window.innerWidth,
        canvasHeight = 200,
        config = {
            amplitude: 0.3,
            frequency: 20,
            waveType: 'sine'
        },
        currentPosition = 0,
        arrayToDraw = [];

    var calculateSineWave = function (amplitude, frequency) {
        var sineWave = [];

        for (var i = 0; i < frequency; i++) {
            for (var j = -Math.PI; j < Math.PI; j = j + (2 * Math.PI) / (canvasWidth * (1 / frequency))) {
                sineWave.push((Math.sin(j) * (canvasHeight /2) * amplitude) + canvasHeight/2);
            }
        }

        return sineWave;
    };

    var wave1 = calculateSineWave(0.3, 40),
        wave2 = calculateSineWave(0.7, 10),
        noDataPoints = 5;

    var drawWave = function (waveType) {

        var drawIt  = function (arrayToDraw) {
            context.fillStyle = '#CF313C';

            currentPosition < arrayToDraw.length ? currentPosition++ : currentPosition = 0;

            var firstPart = arrayToDraw.slice(0, currentPosition);

            arrayToDraw = arrayToDraw.concat(firstPart);

            for (i = arrayToDraw.length; i > 0; i--){ 
                if (i % noDataPoints === 0) {
                    context.fillRect(i - currentPosition, (arrayToDraw[i]), 5, 5);
                }
            }

            context.stroke();
            arrayToDraw = [];
        };

        drawIt(wave1);
        drawIt(wave2);
    };

    var draw = function () {
        // Reset canvas.
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context.moveTo(0, canvasHeight / 2);

        // drawCentreLine();

        drawWave(config.waveType);
    };

    // Request animation polyfill from
    // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    var loop = function () {
        draw();
        requestAnimationFrame(loop);
    };

    // Only show animation on desktops.
    if (window.innerWidth > 768) {
        requestAnimationFrame(loop);
    }
})(window);
