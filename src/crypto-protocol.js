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

function CryptoException(message) {
    this.message = message;
}

Contact.Crypto.Protocol.Patterns = {
    dateFormat: "yyyy-mm-dd'T'HH:M:ss'Z'"
}

Contact.Crypto.Protocol.ResponseType = {
    ERROR: ['errorReport', -1],
    UNKNOWN: ['unknown', 0],
    ENUM: ['privateKeysEnumeration', 1],
    SIGN: ['sign', 2],
    VERIFY: ['verify', 3]
}

Contact.Crypto.Protocol.CertificateInfo = {
    idCertificate: '',           // идентификатор сертификата
    validFrom: '',             // дата и время, с которого действует сертификат
    validTo: '',               // дата и время, до которого действует сертификат
    subjectCommonName: '',       // OID 2.5.4.3
    subjectOrganizationName: '', // OID 2.5.4.10
    subjectCountryName: '',      // OID 2.5.4.6
    subjectRegion: '',           // OID 2.5.4.8
    subjectCity: '',             // OID 2.5.4.7
    subjectStreet: '',           // OID 2.5.4.9
    subjectTitle: '',            // OID 2.5.4.12
    subjectOrganizationUnit: '', // OID 2.5.4.11
    subjectSurName: '',          // OID 2.5.4.4
    subjectSubjectName: '',      // OID 2.5.4.41
    issuerCommonName: '',        // OID 2.5.4.3
    issuerOrganizationName: '',  // OID 2.5.4.10
    issuerCountryName: '',       // OID 2.5.4.6
    issuerRegion: '',            // OID 2.5.4.8
    issuerCity: '',              // OID 2.5.4.7
    issuerStreet: '',            // OID 2.5.4.9
    issuerMail: '',              // OID 1.2.849.113549.1.9.1
    issuerKeyIdentifier: '',     // OID 2.5.29.35
    subjectType: '',             // OID 2.5.29.19
    keyUsage: '',                // OID 2.5.29.15
    keyIdentifier: '',           // OID 2.5.29.14
    extendedKeyUsage: '',        // OID 2.5.29.37
    UNP: '',                     // УНП
    passport: '',                // данные из документа удостоверяющего личность
    publicKey: ''               // значение открытого ключа
}

Contact.Crypto.Protocol.Signature = {
    signature: '',
    content: '',
    certificateInfo: undefined
}

Contact.Crypto.Protocol.VerifyInfo = {
    certificateValid: false,
    certificateValidDescription: '',
    signatureValid: false,
    signatureValidDescription: '',
    signingTime: ''
}

Contact.Crypto.Protocol.VerifyResult = {
    verifyInfo: undefined,
    certificateInfo: undefined
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
        addElement('SigningTime', 'OperationRequest', date.format(this.Patterns.dateFormat));
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
        addElement('Content', 'OperationRequest', this._arrayBufferToBase64(bytes));
        addElement('Signature', 'OperationRequest', signature);
        addElement('ReturnCertType', 'OperationRequest', 'xml');
    }

    var rawXml = xml.printXML();
    return this._getBytes(rawXml);
}

Contact.Crypto.Protocol.getResponseType = function (doc) {
    var _responseType = Contact.Crypto.Protocol.ResponseType,
        type = _responseType.UNKNOWN;

    if (XML.getRootElementName(doc) == 'OperationResponse') {
        var typeAttr = XML.getRootElementAttrValue(doc, 'Type');

        if (typeAttr) {
            for (var currType in _responseType) {
                if (_responseType[currType][0] == typeAttr) {
                    return _responseType[currType][1];
                }
            }
        }
    }

    return type[1];
}

Contact.Crypto.Protocol._getCertificateInfo = function (certNode) {
    var ci = Object.create(Contact.Crypto.Protocol.CertificateInfo),
        temp,
        content,
        children = certNode.children;

    for (var i = 0, cur = children[i]; i < children.length; i++) {
        switch (cur.tagName) {

            case "CertificateValidity":
                for (var j = 0; j < cur.children.length; j++) {
                    temp = cur.children.item(j);
                    content = temp.textContent.trim();
                    switch (temp.tagName) {
                        case "NotBefore":
                            ci.validFrom = new Date(content);
                            break;
                        case "NotAfter":
                            ci.validTo = new Date(content);
                            break;
                    }
                }
                break;

            case "Subject":
                for (var j = 0; j < cur.children.length; j++) {
                    temp = cur.children.item(j);
                    content = temp.textContent.trim();
                    switch (temp.tagName) {
                        case "CommonName":
                            ci.subjectCommonName = content;
                            break;   // OID 2.5.4.3
                        case "Organization":
                            ci.subjectOrganizationName = content;
                            break; // OID 2.5.4.10
                        case "Country":
                            ci.subjectCountryName = content;
                            break; // OID 2.5.4.6
                        case "City":
                            ci.subjectCity = content;
                            break; // OID 2.5.4.7
                        case "Title":
                            ci.subjectTitle = content;
                            break; // OID 2.5.4.12
                        case "OrganizationUnit":
                            ci.subjectOrganizationUnit = content;
                            break; // OID 2.5.4.11
                        case "Surname":
                            ci.subjectSurName = content;
                            break; // OID 2.5.4.4
                        case "GivenName":
                            ci.subjectSubjectName = content;
                            break; // OID 2.5.4.41 ???????????
                        //case "Region":         ci.setSubjectRegion(temp.getTextContent().trim()); break; // OID 2.5.4.8 ----------
                        //case "Street":         ci.setSubjectStreet(temp.getTextContent().trim()); break; // OID 2.5.4.10 ??????????
                        case "UNP":
                            ci.UNP = content;
                            break;
                        case "IdentityCard":
                            ci.passport = content;
                            break;
                    }
                }
                break;

            case "Issuer":
                for (var j = 0; j < children.length; j++) {
                    temp = children.item(j);
                    content = temp.textContent.trim();
                    switch (temp.tagName) {
                        case "CommonName":
                            ci.issuerCommonName = content;
                            break;   // OID 2.5.4.3
                        case "Organization":
                            ci.issuerOrganizationName = content;
                            break; // OID 2.5.4.10
                        case "Country":
                            ci.issuerCountryName = content;
                            break; // OID 2.5.4.6
                        //case "Region":     ci.setIssuerRegion(temp.getTextContent().trim()); break; // OID 2.5.4.8 ----------
                        case "City":
                            ci.issuerCity = content;
                            break; // OID 2.5.4.7
                        //case "Street":     ci.setIssuerStreet(temp.getTextContent().trim()); break; // OID 2.5.4.10 ??????????
                        //case "Mail":       ci.setIssuerMail(temp.getTextContent().trim()); break; // OID 1.2.849.113549.1.9.1 --------------
                    }
                }
                break;

            case "Extensions":
                for (var j = 0; j < children.length; j++) {
                    temp = children.item(j);
                    content = temp.textContent.trim();
                    switch (temp.tagName) {
                        case "AuthorityKeyIdentifier":
                            ci.issuerKeyIdentifier = content;
                            break;   // OID 2.5.29.35
                        case "BasicConstraints":
                            var attrs = temp.attributes;
                            for (var k = 0; k < attrs.length; k++) {
                                if (attrs.item(k).nodeName == "CA" && attrs.item(k).nodeValue.trim() == "true") {
                                    ci.subjectType = attrs.item(k).nodeName; // OID 2.5.29.19
                                }
                            }
                            break;
                        case "KeyUsage":
                            ci.keyUsage = content;
                            break;   // OID 2.5.29.15
                        case "SubjectKeyIdentifier":
                            ci.keyIdentifier = content;    // OID OID 2.5.29.14
                            ci.idCertificate = content;
                            break;
                        case "ExtKeyUsage":
                            for (var n = 0; n < temp.children.length; n++) {
                                var childTemp = cur.children.item(n);
                                if (childTemp.nodeName == "OCSPSigning") {
                                    var ats = childTemp.attributes;
                                    for (var k = 0; k < ats.length; k++) {
                                        if (ats.nodeName == "OId") {
                                            ci.extendedKeyUsage = ats.item(k).nodeValue.trim(); // OID 2.5.29.37
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
                break;

            case "SubjectPublicKeyInfo":
                for (var j = 0; j < children.length; j++) {
                    temp = children.item(j);
                    content = temp.textContent.trim();
                    switch (temp.nodeName) {
                        case "PublicKey":
                            ci.publicKey(content);
                            break;
                    }
                }
                break;
        }
    }
}

Contact.Crypto.Protocol.parsePrivateKeysEnumResponse = function (doc) {
    var rootElement = doc.documentElement,
        nodes = rootElement.getElementsByTagName("Certificates");
    if (!nodes) {
        throw new CryptoException("Отсутствует тег 'Certificates'");
    }

    if (nodes.length != 1) {
        throw new CryptoException("Тег 'Certificates' встречается больше одного раза.");
    }

    var certNode = nodes[0];
    if (!certNode.hasAttributes()) {
        throw new CryptoException("Тег 'Certificates' не имеет аттрибутов.");
    }

    var totalCertsAmount = -1, validCertsAmount = -1;
    for (var i = 0, attrs = certNode.attributes, n = attrs.length; i < n; i++) {
        switch (attrs[i].nodeName) {
            case 'TotalAmount':
                totalCertsAmount = attrs[i].nodeValue;
                break;
            case 'ValidAmount':
                validCertsAmount = attrs[i].nodeValue;
                break;
        }
    }

    if (totalCertsAmount < 0) {
        throw new CryptoException("Отрицательное значение аттрибута 'TotalAmount' тега 'Certificates'");
    }

    if (validCertsAmount < 0) {
        throw new CryptoException("Отрицательное значение аттрибута 'ValidAmount' тега 'Certificates'.");
    }

    if (totalCertsAmount == 0) {
        return null;
    }

    var certInfo = [],
        cert = rootElement.getElementsByTagName("Certificate"),
        certPath = rootElement.getElementsByTagName("CertificatePath"),
        certError = rootElement.getElementsByTagName("CertificateError");

    if (cert.length == validCertsAmount) {
        for (var i = 0; i < cert.length; i++) {
            certInfo.push(Contact.Crypto.Protocol._getCertificateInfo(cert.item(i)));
        }
    } else if (certPath.length == validCertsAmount) {
        //TODO handle cert path
        throw new CryptoException("Структура 'CertPath' не поддерживается");
    } else {
        throw new CryptoException("Неверная структура ответа.");
    }

    if (certError.length == totalCertsAmount - validCertsAmount) {
        //TODO handle CertificateError tags
    }

    return certInfo;
}

Contact.Crypto.Protocol.parseSignResponse = function (doc) {
    var signature = Object.create(Contact.Crypto.Protocol.Signature);

    var rootElement = doc.documentElement,
        sign = rootElement.getElementsByTagName("Signature");

    if (!sign) {
        throw new CryptoException("Отсутствует тег 'Signature'.");
    }

    if (sign.length != 1) {
        throw new CryptoException("Тег 'Signature' встречается больше одного раза.");
    }

    var signTag = sign[0];
    signature.signature = signTag.textContent.trim();

    var certInfo,
        cert = rootElement.getElementsByTagName("Certificate"),
        certPath = rootElement.getElementsByTagName("CertificatePath"),
        certError = rootElement.getElementsByTagName("CertificateError");

    if (cert.length == 1) {
        certInfo = Contact.Crypto.Protocol._getCertificateInfo(cert);
    } else if (certPath.length == 1) {
        //TODO handle cert path
        throw new CryptoException("Структура 'CertPath' не поддерживается");
    } else {
        throw new CryptoException("Неверная структура ответа");
    }

    signature.certificateInfo = certInfo;
}

Contact.Crypto.Protocol.parseVerifyResponse = function (doc) {
    var verifyResult = Object.create(Contact.Crypto.Protocol.VerifyResult),
        verifyInfo = Object.create(Contact.Crypto.Protocol.VerifyInfo);

    var rootElement = doc.documentElement,
        certValid = rootElement.getElementsByTagName("CertificateValid");

    if (!certValid) {
        throw new CryptoException("Отсутствует тег 'CertificateValid'");
    }

    if (certValid.length != 1) {
        throw new CryptoException("Тег 'CertificateValid' встречается больше одного раза.");
    }

    switch (certValid.item(0).textContent.trim()) {
        case "yes":
        case "true":
            verifyInfo.certificateValid = true;
            break;
        case "no":
        case "false":
            verifyInfo.certificateValid = false;
        default:
            throw new CryptoException("Неверное значение контента тега 'CertificateValid'.");
    }

    var certValidDescr = rootElement.getElementsByTagName("CertificateValidDescription");
    if (!certValidDescr) {
        throw new CryptoException("Отсутствует тег 'CertificateValidDescription'");
    }

    if (certValidDescr.length != 1) {
        throw new CryptoException("Тег 'CertificateValidDescription' встречается больше одного раза");
    }
    verifyInfo.certificateValidDescription = certValidDescr.item(0).textContent.trim();

    var signDate = rootElement.getElementsByTagName("SigningTime");
    if (!signDate) {
        throw new CryptoException("Отсутствует тег 'SigningTime'.");
    }

    if (signDate.length != 1) {
        throw new CryptoException("Тег 'SigningTime' встречается больше одного раза");
    }
    verifyInfo.signingTime = new Date(signDate);

    var signValid = rootElement.getElementsByTagName("SignatureValid");
    if (!signValid) {
        throw new CryptoException("Отсутствует тег 'SignatureValid'.");
    }

    if (signValid.length != 1) {
        throw new CryptoException("Тег 'SignatureValid' встречается больше одного раза.");
    }

    switch (signValid.item(0).textContent().trim()) {
        case "yes":
        case "true":
            verifyInfo.signatureValid = true;
            break;
        case "no":
        case "False":
            verifyInfo.signatureValid = false;
            break;
        default:
            throw new CryptoException("Неверное значение контента тега 'SignatureValid'.");
    }

    var signValidDescr = rootElement.getElementsByTagName("SignatureValidDescription");
    if (!signValidDescr) {
        throw new CryptoException("Отсутствует тег 'SignatureValidDescription'.");
    }
    if (signValidDescr.length != 1) {
        throw new CryptoException("Тег 'SignatureValidDescription' встречается больше одного раза.");
    }
    verifyInfo.certificateValidDescription = signValidDescr.item(0).textContent.trim();

    var certInfo;
    var cert = rootElement.getElementsByTagName("Certificate"),
        certPath = rootElement.getElementsByTagName("CertificatePath"),
        certError = rootElement.getElementsByTagName("CertificateError");

    if (cert.length == 1){
        certInfo = Contact.Crypto.Protocol._getCertificateInfo(cert.item(0));
    } else if (certPath.length == 1){
        //TODO handle cert path
    }else{
        throw new CryptoException("Неверная структура ответа");
    }

    verifyResult.verifyInfo = verifyInfo;
    verifyResult.certificateInfo = certInfo;

    return verifyResult;
}

Contact.Crypto.Protocol.parseErrorResponse = function (doc) {
    var rootElement = doc.documentElement,
        err = rootElement.getElementsByTagName("CertificateValid");

    if (err){
        throw new CryptoException("Отсутствует тег 'ErrorMessage'.");
    }

    if (err.length != 1){
        throw new CryptoException("Тег 'ErrorMessage' встречается больше одного раза.")
    }

    return err.item(0).textContent.trim();
}















