/**
 * Created by shuding on 3/13/15.
 * <ds303077135@gmail.com>
 */

;(function (window, $, undefined){
    var course = {
        no: 0,
        path: '',
        src: [],
        list: [],
        pageCount: 0,
        pageNow: 0,
        currentLocation: '',
        progress: []
    };

    function htmlEscape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

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

            course.progress = JSON.parse(localStorage.getItem("courseprogress")) || [];
            course.progress[course.no] = (to + 1) + '/' + course.pageCount;
            localStorage.setItem('courseprogress', JSON.stringify(course.progress));

            course.pageNow = to + 1;
        });

        $('.course-math').each(function () {
            katex.render(this.innerText, this);
        });

        loadPlayground();
    }

    function bindCodeEditor(textarea) {
        new Behave({
            textarea:   textarea,
            replaceTab: true,
            softTabs:   true,
            tabSize:    4,
            autoOpen:   true,
            overwrite:  true,
            autoStrip:  true,
            autoIndent: true
        });
    }

    function loadPlayground() {
        $('.course-playground-html').each(function () {
            var contentWindow = $(this).children('.course-playground-result')[0].contentWindow,
                $input = $(this).children('.course-playground-input');

            bindCodeEditor($(this).children('.course-playground-input')[0]);

            var refresh = function () {
                contentWindow.document.body.innerHTML = $(this).val();
            };

            $input.on('keyup', refresh);
            refresh.call($input[0]);
        });
        $('.course-playground-css').each(function () {
            var contentWindow = $(this).children('.course-playground-result')[0].contentWindow,
                html = $(this).children('.course-playground-result')[0].dataset['content'],
                $input = $(this).children('.course-playground-input');

            bindCodeEditor($(this).children('.course-playground-input')[0]);

            var refresh = function () {
                contentWindow.document.body.innerHTML = '<style>' + $(this).val() + '</style>' + html;
            };

            $input.on('keyup', refresh);
            refresh.call($input[0]);
        });

        // Behave hooks

        BehaveHooks.add(['keydown'], function(data){
            var numLines = data.lines.total,
                fontSize = parseFloat(getComputedStyle(data.editor.element)['font-size']) + 2,
                padding = parseInt(getComputedStyle(data.editor.element)['padding']);
            data.editor.element.style.height = Math.max((((numLines * fontSize) + padding)), 150) + 'px';
        });
    }

    // modify markdown by rules
    function modifyMD(str) {
        // rules
        return str
            .replace(/([^\t`])\[link (.+?)\]/g, function (a, b, c) {
                return b + ' <a href="' + b + '">' + c + '</a> ';
            })
            .replace(/([^\t`!])\[([^`[]+?)\]\((.+?)\)/g, function (a, b, c, d) {
                return b + ' <a href="' + d + '" target="_blank">' + c + '</a> ';
            })
            .replace(/([^\t`])\[question (.+?)\]/g, function (a, b, c) {
                return b + '<textarea onkeyup="(function(self){var result=-1,value=self.value;' + c + ';self.parentNode.className=(result==1?\'t\':\'f\')})(this)"></textarea>';
            })
            .replace(/([^\t`])\[code ([\s\S]+?)\]/g, function (a, b, c) {
                return b + ' <pre class="course-code">' + htmlEscape(c) + '</pre>';
            })
            .replace(/([^\t`])\[center (.+?)\]/g, function (a, b, c) {
                return b + ' <p style="text-align: center">' + c + '</p> ';
            })
            .replace(/([^\t`])\[underline (.+?)\]/g, function (a, b, c) {
                return b + '<span style="text-decoration: underline">' + c + '</span>';
            })
            .replace(/([^\t`])\[note ([\s\S]+?)\]/g, function (a, b, c) {
                return b + ' <span class="course-note"><sup>*</sup><span class="course-note-inner">' + c + '</span></span> ';
            })
            .replace(/([^\t`])\[playground html init=['"]([\s\S]+?)['"]\]/g, function (a, b, c) {
                return b + '<p class="course-playground course-playground-html"><textarea class="course-playground-input">' + c + '</textarea><iframe class="course-playground-result"></iframe></p>';
            })
            .replace(/([^\t`])\[playground css init=['"]([\s\S]+?)['"] html=['"]([\s\S]+?)['"]\]/g, function (a, b, c, d) {
                return b + '<p class="course-playground course-playground-css"><textarea class="course-playground-input">' + c + '</textarea><iframe class="course-playground-result" data-content="' + d + '"></iframe></p>';
            })
            .replace(/([^\t`])\$([^`]+?)\$/g, function (a, b, c) {
                return b + '<span class="course-math">' + c + '</span>';
            });
    }

    // GET markdown document and split it by pages
    function getDoc(src) {
        var $container = $('.deck-container');

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

        $.get(src, function (data) {
            appendData('\n' + data + '\n');
            init();
        });
    }

    // generate table of contents from course.src
    function generateTable() {
        course.progress = JSON.parse(localStorage.getItem("courseprogress")) || [];

        var html = '<table>';
        var count = 0;

        html += '<thead><tr><th>Chapter</th><th>Slide</th><th>Progress</th></tr></thead><tbody>';

        console.log(JSON.stringify(course));
        for (var i = 0; i < course.src.length; ++i) {
            html += '<tr><td rowspan="' + course.src[i].slide.length + '">' + course.src[i].name + '</td>';
            for (var j = 0; course.src[i] && j < course.src[i].slide.length; ++j) {
                if (j > 0)
                    html += '<tr>';
                html += '<td><a href="?s=' + count + '#slide-' + (course.progress[count] ? (+course.progress[count].split('/')[0] - 1) : 0) + '" target="_blank">' + course.src[i].slide[j] + '</a></td>';
                html += '<td id="course-progress-' + count + '">/</td>';
                html += '</tr>';
                course.list.push(course.src[i].slide[j]);
                ++count;
            }
        }

        if(typeof(window.Storage) !== "undefined") {
            setInterval(function () {
                course.progress = JSON.parse(localStorage.getItem("courseprogress")) || [];
                for (var i = 0; i < course.list.length; ++i) {
                    $('#course-progress-' + i).text(course.progress[i] || '0%');
                }
            }, 1000);
        }

        return html + '</tbody></table>';
    }

    function goHome(src) {
        $.get(src, function (data) {
            var converter = new Markdown.Converter();
            var html = converter.makeHtml(data) + generateTable();

            var $slideDOM = $('<section>');
            $slideDOM[0].className = 'slide';
            $slideDOM.html(html);
            $('.deck-container').html('').append($slideDOM);
        });
    }

    $.get('course.json', function (data) {
        course.path = data.path || '';
        course.src = data.course;
        course.cover = data.cover;

        for (var i = 0; i < course.src.length; ++i)
            for (var j = 0; j < course.src[i].slide.length; ++j)
                course.list.push(course.src[i].slide[j]);

        course.currentLocation = window.location.search;

        var randomTimeStamp =  '?t=' + Math.floor(Math.random() * 10000000);

        if (course.currentLocation.indexOf('?s') == 0) {
            // slide page
            course.no = +course.currentLocation.split('=')[1];
            getDoc(course.path + course.list[course.no] + randomTimeStamp);
        }
        else {
            // go to home page (table of contents)
            goHome(course.path + course.cover + randomTimeStamp);
        }

    }, 'json');

    $(window).load(function () {
        setTimeout(function () {
            $('body').css('opacity', 1);
        }, 300);
    });

})(window, jQuery);