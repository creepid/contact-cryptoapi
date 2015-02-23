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
    }
});


