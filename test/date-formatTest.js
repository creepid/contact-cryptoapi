/**
 * Created by rusakovich on 23.02.15.
 */
TestCase("xmlDateFormat",{
    "test date format": function() {
        var today = new Date(2014,11,30,14,30,59,44);
        var dateString = today.format("yyyy-mm-dd'T'HH:M:ss'Z'");
        assertEquals('2014-12-30T14:30:59Z', dateString);
    }
});
