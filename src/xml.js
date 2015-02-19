/**
 * Created by rusakovich on 19.02.15.
 */
var XML = {}

XML.newDocument = function(rootTagName, namespaceURL) {
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
                if (!prefix) prefix = "a0";
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

XML.printXML = function(xml_node) {
        if (xml_node.xml)
            return xml_node.xml;
        else if (XMLSerializer) {
            var xml_serializer = new XMLSerializer();
            return xml_serializer.serializeToString(xml_node);
        } else {
            throw "ERROR: Extremely old browser";
            return "";
        }
}
