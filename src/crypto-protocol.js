/**
 * Created by rusakovich on 23.02.15.
 */
var Contact = Contact || {};
Contact.Crypto = {};
Contact.Crypto.Protocol = {
    getBytes: function (str) {
        var bytes = [];
        if (!str) {
            return bytes;
        }
        for (var i = 0; i < str.length; ++i) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    },
    arrayBufferToBase64: function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
};

patterns = {
    dateFormat: "yyyy-mm-dd'T'HH:M:ss'Z'"
}

Contact.Crypto.Protocol.prepareRequestEnum = function (keyUsage, restriction, returnType) {
    var xml = new XML('OperationRequest', null);
    with (xml) {
        addAttribute('OperationRequest', 'Type', 'privateKeysEnumeration');
        addElement('KeyUsageMask', 'OperationRequest', keyUsage);
        addElement('Restrictions', 'OperationRequest', restriction);
        addElement('ReturnType', 'OperationRequest', returnType);
    }

    var rawXml = xml.printXML();
    return this.getBytes(rawXml);
}

Contact.Crypto.Protocol.prepareRequestSignBytes = function (idCertificate, password, date, bytes) {
    var xml = new XML('OperationRequest', null);
    with (xml) {
        addAttribute('OperationRequest', 'Type', 'sign');
        addElement('CertificateId', 'OperationRequest', idCertificate);
        addElement('Password', 'OperationRequest', password);
        addElement('SigningTime', 'OperationRequest', date.format(patterns.dateFormat));
        addElement('Content', 'OperationRequest', this.arrayBufferToBase64(bytes));
        addElement('ReturnCertType', 'OperationRequest', 'xml');
    }

    var rawXml = xml.printXML();
    return this.getBytes(rawXml);
}







