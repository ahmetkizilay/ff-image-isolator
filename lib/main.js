var myContentScript = function() {
    
    /*
     *  this variable stores the most reasonable image link
     */
    var _found_src = null;

    /*
     * Searches for an image source only in the tag
     * without searching parents or children
     */
    var _fn_searchImgSrcNonRecursive = function (el) {
        if(!el) {
            return null;
        }

        var tag = el.tagName ? el.tagName.toLowerCase() : '';
        if(tag === 'img') {
            return el.src;
        }

        var computedStyle = window.getComputedStyle(el, null);
        var bgImage = computedStyle.getPropertyValue('background-image');
        if(bgImage && bgImage !== 'none') {
            return bgImage;
        }

        if(el.constructor.prototype.getAttribute) {
            var posterAttr = el.getAttribute('poster');
            if(posterAttr) {
                console.log(posterAttr);
                return posterAttr;
            }
        }

        return null;
    };

    /*
     * This method searches the self, and the children of the self node
     * It is called by the siblings of the initial element within the
     * _fn_searchImgSrc method.
     */
    var _fn_searchImgSrcChildren = function (el, max_depth) {

        if(max_depth === 0) {
            return null;
        }

        // search within own element
        var self_search = _fn_searchImgSrcNonRecursive(el);
        if(self_search) {
            return self_search;
        }

        // search children
        var childNodes = el.childNodes;
        for(var i = 0; i < childNodes.length; i += 1) {
            var thisChild = childNodes[i];
            
            var child_search = _fn_searchImgSrcChildren(thisChild, max_depth - 1);
            if(child_search) {
                return child_search;
            }
        
        }

        return null;
    };

    /*
     * This method is the initiating method for the search.
     * It searches the self, then the parent, and recursively the siblings.
     * max_depth lets you specify how deep you will go into the childNodes
     * recursively.
     */
    var _fn_searchImgSrc = function (el, max_depth) {

        if(max_depth === 0) {
            return null;
        }

        // search within own element
        var self_search = _fn_searchImgSrcNonRecursive(el);
        if(self_search) {
            return self_search;
        }

        // then search the parent (inefficient)
        var parent_search = _fn_searchImgSrcNonRecursive(el.parentNode); // only the parent
        if(parent_search) {
            return parent_search;
        }

        // search siblings (searches itself one extra time)
        var childNodes = el.parentNode.childNodes;
        for(var i = 0; i < childNodes.length; i += 1) {
            var thisChild = childNodes[i];
            
            var sibling_search = _fn_searchImgSrcChildren(thisChild, max_depth - 1);
            if(sibling_search) {
                return sibling_search;
            }
            
        }

        return null;
    };

    /*
     * removes the url() wrap around the url string
     */
    var _fn_correctSrc = function (origSrc) {
        var result = origSrc;

        if(result.indexOf('url(') !== -1) {
            result = result.replace('url(', '');
            result = result.slice(0, -1);
        }

        if(result.startsWith('"') || result.startsWith('\'')) {
            result = result.substring(1).slice(0, -1);
        }

        return result;
    };
    var fn_onContextMenu = function (event) {
        self.postMessage(event.clientX + ' ' + event.clientY);

        var el = document.elementFromPoint(event.clientX, event.clientY);
        _found_src = _fn_searchImgSrc(el, 5);

        if(_found_src !== null) {
            _found_src = _fn_correctSrc(_found_src);
        }

        self.postMessage(_found_src ? _found_src : 'image not found');

    };

//    window.addEventListener('contextmenu', fn_onContextMenu);

    self.on('context', function (node) {
        _found_src = _fn_searchImgSrc(node, 5);

        if(_found_src !== null) {
            _found_src = _fn_correctSrc(_found_src);
        }

        self.postMessage(_found_src ? _found_src : 'image not found');

        return true;
    });

    self.on('click', function () {
        if(_found_src) {

            var popup = window.open(_found_src, 'name', 'status=1');
            setTimeout(function () {
                popup.focus();
            }, 1000);

        }
    });
};

var stringifyFn = function (fn) {
    return fn.toString().substring(13).slice(0, -1);
};

var contextMenu = require('sdk/context-menu');
var data = require('sdk/self').data;

var menuItem = contextMenu.Item({
    label: 'isolate image',
    image: data.url('download.ico'),
    context: contextMenu.SelectorContext('body'),
    contentScript: stringifyFn(myContentScript),
    onMessage: function (selectionText) {
        console.log(selectionText);
    }
});