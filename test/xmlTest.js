/**
 * Created by rusakovich on 19.02.15.
 */
TestCase("xmlTest",{
    "test": function() {
       var root = XML.newDocument("sample", "ns0");
        //jstestdriver.console.log("JsTestDriver", XML.printXML(root));
        assertNotNull(root);
        assertEquals('<sample xmlns="ns0"/>', XML.printXML(root));
    }
});


