/**
 * Created by mac on 14-3-15.
 */

/**
 * todo:
 * 0.use模块需要complete
 * 1.模块的重复加载去除
 * 2.内联使用use的依赖正则解析
 */
;var UME = (function(w, u) {
	var window = w,
		undefined = u,
		UME = {};
		
	
	var _moduleCache = {},
        _moduleQueue = [],
        _all = [];

    /**
     * 定义模块变量
     */
	UME.define = function() {
		var self = this,
			argsLen = arguments.length,
            i = 0,
            fn,modules,modulesInfo,len,path;

		//说明没有传入requires参数
		if (argsLen <= 2) {
			modules = [];
			fn = self._isFunction(arguments[1]) ? arguments[1] : function(){};
		} else {
			modules = self._isArray(arguments[1]) ? arguments[1] : [];
			fn = self._isFunction(arguments[2]) ? arguments[2] : function(){};
		}

        path = arguments[0];

        modulesInfo = self._getRequireModulesInfo(modules);
        len = modulesInfo.requires.length;

        /*
         * 如果len为0则说明：
         * 1.所依赖的模块全部都保存在了cache中
         * 2.没有所依赖的模块,只传入了模块定义
         */
        if(!len){
            var params = self._getModulesInstance(modules),
                obj = fn.apply(self,params);

            //将fn返回的对象保存在_moduleCaches中
            _moduleCache[path] = obj;

            self._emitAll();

        }else{
            //否则需要加载这些模块

            _all.push(all);

            for(var i = 0; i < len; i++){
                self._load(modulesInfo.requires[i],function(){
                    bind();
                    self._emitAll();
                })
            }
        }

		function bind() {
			i++;
		}

        function all(){
            var len = modules.length,
                params,obj;

            //保证依赖模块是加载完成的
            if(i < len)
                return false;

            params = self._getModulesInstance(modules);

            //保证依赖模块的【所有依赖】已完成
            if(params.length != len)
                return false;

            obj = fn.apply(self,params);

            _moduleCache[path] = obj;

            return true;
        }
	}

    /**
     * 外部调用模块化
     * @param path
     * @param callback
     */
	UME.use = function(path, callback) {

	}

    /**
     * 获取模块信息，包括缓存的模块和需要加载的模块
     * @param arr
     * @returns {{requires: Array, caches: Object}}
     */
    UME._getRequireModulesInfo = function(arr){
        var self = this,
            requires = [],
            caches = {},
            i,len;

        for(i = 0, len = arr.length; i < len; i++){
            var module = arr[i],
                isCached = module in _moduleCache && _moduleCache[module];

            if(isCached){
                caches[module] = _moduleCache[module];
            }else{
                requires.push(module);
            }
        }

        return {
            requires : requires,
            caches : caches
        }

    }

    /**
     * 返回模块的实例数组
     * @param modules
     * @returns {Array}
     * @private
     */
    UME._getModulesInstance = function(modules){
        var self = this,
            instances = [];

        for(var i = 0,len = modules.length; i < len; i++){
            if(modules[i] in _moduleCache)
                instances.push(_moduleCache[modules[i]]);
        }

        return instances;
    }

    /**
     * 循环触发_all队列
     * @private
     */
    UME._emitAll = function(){
        var self = this,
            flag = false;

        for(var i = _all.length - 1; i >= 0; i--){
            flag = _all[i].apply(self);

            if(flag){
                _all.splice(i,1);
            }
        }
    }


	/**
	 * 事件绑定函数
	 * @param ele 绑定对象
	 * @param eventName 事件名
	 * @param fn 事件函数
	 * @private
	 */
	UME._on = function(ele, eventName, fn) {
		var self = this,
			event = eventName + fn.toString().replace(/\s+/g, '');

		ele[eventName] = ele[eventName] ? ele[eventName] : {};
		ele[eventName][event] = fn;

		if (document.attachEvent) {
			ele.attachEvent("on" + eventName, function(ev) {
				fn.call(ele, ev);
			});
		} else if (document.addEventListener) {
			ele.addEventListener(eventName, fn, false);
		} else {
			ele["on" + eventName] = ele.eventName[event];
		}
	}

	/**
	 * 事件取消函数
	 * @param ele 取消对象
	 * @param eventName 事件名
	 * @param fn 事件函数
	 * @private
	 */
	UME._off = function(ele, eventName, fn) {
		var self = this,
			event;

		//如果小于3，就删除所有事件
		//否则就删除对应的事件
		if (arguments.length < 3) {
			if (eventName) {
				if (document.detachEvent) {
					for (var item in ele[eventName]) {
						if (ele[eventName].hasOwnProperty(item))
							ele.detachEvent("on" + eventName, ele[eventName][item]);
					}
				} else if (document.removeEventListener) {
					for (var item in ele[eventName]) {
						if (ele[eventName].hasOwnProperty(item))
							ele.removeEventListener(eventName, ele[eventName][item]);
					}
				} else {
					ele["on" + eventName] = null;
				}
				ele[eventName] = null;
			} else {
				return;
			}
		} else {
			event = eventName + fn.toString().replace(/\s+/g, '');
			fn = ele[eventName][event];

			if (typeof fn != "function") return;

			if (document.detachEvent) {
				ele.detachEvent("on" + eventName, function(ev) {
					fn.call(ele, ev);
				});
			} else if (document.removeEventListener) {
				ele.removeEventListener(eventName, fn, false);
			} else {
				ele[eventName][event] = null;
			}
		}
	}

	/**
	 * 加载script
	 * @param path 文件路径
	 * @param fn 回调函数
	 * @private
	 */
	UME._load = function(path, fn) {
		var self = this,
			isIE = document.attachEvent ? true : false,
			body = document.getElementsByTagName("body")[0],
            script;

		script = document.createElement("script");
		script.src = path;

		if (isIE) {
			self._on(script, "readystatechange", function() {
				if (script.readyState == "complete")
                    fn();
			})
		} else {
			self._on(script, "load", function() {
				fn();
			})
		}

		body.appendChild(script);

	}

    /**
     * 路径转换
     * @private
     */
	UME._toPath = function() {

	}

    /**
     * 判断是否是函数
     * @param fn
     * @returns {boolean}
     * @private
     */
    UME._isFunction = function(fn){
        return Object.prototype.toString.call(fn) == "[object Function]";
    }

    /**
     * 判断是否是数组
     * @param arr
     * @returns {boolean}
     * @private
     */
    UME._isArray = function(arr){
        return Object.prototype.toString.call(arr) == "[object Array]";
    }

    /**
     * 判断是否是对象
     * @param arr
     * @returns {boolean}
     * @private
     */
    UME._isObject = function(obj){
        return Object.prototype.toString.call(obj) == "[object Object]";
    }


	return UME;

}(window, undefined));
