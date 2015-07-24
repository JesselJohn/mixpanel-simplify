(function (window) {
    var _track = function (params) {
        return new _constructor(params);
    },
    _constructor = function (params) {
        var date = new Date();

        mixpanel.register({
            "date": date.toLocaleTimeString()
        });

        this.status = params;
        //Assign unique properties for current initialized user
        // this.propertyName = params.propertyName;


        //Return object with associated properties and methods
        return this;
    };

    // Assign properties that will be shared between instances
    _constructor.prototype.selectTrackOption = function (option) {
        //If the property is disabled then don't execute
        if(this.status[option] === "OFF"){
            return;
        }

        var w = undefined;
        if (window.Worker) {
            // Use worker if exits in Browser
            if(w === undefined){
                w = new Worker("_worker.js");
            }

            w.addEventListener('message', function (e) {
                // Track data in mixpanel on successful response
                mixpanel.track(option, e.data);
            }, false);

            //
            w.postMessage({
                "age": 28,
                "gender": "male",
                "source": "facebook",
                "details":{
                    "firstName":"Amit",
                    "lastName":"Dubey",
                    "languages":{
                        "1":"hindi",
                        "2":"english"
                    }
                }
            });
        }else{
            // Add a fallback if worker doesnt exist
        }
    };

    if (!window._track) {
        window._track = _track;
    }
})(window);