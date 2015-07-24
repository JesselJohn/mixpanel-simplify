self.addEventListener('message', function (e) {
	// { tempObj } Object in which single-level prperty object will be stored and sent to mixpanel
	var tempObj = {},
		obj = e.data;

	// Check if the object received by worker is an object ELSE directly respond the data
	if(typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]"){
		var turnNestedToSingleLevel = function(){
			var hasSubRexecuteFunction = undefined;
			for(var a in obj){
				var currentProp = obj[a];

				// Check if the aubproperty is an object ELSE delete property and store it in { tempObj }
				if(typeof currentProp === "object" && Object.prototype.toString.call(currentProp) === "[object Object]"){
					// If subproperty is an object loop through object and 
					for(var b in currentProp){
						obj[a+"_"+b] = currentProp[b];
					}

					// If the subproperty is an object initialize "hasSubRexecuteFunction" with the function reference to call recursively
					if(hasSubRexecuteFunction===undefined){
						hasSubRexecuteFunction = arguments.callee;
					}

					//delete the property
					delete currentProp;
				}else{
					//delete the property after storing it to { tempObj }
					delete currentProp;
					tempObj[a] = currentProp;
				}
			}

			try{
				// Make recursive call to function if subproperties containing object exits
				hasSubRexecuteFunction();
			}catch(err){}
		};

		// Make initial call to function which will structure object ad store it to { tempObj } as required
		turnNestedToSingleLevel();

		// Respond with the structured object
		self.postMessage(tempObj);
		return;
	}

	// Respond with the data without any change
	self.postMessage(e.data);
}, false);