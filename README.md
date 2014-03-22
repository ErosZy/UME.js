UME.js
======

#Introduce
UME.js -- 轻巧、简单的模块化库


#USEAGE
###模块定义

````
	UME.defined(path,requires,fn);
	
	UME.define("./example.js",["./other.js"],function(module){
		console.log(module);
	})
	
	UME.define("./other.js",function(){
		
		return {
			version : "1.0",
			getVersion:function(){
				return this.version;
			}
		}
	})
````

###模块使用

````
####外部使用：

	UME.use(path);
	
####内联使用：
	this.use(path);
	
	
	UME.use("./example.js");
	
	
	UME.define("./example.js",["./other.js"],function(module){
		var module2 = self.use("./other2.js");
		
		console.log(module,module2);
	})

````

