self.addEventListener('message', function (e) {
	var tempObj = {},
		obj = e.data;
	if(typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]"){
		var turnNestedToSingleLevel = function(){
			var hasSubRexecuteFunction = undefined;
			for(var a in obj){
				var currentProp = obj[a];
				if(typeof currentProp === "object" && Object.prototype.toString.call(currentProp) === "[object Object]"){
					for(var b in currentProp){
						delete currentProp;
						obj[a+"_"+b] = currentProp[b];
						if(hasSubRexecuteFunction===undefined){
							hasSubRexecuteFunction = arguments.callee;
						}
					}
				}else{
					delete currentProp;
					tempObj[a] = currentProp;
				}
			}

			try{
				hasSubRexecuteFunction();
			}catch(err){}
		};

		turnNestedToSingleLevel();
		self.postMessage(tempObj);
		return;
	}

	self.postMessage(e.data);
}, false);