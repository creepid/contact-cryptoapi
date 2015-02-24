/**
 * Created by rusakovich on 19.02.15.
 */
function XML(rootName, namespace) {

     function newDocument(rootTagName, namespaceURL) {
        if (!rootTagName) rootTagName = "";
        if (!namespaceURL) namespaceURL = "";

        if (document.implementation && document.implementation.createDocument) {
            return document.implementation.createDocument(namespaceURL, rootTagName, null);
        } else {
            //for IE
            var doc = new ActiveXObject("MSXML2.DOMDocument");

            if (rootTagName) {
                var prefix = "";
                var tagname = rootTagName;

                var p = rootTagName.indexOf(":");
                if (p != -1) {
                    prefix = rootTagName.substring(0, p);
                    tagname = rootTagName.substring(p + 1);
                }

                if (namespaceURL) {
                    if (!prefix) prefix = "";
                } else prefix = "";

                var text = "<" + (prefix ? (prefix + ":") : "") + tagname +
                    (namespaceURL
                        ? (" xmlns: " + prefix + '="' + namespaceURL + '"')
                        : "")
                    + "/>";

                doc.loadXML(text);
            }

            return doc;
        }
    }

    this.doc = newDocument(rootName, namespace);
}

XML.prototype.addElement = function (elementName, parentName, content) {
    if (!this.doc) {
        return;
    }
    var parent = this.doc.getElementsByTagName(parentName)[0];
    if (!parent) {
        return;
    }
    var newel = this.doc.createElement(elementName);
    parent.appendChild(newel);
    if (content) {
        newel.textContent = content;
    }
}

XML.prototype.addAttribute = function (elementName, attrName, attrValue) {
    if (!this.doc) {
        return;
    }
    var element = this.doc.getElementsByTagName(elementName)[0];
    if (!element) {
        return;
    }
    element.setAttribute(attrName, attrValue);
}

XML.prototype.printXML = function () {
    var _doc = this.doc;

    if (this.doc.xml)
        return _doc.xml;
    //IE
    if (window.ActiveXObject) {
        return _doc.xml;
    }
    if (XMLSerializer) {
        var xmlSerializer = new XMLSerializer();
        return xmlSerializer.serializeToString(_doc);
    } else {
        throw "ERROR: Extremely old browser";
        return "";
    }
}

XML.parse = function(text){
    if (typeof DOMParser != "undefined"){
        //Mozilla, Firefox and simular
        return (new DOMParser()).parseFromString(text, "application/xml");
    }
    else if(typeof ActiveXObject != "undefined"){
        var _doc = new XML(text).doc;
        _doc.loadXML(text);

        return _doc;
    }else{
        //try to load document from URL-address of 'data' spec
        //working in Safari with it's Sarissa lib
        var url = "data:text/xml;charset=utf-8," + encodeURIComponent(text);

        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);

        return request.responseXML;
    }

    return null;
}

XML.getRootElementName = function(doc){
    if  (!doc || !doc.documentElement){
        return "";
    }

    return doc.documentElement.tagName;
}

XML.getRootElementAttrValue = function(doc, attrName){
    if  (!doc || !doc.documentElement){
        return "";
    }

    if (!doc.documentElement.hasAttribute(attrName)){
        return "";
    }

    return doc.documentElement.getAttribute(attrName);
}
