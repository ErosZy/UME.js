UME.js
======

#1.简介
UME.js -- 轻巧、简单的模块化库


#2.兼容性

IE6+、Chrome、Firefox、Safari、Opera等浏览器

#3.使用

###模块定义

####定义：

````
	UME.define(path,requires,fn);
````

####例子：

````
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


####外部使用：

````

	UME.use(path);
	
````
####内联使用：

````
	this.use(path);
````

####例子：

````	
	
	UME.use("./example.js");
	
	
	UME.define("./example.js",["./other.js"],function(module){
		var module2 = this.use("./other2.js");
		
		console.log(module,module2);
	})

````

