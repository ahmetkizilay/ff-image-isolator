# image isolator

this is a firefox extension that lets you isolate image source urls to be saved as in another window. this extension is useful when image files are either layered under other elements, or they are used as background layers (such as in divs, video).

### how it works
when user right-clicks on an image, the program starts searching for an image source url. by the time, the context menu opens with the _isolate image_ item, an image url is either found, or not. clicking on the context menu items triggers a signal to content script and the url is opened on a separate window.

### how it does not work
my initial attempt was to directly download the link by reading the image data, and creating a uri etc. however, i got stuck with the security exceptions that disallow cross-browser downloads through javascript. so, i left it there, and compromised for a second step instead of writing a server application.