/**
 * Created by shuding on 3/13/15.
 * <ds303077135@gmail.com>
 */
;(function (window, $, undefined){
    var course = {
        src: '',
        pageCount: 0
    };

    function init() {
        $.deck.defaults.touch.swipeDirection = 'vertical';
        $.deck('.slide');

        NProgress.configure({
            showSpinner: false,
            trickle: false,
            speed: 800
        });
        NProgress.set(0.0);

        $(document).bind('deck.change', function (event, from, to) {
            if (!(course.pageCount > 0))
                course.pageCount = +$('.deck-status-total').text();
            NProgress.set((to + 1) / course.pageCount);
        });
    }

    function modifyMD(str) {
        return str.replace(/\[textarea(.+?)\]/g, function (a, b) {
            return '<textarea onkeyup="(function(self){' + b + '})(this)"></textarea>';
        });
    }

    function getDoc() {
        var $container = $('.deck-container');
        course.src = $container.attr('data-src');

        var appendData = function (data) {
            var index = data.lastIndexOf('## ');
            if (index == -1)
                return;

            var slideData = '\n' + data.substr(index, data.length - index) + '\n';
            slideData = modifyMD(slideData);

            appendData(data.substr(0, index));

            var $slideDOM = $('<section>');
            $slideDOM[0].className = 'slide';
            $slideDOM.html(slideData).appendTo($container);
        };

        $.get(course.src, function (data) {
            appendData(data);
            init();
        });
    }

    getDoc();

    $(window).load(function () {
        setTimeout(function () {
            $('body').css('opacity', 1);
        }, 300);
    });

})(window, jQuery);