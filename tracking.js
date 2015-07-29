(function (window) {
    var propertySeperator = "_",
    userAction = "$direct",
    cloneObject = function(params){
        try{
            // Clone Object
            return JSON.parse(JSON.stringify(params));
        }catch(err){
            return {};
        }
    },
    _track = function (params) {
        var prms = cloneObject(params);
        return new _constructor(prms);
    },
    _constructor = function (params) {
        var date = new Date(),
        sP = this.superProperties = params.superProperties || {};

        // Add date and time to superproperty object
        sP.date = date.toLocaleDateString();
        sP.timeStr = date.toLocaleTimeString();

        // Initialize mixpanel with token
        mixpanel.init(this.token = params.token);

        //Register Superproperties
        mixpanel.register(sP);

        // Set status property which will be used to check the state of tracking event whether "ON" or "OFF"
        this.status = params.status || {};

        // Set propertySeperator if passed by params
        if(params.seperator!==undefined){
            propertySeperator = params.seperator;
        }

        //Return object with associated properties and methods
        return this;
    };

    // Methods to track action
    _contructor.prototype.setAction = function(action){
        userAction = action;
    };

    _constructor.prototype.getAction = function(){
        return userAction;
    };


    // Methods for superproperties
    _constructor.prototype.getSuperProperty = function(super_property_name){
        // Return superproperty value
        return this.superProperties[super_property_name];
    };

    _constructor.prototype.setSuperProperty = function(obj){
        var registerSuperProperties = undefined;

        for(var a in obj){
            if(a!=="date" && a!=="timeStr"){
                // Update superProperty with new value
                this.superProperties[a] = obj[a];
                if(registerSuperProperties===undefined){
                    registerSuperProperties = function(){
                        // Re-register changed superproperty
                        mixpanel.register(obj);   
                    }
                }
            }else{
                delete obj[a];
            }
        }

        // Execute registerSuperProperties to register superProperties if updated
        try{
            registerSuperProperties();
        }catch(err){}
    };

    _constructor.prototype.updateDateTime = function(){
        var date = new Date(),
        sP = this.superProperties;

        // Update date and time of superproperty object
        sP.date = date.toLocaleDateString();
        sP.timeStr = date.toLocaleTimeString();

        // Re-register superproperties
        mixpanel.register({"date":sP.date,"timeStr":sP.timeStr});
    };

    //Methods for settings
    _constructor.prototype.getOptionState = function(track_name){
        // Return current state in the settings of the tracking event
        return this.status[track_name];
    };

    _constructor.prototype.setOptionState = function(obj){
        for(var a in obj){
            this.status[a] = obj[a];
        }
    };

    // Methods to execute directly on objects
    _constructor.prototype.toFlatObject = function(param){
        // { tempObj } Object in which single-level prperty object will be stored and sent to mixpanel
        var tempObj = {};

        // Check if the object received by worker is an object ELSE directly respond the data
        if(typeof param === "object" && Object.prototype.toString.call(param) === "[object Object]"){
            var turnNestedToSingleLevel = function(){
                var hasSubRexecuteFunction = undefined;
                for(var a in param){
                    var currentProp = param[a];

                    // Check if the subproperty is an object ELSE delete property and store it in { tempObj }
                    if(typeof currentProp === "object" && Object.prototype.toString.call(currentProp) === "[object Object]"){
                        // If subproperty is an object loop through object and store them as single level properties on object
                        for(var b in currentProp){
                            param[a+propertySeperator+b] = currentProp[b];
                        }

                        // Initialize "hasSubRexecuteFunction" with the function reference to call recursively
                        if(hasSubRexecuteFunction===undefined){
                            hasSubRexecuteFunction = turnNestedToSingleLevel;
                        }

                        // Delete the property
                        delete currentProp;
                    }else{
                        // Delete the property after storing it to { tempObj }
                        delete currentProp;
                        tempObj[a] = currentProp;
                    }
                }

                try{
                    // Make recursive call to function if subproperties containing object exits
                    hasSubRexecuteFunction();
                }catch(err){}
            };

            // Make initial call to function which will flatten object to single level properties and store it to { tempObj }
            turnNestedToSingleLevel();

            // Return with the flat object
            return tempObj;
        }
        // Return with the data without any change if data received by worker is not an object
        return param;
    };

    // Assign properties that will be shared between instances
    _constructor.prototype.selectTrackOption = function (options) {
        // Initialize all properties which are sent to this function which is required for tracking.
        var track_name = options.name,
            track_details = options.details;

        // If the property is OFF in settings passed then don't execute
        if(this.status[track_name] === "OFF"){
            return;
        }

        mixpanel.track(track_name, this.toFlatObject(track_details));

        // Reset action for next track till another action is recorded
        userAction = "$direct";
    };

    // If there isn't any "_track" property on window then assign it.
    if (!window._track) {
        window._track = _track;
    }
})(window);