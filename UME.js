/**
 * Created by mac on 14-3-15.
 */

;;(function(w, u) {
    var window = w,
        undefined = u,
        dataMain,
        UME = {};

    var _moduleCache = {},
        _loading = [],
        _proxy = {},
        _all = [];

    /**
     * ����ģ�����
     */
    UME.define = function() {
        var self = this,
            argsLen = arguments.length,
            count = 0,
            fn,modules,modulesInfo,len,path,i,hasLoadingModules,inlineUseInfo;

        //˵��û�д���requires����
        if (argsLen <= 2) {
            modules = [];
            fn = self._is("Function",arguments[1]) ? arguments[1] : function(){};
        } else {
            modules = self._is("Array",arguments[1]) ? arguments[1] : [];
            fn = self._is("Function",arguments[2]) ? arguments[2] : function(){};
        }

        inlineUseInfo = self._parse(fn);

        if(inlineUseInfo){
            modules = modules.concat.apply(modules,inlineUseInfo.requires);
            fn = inlineUseInfo.fn;
        }

        //ת��·����ͳһΪ����·��
        path = self._toPath(arguments[0]);
        for(i = 0,len = modules.length; i < len; i++){
            modules[i] = self._toPath(modules[i]);
            _proxy[modules[i]] = _proxy[modules[i]] ? _proxy[modules[i]] : [];
            _proxy[modules[i]].push(bind);
        }

        //��ȡ��Ҫ���ص�ģ��
        modulesInfo = self._getRequireModulesInfo(modules);
        len = modulesInfo.length;
        for(i = 0; i < len; i ++){
            _loading.push(modulesInfo[i]);
        }

        //�Ƿ��м��ص�ģ��
        hasLoadingModules = self._hasLoadingModules(modules);

        /*
         * ���lenΪ0��˵����
         * 1.��������ģ��ȫ������������cache��
         * 2.û����������ģ��,ֻ������ģ�鶨��
         * 3.ģ�����ڱ�����
         */
        if(!len){

            if(hasLoadingModules){
                _all.push(all);
                return;
            }

            var params = self._getModulesInstance(modules),
                obj = fn.apply(self,params);

            //��fn���صĶ��󱣴���_moduleCaches��
            _moduleCache[path] = obj;

            self._emitAll();

        }else{
            _all.push(all);

            //������Ҫ������Щģ��
            for(i = 0; i < len; i++){
                (function(module){
                    self._load(module,function(){
                        self._emitProxy(module);
                        self._emitAll();
                    })
                }(modulesInfo[i]));
            }
        }

        function bind() {
            count++;
        }

        function all(){
            var params,obj;

            //��֤����ģ���Ǽ�����ɵ�
            if(count < len)
                return false;

            params = self._getModulesInstance(modules);

            //��֤����ģ��ġ����������������
            if(params.length != modules.length)
                return false;

            self._clearProxy(modules);

            obj = fn.apply(self,params);

            _moduleCache[path] = obj;

            return true;
        }
    }

    /**
     * �ⲿ����ģ�黯
     * @param path
     */
    UME.use = function(path) {
        var self = this;

        if(self._is("String",path)){
            path = self._toPath(path);
	        self._load(path);
        }else{
            throw new Error("the param path is needed,please check your function caller param!");
        }
    }

    /**
     * ��ȡģ����Ϣ�����������ģ�����Ҫ���ص�ģ��
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
     * ����ģ���ʵ������
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
     * ѭ������_all����
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
         * û���ڼ��ص�ģ���ˣ�����ȫ��������ɣ�
         * ����_all����Ļص�û��ִ����
         * ��ô��Ҫ��ִ��һ���Ա�֤_all�ǿ������
         */
        if(!_loading.length && _all.length){
            self._emitAll();
        }
    }

    /**
     * ��ͬ��ģ��������������Ҫ+1
     * @param path
     * @private
     */
    UME._emitProxy = function(module){
        var self = this,item;

        item = _proxy[module];

        if(!item)
            return;

        for(var j = 0 ,length = item.length; j < length; j++){
            if(item[j]){
                item[j].apply(self);
                _proxy[module][j] = null;
            }
        }
    }

    /**
     * ����proxy������ֵΪnull��
     * @param modules
     * @private
     */
    UME._clearProxy = function(modules){
        var self = this,item;

        for(var i = 0,len = modules.length; i < len; i++){
            item = _proxy[modules[i]];
            for(var j = item.length - 1; j >= 0 ; j--){
                if(!item[j]){
                    item.splice(j,1);
                }
            }
        }
    }

    /**
     * ��ȡ���ڼ��ص�loadingģ�������
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
     * �Ƿ������ڼ��ص�ģ��
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
     * ��������ʹ�� self.use(path)
     * @param fn
     * @returns {{requires: Array, fn: Function}}
     * @private
     */
    UME._parse = function(fn){
        var self = this,
            fnStr = fn.toString(),
            reg = /(?:self|this).use\((["'])(.+?)\1\);?/g,
            requires = [],
            params = [];

        if(!reg.test(fnStr))
            return;

        //������У�����ע����˫��ע��
        fnStr = self._clearNotes(fnStr);

        //����ƥ�������ʹ�õ�useģ�飬���滻Ϊģ����
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

        //��ģ�������ȡ����
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
     * ���ע��
     * @param fnStr
     * @returns {*}
     * @private
     */
    UME._clearNotes = function(fnStr){
        var self = this;

        fnStr = fnStr.replace(/\/\/.*|\/\*.*?\*\//g,'');

        return fnStr;
    }


    /**
     * �¼��󶨺���
     * @param ele �󶨶���
     * @param eventName �¼���
     * @param fn �¼�����
     * @private
     */
    UME._on = function(ele, eventName, fn) {
        var self = this,
            event = eventName + fn.toString().replace(/\s+/g, '');

        ele[eventName+"event"] = ele[eventName] ? ele[eventName] : {};
        ele[eventName+"event"][event] = fn;

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
     * ����script
     * @param path �ļ�·��
     * @param fn �ص�����
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
					
					if(self._is("Function",fn))
                    	fn.apply(self)
                }
            })
        } else {

            self._on(script, "load", function() {
                index = self._getLoadingIndex(path);

                if(index != -1)
                    _loading.splice(index,1);
				
				if(self._is("Function",fn))
                	fn.apply(self);
            })
        }

        self._on(script,"error",function(){
            throw new Error("Fatal��loading module error !");
        })

        body.appendChild(script);

    }

    /**
     * ·��ת��
     * @private
     */
    UME._toPath = function(path) {
        var self = this,
            location = window.location,
            hostname = location.hostname,
            port = location.port,
            protocol = location.protocol,
            pathname = location.pathname,
            hash = location.hash ? location.hash : '',
            search = location.search ? location.search : '',
            url;

        url = hostname+":"+port + pathname.slice(0,pathname.lastIndexOf("/"));

        if(/^http/.test(path)){
            url = path;
        }else{
            url = protocol + "//" + self._covert(url,path) + search + hash
        }

        return url;
    }

    /**
     * ·��ת��helper����
     * @param url
     * @param relateUrl
     * @returns {*}
     * @private
     */
    UME._covert = function(url,relateUrl){
        var self = this,
            relateIndex,urlIndex,relate;

        relateIndex = relateUrl.indexOf("/");
        relate = relateUrl.slice(0,relateIndex);
        relateUrl = relateUrl.slice(relateIndex+1);
        urlIndex = url.lastIndexOf("/");

        if(urlIndex == -1){
            if(relateIndex == -1){
                return url + "/" + relateUrl;
            }else if(relate != "." || relate != ".."){
                url += "/" + relate;
            }

            return self._covert(url,relateUrl);

        }else if(relate == "." || relate == ""){
            return self._covert(url,relateUrl);

        }else if(relate == ".."){
            url = url.slice(0,urlIndex);
            return self._covert(url,relateUrl);

        }else if(relateUrl.indexOf("/") != -1){
            url +=  "/" + relate;
            return self._covert(url,relateUrl);

        }else{
            return url + "/" + relateUrl;

        }
    }

    /**
     * �ж��Ƿ���ĳ������
     * @param type ���ͣ�����:String
     * @param param �ԱȵĲ���
     * @returns {boolean}
     * @private
     */
    UME._is = function(type,param){
        return Object.prototype.toString.call(param) == "[object " + type + "]";
    }

    /**
     * ��ȡscript��ǩ�ϴ��е�data-main����
     * �����Զ�����
     */
    dataMain = document.getElementsByTagName("script")[0].getAttribute("data-main");

    if(dataMain){
        UME.use("./" + dataMain);
    }

    window.UME = UME;

}(window));
