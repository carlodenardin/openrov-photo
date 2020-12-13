(function (window, $, undefined){

    'use strict';

    var Photo;

    Photo = function Photo(cockpit){

        this.cockpit = cockpit;

        //Array nel quale inserire path delle foto
        this.snapshots = ko.observableArray([]);

        //User Interface
        $('#diagnostic').after('<div class="drop-in-right" id="photos"></div>');
        $('#menuitems').append('<li><a href="#" id="show-photos">Photos</a></li>');
        $('#rov_status_panel').append('<div id="photoPannel"><input type="text" id="prefix" placeholder="Inserire prefisso"><button class="btn btn-success" id="enabledButton">Start</button><button class="btn btn-danger" id="disabledButton" disabled>Stop</button><input type="number" id="time" value="2"><button class="btn btn secondary" id="capturePhoto">Capture Photo</button></div>');
        
        var photo = this;
        var jsFileLocation = urlOfJsFile('photo.js');
                
        $('#photos').load(jsFileLocation + '../pannelloFoto.html', function () {
            
            ko.applyBindings(photo, $('#photos')[0]);

            $('#photos .back-button').click(function () {
                photo.hidePhotos();
            });
            
        });

        $('#enabledButton').click(function(){
            var time = document.getElementById('time').value;
            var prefix = document.getElementById('prefix').value;
            if(time < 1){
                alert("Non è possibile scegliere un tempo inferiore ad 1 secondo");
            } else{
                $('#disabledButton').prop('disabled', false);
                $('#enabledButton').prop('disabled', true);
                photo.takeMultiplyPhoto(time, prefix);
            }
        });

        $('#disabledButton').click(function(){
            clearInterval(window.timer);
            $('#disabledButton').prop('disabled', true);
            $('#enabledButton').prop('disabled', false);
        });

        $('#capturePhoto').click(function(){
            var prefix = document.getElementById('prefix').value;
            photo.takePhoto(prefix);
        });

    }

    Photo.prototype.listen = function listen(){
        var photo = this;

        photo.cockpit.socket.on('foto-aggiunta', function (filename){
            photo.snapshots().push('/photos/' + filename);
            photo.snapshots.valueHasMutated();
        });

        photo.cockpit.emit('inputController.register',
        {
            name: 'photo',
            description: 'Take photo',
            defaults: { keyboard: 'c' },
            down: function() { photo.takePhoto(); }
        });

        $('#show-photos').click(function () {
            $('#photos').show('fold');
        });

    };

    Photo.prototype.takePhoto = function takePhoto(prefix){
        var photo = this;
        photo.cockpit.socket.emit('snapshot', prefix);
    }
    
    Photo.prototype.takeMultiplyPhoto = function takeMultiplyPhoto(time, prefix){
        var photo = this;
        var t = time * 1000;
        window.timer = setInterval(function(){
            photo.takePhoto(prefix);
        }, t);
    };

    Photo.prototype.hidePhotos = function hidePhoto() {
        $('#photos').hide('fold');
    };

    window.Cockpit.plugins.push(Photo);

}(window, jQuery));