var fs = require('fs');

var Photo;

Photo = function Photo(name, deps){

    deps.io.sockets.on('connection', function (socket){

        socket.on('snapshot', function(prefix){

            deps.rov.camera.snapshot(prefix, function (filename){
                deps.io.sockets.emit('foto-aggiunta', prefix + filename);
            });

        });
        
    });
}

module.exports = Photo;