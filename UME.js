/**
 * Created by mac on 14-3-15.
 */

var UME = (function(w, u) {
    var window = w,
        undefined = u,
        UME = {};

    var _moduleCache = {},
        _loading = [],
        _proxy = {},
        _all = [];

    /**
     * 定义模块变量
     */
    UME.define = function() {
        var self = this,
            argsLen = arguments.length,
            count = 0,
            fn,modules,modulesInfo,len,path, i,hasLoadingModules,inlineUseInfo;

        //说明没有传入requires参数
        if (argsLen <= 2) {
            modules = [];
            fn = self._is("Function",arguments[1]) ? arguments[1] : function(){};
        } else {
            modules = self._is("Array",arguments[1]) ? arguments[1] : [];
            fn = self._is("Function",arguments[2]) ? arguments[2] : function(){};
        }

        inlineUseInfo = self._parse(fn);

        if(inlineUseInfo){
            debugger;
            modules = modules.concat(inlineUseInfo.requires);
            fn = inlineUseInfo.fn;
        }

        //转换路径，统一为绝对路径
        path = self._toPath(arguments[0]);
        for(i = 0,len = modules.length; i < len; i++){
            modules[i] = self._toPath(modules[i]);
            _proxy[modules[i]] = _proxy[modules[i]] ? _proxy[modules[i]] : [];
            _proxy[modules[i]].push(bind);
        }

        //获取需要加载的模块
        modulesInfo = self._getRequireModulesInfo(modules);
        len = modulesInfo.length;
        for(i = 0; i < len; i ++){
            _loading.push(modulesInfo[i]);
        }

        //是否有加载的模块
        hasLoadingModules = self._hasLoadingModules(modules);

        /*
         * 如果len为0则说明：
         * 1.所依赖的模块全部都保存在了cache中
         * 2.没有所依赖的模块,只传入了模块定义
         * 3.模块正在被加载
         */
        if(!len){

            if(hasLoadingModules){
                _all.push(all);
                return;
            }

            var params = self._getModulesInstance(modules),
                obj = fn.apply(self,params);

            //将fn返回的对象保存在_moduleCaches中
            _moduleCache[path] = obj;

            self._emitAll();

        }else{
            _all.push(all);

            //否则需要加载这些模块
            for(i = 0; i < len; i++){
                self._load(modulesInfo[i],function(){
                    self._emitProxy(modules);
                    self._emitAll();
                })
            }
        }

        function bind() {
            count++;
        }

        function all(){
            var params,obj;

            //保证依赖模块是加载完成的
            if(count < len)
                return false;

            params = self._getModulesInstance(modules);

            //保证依赖模块的【所有依赖】已完成
            if(params.length != modules.length)
                return false;

            self._clearProxy(modules);

            obj = fn.apply(self,params);

            _moduleCache[path] = obj;

            return true;
        }
    }

    /**
     * 外部调用模块化
     * @param path
     */
    UME.use = function(path) {
        var self = this;

        if(self._is("String",path)){
            path = self._toPath(path);
            self._load(path,function(){
                return;
            });
        }else{
            throw new Error("the param path is needed,please check your function caller param!");
        }
    }

    /**
     * 获取模块信息，包括缓存的模块和需要加载的模块
     * @param arr
     * @returns {requires:Array}
     */
    UME._getRequireModulesInfo = function(arr){
        var self = this,
            requires = [],
            i,len;

        for(i = 0, len = arr.length; i < len; i++){
            var module = arr[i],
                isCached = module in _moduleCache  || self._getLoadingIndex(module) != -1;

            if(!isCached){
                requires.push(module);
            }
        }

        return requires;

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
            flag = _all[i] && _all[i].apply(self);

            if(flag){
                _all.splice(i,1);
            }
        }

        /**
         * 没有在加载的模块了（依赖全部加载完成）
         * 但是_all里面的回调没有执行完
         * 那么需要再执行一次以保证_all是空数组的
         */
        if(!_loading.length && _all.length){
            self._emitAll();
        }
    }

    /**
     * 相同的模块索引计数都需要+1
     * @param path
     * @private
     */
    UME._emitProxy = function(modules){
        var self = this,item;

        for(var i = 0,len = modules.length; i < len; i++){
            item = _proxy[modules[i]];
            for(var j = 0 ,length = item.length; j < length; j++){
                if(item[j]){
                    item[j].apply(self);
                    _proxy[modules[i]][j] = null;
                }
            }
        }
    }

    /**
     * 清理proxy中属性值为null的
     * @param modules
     * @private
     */
    UME._clearProxy = function(modules){
        var self = this,item;

        for(var i = 0,len = modules.length; i < len; i++){
            item = _proxy[modules[i]];
            for(var j = 0,length = item.length; j < length; j++){
                if(!item[j]){
                    item.splice(j,1);
                    length--;
                    j--;
                }
            }
        }
    }

    /**
     * 获取正在加载的loading模块的索引
     * @param module
     * @returns {number}
     * @private
     */
    UME._getLoadingIndex = function(module){
        var self = this,
            index = -1;

        for(var i = 0, len = _loading.length; i < len; i++){
            if(_loading[i] == module)
                index = i
        }

        return index;
    }

    /**
     * 是否有正在加载的模块
     * @param modules
     * @returns {boolean}
     */
    UME._hasLoadingModules = function(modules){
        var self = this,item;

        for(var i = 0,len = modules.length; i < len; i++){
            item = modules[i];
            for(var j = 0,length = _loading.length; j < length; j++){
                if(item == _loading[j]){
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 解析内联使用 self.use(path)
     * @param fn
     * @returns {{requires: Array, fn: Function}}
     * @private
     */
    UME._parse = function(fn){
        var self = this,
            fnStr = fn.toString(),
            reg = /self.use\((["'])(.+?)\1\);?/g,
            requires = [],
            params = [];

        if(!reg.test(fnStr))
            return;

        //清除换行，单行注释与双行注释
        fnStr = self._clearNotes(fnStr);

        //正则匹配出内联使用的use模块，并替换为模块名
        fnStr = fnStr.replace(/self.use\((["'])(.+?)\1\);?/g,function(){
            var module = arguments[2],
                begin = module.lastIndexOf("/"),
                last = module.lastIndexOf("."),
                moduleName = module.slice(begin+1).slice(0,last-2);

            moduleName += +new Date();

            requires.push(module);

            params.push(moduleName);

            return moduleName;

        });

        //将模块参数提取出来
        fnStr = fnStr.replace(/function\s*\((.*?)\)/,function(){
            params.unshift(arguments[1]);
            return "function()";
        });

        for(var i = 0,len = params.length; i < len; i++){
            if(!params[i])
                params.splice(i,1);
        }
        params = params.join(",");

        fn = new Function(params,"return ("+fnStr+"());");

        return {
            requires: requires,
            fn: fn
        }
    }

    /**
     * 清除注释
     * @param fnStr
     * @returns {*}
     * @private
     */
    UME._clearNotes = function(fnStr){
        var self = this;

        fnStr = fnStr.replace(/\/\/.*|\/\*.*\*\//g,'');

        return fnStr;
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
     * 加载script
     * @param path 文件路径
     * @param fn 回调函数
     * @private
     */
    UME._load = function(path, fn) {
        var self = this,
            isIE = document.attachEvent ? true : false,
            body = document.getElementsByTagName("body")[0],
            script,index;

        script = document.createElement("script");
        script.src = path;

        if (isIE) {
            self._on(script, "readystatechange", function() {
                if (script.readyState == "complete"){
                    index = self._getLoadingIndex(path);
                    if(index != -1)
                        _loading.splice(index,1);

                    fn.apply(self)
                }
            })
        } else {

            self._on(script, "load", function() {
                index = self._getLoadingIndex(path);
                if(index != -1)
                    _loading.splice(index,1);

                fn.apply(self)
            })
        }

        body.appendChild(script);

    }

    /**
     * 路径转换
     * @private
     */
    UME._toPath = function(path) {
        var self = this,
            location = window.location,
            protocol = location.protocol,
            hostname = location.hostname,
            port = location.port ? ":" + location.port : "",
            pathname = location.pathname,
            href = location.href,
            reg = /^(\/.+\/)/i,
            url,index;

        if(reg.test(pathname)){
            url = protocol + "//" + hostname + port + RegExp["$1"] + path;
        }else{
            index = href.lastIndexOf("/");
            url = href.slice(0,index) + path;
        }

        return url
    }

    /**
     * 判断是否是某种类型
     * @param type 类型，例如:String
     * @param param 对比的参数
     * @returns {boolean}
     * @private
     */
    UME._is = function(type,param){
        return Object.prototype.toString.call(param) == "[object " + type + "]";
    }


    return UME;

}(window, undefined));