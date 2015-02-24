/**
 * Created by rusakovich on 23.02.15.
 */
var Contact = Contact || {};
Contact.Crypto = {};
Contact.Crypto.Protocol = {
    _getBytes: function (str) {
        var bytes = [];
        if (!str) {
            return bytes;
        }
        for (var i = 0; i < str.length; ++i) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    },
    _arrayBufferToBase64: function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
};

Contact.Crypto.Protocol.patterns = {
    dateFormat: "yyyy-mm-dd'T'HH:M:ss'Z'"
}

Contact.Crypto.Protocol.responseType = {
    ERROR: ['errorReport', -1],
    UNKNOWN: ['unknown', 0],
    ENUM: ['privateKeysEnumeration', 1],
    SIGN: ['sign', 2],
    VERIFY: ['verify', 3]
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
    return this._getBytes(rawXml);
}

Contact.Crypto.Protocol.prepareRequestSignBytes = function (idCertificate, password, date, bytes) {
    var xml = new XML('OperationRequest', null);

    with (xml) {
        addAttribute('OperationRequest', 'Type', 'sign');
        addElement('CertificateId', 'OperationRequest', idCertificate);
        addElement('Password', 'OperationRequest', password);
        addElement('SigningTime', 'OperationRequest', date.format(this.patterns.dateFormat));
        addElement('Content', 'OperationRequest', this._arrayBufferToBase64(bytes));
        addElement('ReturnCertType', 'OperationRequest', 'xml');
    }

    var rawXml = xml.printXML();
    return this._getBytes(rawXml);
}

Contact.Crypto.Protocol.prepareRequestVerifyBytes = function (bytes, signature) {
    var xml = new XML('OperationRequest', null);
    with (xml) {
        addAttribute('OperationRequest', 'Type', 'verify');
        addElement('Content', 'OperationRequest',  this._arrayBufferToBase64(bytes));
        addElement('Signature', 'OperationRequest', signature);
        addElement('ReturnCertType', 'OperationRequest', 'xml');
    }

    var rawXml = xml.printXML();
    return this._getBytes(rawXml);
}

Contact.Crypto.Protocol.getResponseType = function (doc) {
   var _responseType = Contact.Crypto.Protocol.responseType,
       type = _responseType.UNKNOWN;

   if (XML.getRootElementName(doc) == 'OperationResponse'){
       var typeAttr = XML.getRootElementAttrValue(doc, 'Type');

       if (typeAttr){
           for(var currType in _responseType){
               if (_responseType[currType][0] == typeAttr){
                   return _responseType[currType][1];
               }
           }
       }
   }

   return type[1];
}









