/**
 * Created by rusakovich on 19.02.15.
 */
TestCase("xmlTest",{
    "test create root": function() {
       var xml = new XML("sample", null);

        assertNotNull(xml);
        assertEquals('<sample/>', xml.printXML());
    },
    "test add element": function() {
        var xml = new XML("sample", null);
        xml.addElement("newElement", "sample");
        assertEquals('<sample><newElement/></sample>', xml.printXML());

        xml = new XML("sample", null);
        xml.addElement("newElement", "sample", "textContent");
    },
    "test add attribute": function() {
        var xml = new XML("sample", null);
        xml.addElement("newElement", "sample");
        xml.addAttribute("newElement", "attrName", "attrValue");
        xml.addAttribute(null, "attrName", "attrValue");
        assertEquals('<sample><newElement attrName="attrValue"/></sample>', xml.printXML());
    },
    "test root element name": function() {
        var doc = XML.parse('<sample attrName="attrValue"><newElement/></sample>'),
            name = XML.getRootElementName(doc);

        assertEquals('sample', name);
    },
    "test root element attribute value": function() {
        var doc = XML.parse('<sample attrName="attrValue"><newElement/></sample>'),
            attr = XML.getRootElementAttrValue(doc, "attrName");
        assertEquals('attrValue', attr);
    }
});


