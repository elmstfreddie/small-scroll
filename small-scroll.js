var smallScroll = (function(smallScroll) {
    smallScroll.init = init;

    /*
     *  see: https://gist.github.com/gre/1650294
     */
    smallScroll.easeFunctions = easeFunctions = {
        linear: function (t) { return t },
        easeInQuad: function (t) { return t*t },
        easeOutQuad: function (t) { return t*(2-t) },
        easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
        easeInCubic: function (t) { return t*t*t },
        easeOutCubic: function (t) { return (--t)*t*t+1 },
        easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
        easeInQuart: function (t) { return t*t*t*t },
        easeOutQuart: function (t) { return 1-(--t)*t*t*t },
        easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
        easeInQuint: function (t) { return t*t*t*t*t },
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
        easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    };

    smallScroll.options = {
        easeFunction: easeFunctions.easeOutQuint,
        easeTime: 1000,
        interval: 10,
    };

    var currentScrolling;

    function init() {
        var scrollTos = document.querySelectorAll("[data-small-scroll]");

        for (var i = 0; i < scrollTos.length; i++) {
            var ele = scrollTos[i];
            // href has #, remove so remove first char
            var targetId = ele.getAttribute("href").substring(1);

            registerScrollEvent(ele, targetId);
        }
    }

    function addEvent(element, listener, handler) {
        if (element.addEventListener) element.addEventListener(listener, handler);
        else anchor.attachEvent("on" + listener, handler);
    }

    function getNextEasePosition(startY, desiredY, currentT, totalT) {
        var timeFraction = currentT/totalT;
        var distanceFraction = smallScroll.options.easeFunction(timeFraction);

        return startY + (desiredY - startY) * distanceFraction;
    }

    function startScrolling(easingFunction, targetTop) {
        clearInterval(currentScrolling);

        var startT = Date.now();
        currentScrolling = setInterval(function() {
            var tDiff = Date.now() - startT;

            if (tDiff >= smallScroll.options.easeTime || targetTop === window.pageYOffset) {
                clearInterval(currentScrolling);
                window.scrollTo(0, targetTop);

                // callback, if any
                smallScroll.options.callback && smallScroll.options.callback();
            } else {
                window.scrollTo(0, easingFunction(tDiff, smallScroll.options.easeTime));
            }
        }, smallScroll.options.interval);
    }

    function handleClick(target, event) {
        event.preventDefault();

        var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
        var currentPos = window.pageYOffset;

        var easingFunction = getNextEasePosition.bind(this, currentPos, targetTop);

        startScrolling(easingFunction, targetTop);
    }

    function registerScrollEvent(anchor, targetId) {
        var target = document.getElementById(targetId);
        var clickHandler = handleClick.bind(this, target);

        addEvent(anchor, "click", clickHandler);
    }

    return smallScroll;
})(smallScroll || {});