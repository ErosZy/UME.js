UME.js
======

#1.简介
UME.js -- 轻巧、简单的模块化库


#2.兼容

IE6+、Chrome、Firefox、Safari、Opera等浏览器

#3.使用
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

#4.其他

只想说：本库主要是用作自己研究学习之用，还存在一些不完善及编写不成熟的地方。

