/**
 * Created by rusakovich on 23.02.15.
 */
TestCase("crypto-protocolTest",{
    "test prepareRequestEnum": function() {
        var result = Contact.Crypto.Protocol.prepareRequestEnum('keyUsage', 'restriction', 'returnType');
        var strResult = String.fromCharCode.apply(String, result);
        assertEquals('<OperationRequest Type="privateKeysEnumeration"><KeyUsageMask>keyUsage</KeyUsageMask><Restrictions>restriction</Restrictions><ReturnType>returnType</ReturnType></OperationRequest>', strResult);
    },
    "test prepareRequestSignBytes": function() {
        var date = new Date(2014,11,30,14,30,59,44);
        var result = Contact.Crypto.Protocol.prepareRequestSignBytes(
            '111111111111111111111', 'password123',
            date, [120, 110, 34, 34, 55, 56, 56, 88]
        );
        var strResult = String.fromCharCode.apply(String, result);
        assertEquals('<OperationRequest Type="sign"><CertificateId>111111111111111111111</CertificateId><Password>password123</Password><SigningTime>2014-12-30T14:30:59Z</SigningTime><Content>eG4iIjc4OFg=</Content><ReturnCertType>xml</ReturnCertType></OperationRequest>', strResult);
    },
    "test getResponseType": function() {
        var response = '<OperationResponse Type="sign"><element/></OperationResponse>',
            doc = XML.parse(response);

        var code = Contact.Crypto.Protocol.getResponseType(doc);
        assertEquals(2, code);
    }
});
