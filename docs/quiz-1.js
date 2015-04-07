/**
 * This is a CSS quiz sample for course.js.
 *
 * window:      the window object of iframe sandbox
 * document:    the document object of window
 * result:      result of this test,
 *              0 or false for wrong answer
 *              1 or true for accepted answer
 */

// select the box element
var box = document.getElementById('box');

// get computed style
var style = window.getComputedStyle(box, null);

var height = parseInt(style.getPropertyValue('height')),            // standard value like: 100px
    width = parseInt(style.getPropertyValue('width')),              // standard value like: 100px
    color = style.getPropertyValue('color'),                        // standard value like: rgb(0, 0, 0)
    lineHeight = parseInt(style.getPropertyValue('line-height')),     // standard value like: 100px / normal
    textAlign = style.getPropertyValue('text-align');               // standard value like: left / right / center / start

if (width == 200 && height == 100 && color == 'rgb(0, 0, 255)' && lineHeight == 100 && textAlign == 'center')
    result = 1;
else
    result = 0;
