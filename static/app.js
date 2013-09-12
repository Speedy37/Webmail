var config = {
    url : 'http://webmail.speedy37.c9.io/'
};

function Ajax() {}

Ajax.request = function(url) {
    return $.ajax(url, {
        dataType: "json",
        type: "GET"
    });
};

Ajax.submit = function(url, data) {
    return $.ajax(url, {
        data: data,
        dataType: "json",
        type: "POST"
    });
};

var i18n = {
    data : null,
    state : 0,
    onloaded : null,
    load : function(url) {
        Ajax.request(url).done(function(json) {
            i18n.data = json;
            if(i18n.state === 2) {
                i18n.updateUi();
                if(i18n.onloaded)
                    i18n.onloaded();
            }
        });
    },
    translate : function(name) {
        return i18n.data[name];
    },
    updateUi: function() {
        var elements = document.getElementsByClassName('i18n');
        for (var i = 0, j = elements.length; i < j; ++i) {
            var element = elements[i];
            var attr = element.getAttribute("data-i18n");
            if (attr !== null && typeof attr === "string" && attr.length > 0) {
                var pos = 0;
                var indexEqual = attr.indexOf("=", pos);
                while( indexEqual !== -1 ) {
                    var indexEnd = attr.indexOf(",", indexEqual+1);
                    if(indexEnd === -1) {
                        indexEnd = attr.length;
                    }
                    var attributeName = attr.substring(pos, indexEqual);
                    var translationName = attr.substring(indexEqual+1, indexEnd);
                    if( attributeName === "content" ) {
                        element.textContent = i18n.translate(translationName);
                    } else {
                        element.setAttribute(attributeName, i18n.translate(translationName));
                    }
                    pos = indexEnd;
                }
            } else if(element.nodeName == "INPUT") {
                if(typeof element.value === "string" && element.value.length) {
                    element.value = i18n.translate(element.value);
                }
            } else if(typeof element.textContent === "string" && element.textContent.length > 0) {
                element.textContent = i18n.translate(element.textContent);
            }
        }
    }
};
i18n.t = i18n.translate;
i18n.load('i18n/fr.json');
i18n.onloaded = function() {
    $("#login").fadeIn();
};

var socket = io.connect(); // TIP: .connect with no args does auto-discovery
socket.on('connect', function() {
  console.log('Connected');
    $('#login-submit').click(function() {
        socket.emit("login", {
            username: $("#login-username").val(),
            password: $("#login-password").val()
        });
    });
    socket.on('logged-in', function(data) {
      console.log('logged-in')
    });
    socket.on('error', function(error) {
      console.log('error : '+error);
    });
});

$(function() {
    if(i18n.state === 1) {
        i18n.updateUi();
    }
    i18n.state = 2;
});