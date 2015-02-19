/**
 * Created by rusakovich on 19.02.15.
 */

function ContactAPI(options) {

    var defaultOptions = {
        host: "localhost",
        port: "49018",
        useSecure: false,

        //Error messages
        socketSupportErrorMessage: "Ваш браузер не поддерживает веб-сокеты",
        connectionErrorMessage: "Не удается подключиться к Клиенту создания ЭЦП",

        showMessage: function(message){
            alert(message);
        }
    };

    var copyOptions = function(){
        for(var option in defaultOptions){
            this.option = (options && options[option] !== undefined)
                ? options[option] : defaultOptions[option];
        }
    }
    copyOptions();

    var checkCallback = function(callback){
        if (typeof callback !== "undefined") {
            throw new TypeError("[" + callback.toString() +" must be a function");
        }
    }

    function checkSocket(ws){
        if (ws.readyState === undefined || ws.readyState > 1) {

        }
    }

    function createSocket(host, port){
        if(typeof(WebSocket) == "undefined") {
            this.showMessage(this.socketSupportErrorMessage);
            return null;
        }

        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        var prefix = (this.useSecure)?'wss':'ws';
        var ws =  new WebSocket(prefix + "://" + host + ":" + port);

        return ws;
    }

    function closeSocket(socket){
        if (socket.hasOwnProperty('close')){
            socket.close();
        }
    }

    function sendRequest(ws, version, content, length, successCallback, errorCallback){
        var _this = this;

        if (ws){
            ws.onerror = function (error) {
                errorCallback(error);
            };

            ws.onmessage = function (message) {
                successCallback(message);
            };

            try {
                var versionBuffer = new ArrayBuffer(1);
                versionBuffer[0] = version;
                ws.send(versionBuffer);

                var lengthBuffer = new ArrayBuffer(1);
                lengthBuffer[0] = length;
                ws.send(lengthBuffer);

                if (length != content.length) {
                    _this.showMessage("Неверная длинна данных");
                }

                var contentBuffer = new Uint8Array(content.length);
                for (var i = 0; i < content.length; i++) {
                    contentBuffer[i] = content.charCodeAt(i);
                }
                ws.send(contentBuffer.buffer);
            }catch(exception){
                errorCallback(exception);
                return;
            }
        }
    }

    function receiveResponse(){

    }

    ContactAPI.prototype.getCerts = function (successCallback, errorCallback) {
        checkCallback(successCallback);
        checkCallback(errorCallback);

        var ws = createSocket(this.host, this.port);

    }




}
