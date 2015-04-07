# CSS

## CSS sandbox

`[playground css init='p {\n\n}' html='<p>hello</p>']`

Edit the following CSS to make the text red.

[playground css init='p {\n\n}' html='<p>hello</p>']

## A simple test

By editing CSS attributes of `div#box` to implement the following effect (answer in the next page): 

![figure-1](docs/figure-1.png)

HTML: `<div id="box">box</div>`

[playground css init='#box {\n\n}' html='<div id="box">box</div>' css='#box{width:100px;height:50px;box-shadow:0 0 0 1px red;}' test='docs/quiz-1.js']

## Answer

	#box {
	  width: 200px;
	  height: 100px;
	  text-align: center;
	  line-height: 100px;
	  color: blue;
	}