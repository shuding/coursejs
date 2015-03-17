/**
 * Created by shuding on 3/13/15.
 * <ds303077135@gmail.com>
 */

;(function (window, $, undefined){
    var course = {
        src: '',
        pageCount: 0,
        pageNow: 0
    };

    function init() {
        $.deck.defaults.touch.swipeDirection = 'vertical';
        $.deck('.slide');

        NProgress.configure({
            showSpinner: false,
            trickle: false,
            speed: 800,
            color: '#c00'
        });
        NProgress.set(0.0);

        $(document).bind('deck.change', function (event, from, to) {
            if (!(course.pageCount > 0))
                course.pageCount = +$('.deck-status-total').text();

            // a trick for keeping nprogress from disappear
            NProgress.set(Math.min((to + 1) / course.pageCount, 0.9999));

            course.pageNow = to + 1;
        });
    }

    // modify markdown by rules
    function modifyMD(str) {
        // rules
        return str
            .replace(/[^\t`]\[link (.+?)\]/g, function (a, b) {
                return '<a href="' + b + '">' + b + '</a>';
            })
            .replace(/[^\t`]\[question (.+?)\]/g, function (a, b) {
                return '<textarea onkeyup="(function(self){var result=-1,value=self.value;' + b + ';self.parentNode.className=(result==1?\'t\':\'f\')})(this)"></textarea>';
            })
            .replace(/[^\t`]\[center (.+?)\]/g, function (a, b) {
                return '<p style="text-align: center">' + b + '</p>';
            });
    }

    // GET markdown document and split it by pages
    function getDoc() {
        var $container = $('.deck-container');
        course.src = $container.attr('data-src');

        var appendData = function (data) {
            var index = Math.max(data.lastIndexOf('\n## '), data.lastIndexOf('\n# '));
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
            appendData('\n' + data + '\n');
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