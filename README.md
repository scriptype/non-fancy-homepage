# non-fancy-homepage

![Screenshot](https://raw.githubusercontent.com/scriptype/non-fancy-homepage/master/screenshot.png)

Development files of x0r.tumblr.com theme

live: http://enes.in

## About

This repository contains pure [CSS](https://github.com/scriptype/non-fancy-homepage/blob/master/style.css) and pure [JS](https://github.com/scriptype/non-fancy-homepage/blob/master/app.js) source code that makes up my personal blog. I've also created a [backup file](https://github.com/scriptype/non-fancy-homepage/blob/master/tumblr_backup.html) that reflects the most recent state of the site's template code.

I designed it in a way that it looks undesigned and ugly, and I think it's still better than a modern-looking one – especially in terms of usability and accessibility. [See brutalistwebsites Q/A about that.](http://brutalistwebsites.com/enes.in/)

I've tried to improve UX as much as I can. After the initial server-side rendering, a small piece of JavaScript on the client takes control of everything to minimize further render times, provides route transitions etc. In the unlikely event of JS being disabled, site will degrade to static markup and still work perfectly. Mobile-friendliness, accessibility and progressive-enhancement have more value than a modern-ish look in this theme.

## Development

`index.html` file and `page` and `search` directories are dummy and only for testing. Tests are completely manual. I run a local [http-server](https://www.npmjs.com/package/http-server) for local development and testing.

## Contribution

Any contributions are welcome.

## Licence
```
MIT License

Copyright (c) 2016 Mustafa Enes Ertarhanacı

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
