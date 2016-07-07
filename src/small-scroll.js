(function(smallScroll) {
    typeof exports === "object" ? module.exports = smallScroll() : window.smallScroll = smallScroll();
})(function(smallScroll) {
    smallScroll = {};
    smallScroll.easeFunctions = {
        linear: function linear(t) { return t },
        easeInQuad: function easeInQuad(t) { return t*t },
        easeOutQuad: function easeOutQuad(t) { return t*(2-t) },
        easeInOutQuad: function easeInOutQuad(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
        easeInCubic: function easeInCubic(t) { return t*t*t },
        easeOutCubic: function easeOutCubic(t) { return (--t)*t*t+1 },
        easeInOutCubic: function easeInOutCubic(t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
        easeInQuart: function easeInQuart(t) { return t*t*t*t },
        easeOutQuart: function easeOutQuart(t) { return 1-(--t)*t*t*t },
        easeInOutQuart: function easeInOutQuart(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
        easeInQuint: function easeInQuint(t) { return t*t*t*t*t },
        easeOutQuint: function easeOutQuint(t) { return 1+(--t)*t*t*t*t },
        easeInOutQuint: function easeInOutQuint(t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
    }
    smallScroll.init = init;
    smallScroll.options = {
        easeFunction: smallScroll.easeFunctions.easeOutQuart,
        easeTime: 800,
        // easeTime: function(diff, currentPos, targetTop) {
        //     return Math.abs(diff);
        // },
        interval: 10,
        maintainHashURL: true,
    };
    smallScroll.destroy = destroy;

    var currentScrolling;
    var events = [];

    function init() {
        destroy();

        var scrollTos = document.querySelectorAll("[data-small-scroll]");

        for (var i = 0; i < scrollTos.length; i++) {
            var ele = scrollTos[i];
            // href has #, remove so remove first char
            var targetId = ele.getAttribute("href").substring(1);

            registerScrollEvent(ele, targetId);
        }
    }

    function destroy() {
        for (var i = 0; i < events.length; i++) {
            removeEvent(events[i].element, events[i].listener, events[i].handler);
        }
        events = [];
    }

    function addEvent(element, listener, handler) {
        events.push({
            element: element,
            listener: listener,
            handler: handler
        });

        if (element.addEventListener) element.addEventListener(listener, handler);
        else element.attachEvent("on" + listener, handler);
    }

    function removeEvent(element, listener, handler) {
        if (element.removeEventListener) element.removeEventListener(listener, handler);
        else element.detachEvent("on" + listener, handler);
    }

    function getNextEasePosition(startY, desiredY, currentT, totalT) {
        var timeFraction = currentT/totalT;
        var distanceFraction = smallScroll.options.easeFunction(timeFraction);

        return startY + (desiredY - startY) * distanceFraction;
    }

    function startScrolling(easeTime, easingFunction, targetTop, callback) {
        clearInterval(currentScrolling);

        var startT = Date.now();
        currentScrolling = setInterval(function() {
            var tDiff = Date.now() - startT;

            if (tDiff >= easeTime || targetTop === window.pageYOffset) {
                clearInterval(currentScrolling);
                window.scrollTo(0, targetTop);

                callback();
            } else {
                window.scrollTo(0, easingFunction(tDiff, easeTime));
            }
        }, smallScroll.options.interval);
    }

    function doneScrolling(target) {
        smallScroll.options.maintainHashURL && (window.location.hash = target.getAttribute("id"));
        smallScroll.options.callback && smallScroll.options.callback(target);
    }

    function handleClick(target, event) {
        event.preventDefault();

        var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
        var currentPos = window.pageYOffset;

        var easingFunction = getNextEasePosition.bind(this, currentPos, targetTop);
        var callback = doneScrolling.bind(this, target);

        var easeTime = typeof smallScroll.options.easeTime === "function" ? smallScroll.options.easeTime(targetTop - currentPos, currentPos, targetTop) : smallScroll.options.easeTime;

        startScrolling(easeTime, easingFunction, targetTop, callback);
    }

    function registerScrollEvent(anchor, targetId) {
        var target = document.getElementById(targetId);
        var clickHandler = handleClick.bind(this, target);

        addEvent(anchor, "click", clickHandler);
    }

    return smallScroll;
});