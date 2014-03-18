/**
 * Created by mac on 14-3-15.
 */

/**
 * todo:
 * 0.useģ����Ҫcomplete
 * 1.ģ����ظ�����ȥ��
 * 2.����ʹ��use�������������
 */
;var UME = (function(w, u) {
    var window = w,
        undefined = u,
        UME = {};


    var _moduleCache = {},
        _loading = [],
        _all = [];

    /**
     * ����ģ�����
     */
    UME.define = function() {
        var self = this,
            argsLen = arguments.length,
            count = 0,
            fn,modules,modulesInfo,len,path,i;

        //˵��û�д���requires����
        if (argsLen <= 2) {
            modules = [];
            fn = self._isFunction(arguments[1]) ? arguments[1] : function(){};
        } else {
            modules = self._isArray(arguments[1]) ? arguments[1] : [];
            fn = self._isFunction(arguments[2]) ? arguments[2] : function(){};
        }

        //ת��·����ͳһΪ����·��
        path = self._toPath(arguments[0]);
        for(i = 0,len = modules.length; i < len; i++){
            modules[i] = self._toPath(modules[i]);
            _loading.push(modules[i]);
        }

        //��ȡ��Ҫ���ص�ģ��
        modulesInfo = self._getRequireModulesInfo(modules);
        len = modulesInfo.length;

        /*
         * ���lenΪ0��˵����
         * 1.��������ģ��ȫ������������cache��
         * 2.û����������ģ��,ֻ������ģ�鶨��
         */
        if(!len){
            //debugger;
            var params = self._getModulesInstance(modules),
                obj = fn.apply(self,params);

            //��fn���صĶ��󱣴���_moduleCaches��
            _moduleCache[path] = obj;

            self._emitAll();

        }else{
            _all.push(all);

            //������Ҫ������Щģ��
            for(i = 0; i < len; i++){
                self._load(modulesInfo[i],function(){
                    bind();
                    self._emitAll();
                })
            }
        }

        function bind() {
            count++;
        }

        function all(){
            var len = modules.length,
                params,obj;

            //��֤����ģ���Ǽ�����ɵ�
            if(count < len)
                return false;

            params = self._getModulesInstance(modules);

            //��֤����ģ��ġ����������������
            if(params.length != len)
                return false;

            obj = fn.apply(self,params);

            _moduleCache[path] = obj;

            return true;
        }
    }

    /**
     * �ⲿ����ģ�黯
     * @param path
     * @param callback
     */
    UME.use = function(path, callback) {

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
                isCached = module in _moduleCache  && self._getLoadingIndex(module) != -1;

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
            flag = _all[i].apply(self);

            if(flag){
                _all.splice(i,1);
            }
        }
    }

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
     * �¼��󶨺���
     * @param ele �󶨶���
     * @param eventName �¼���
     * @param fn �¼�����
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
     * �¼�ȡ������
     * @param ele ȡ������
     * @param eventName �¼���
     * @param fn �¼�����
     * @private
     */
    UME._off = function(ele, eventName, fn) {
        var self = this,
            event;

        //���С��3����ɾ�������¼�
        //�����ɾ����Ӧ���¼�
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
        index = self._getLoadingIndex(path);

        if (isIE) {
            self._on(script, "readystatechange", function() {
                if (script.readyState == "complete"){
                    if(index != -1)
                        _loading.splice(index,1);

                    fn();
                }
            })
        } else {
            self._on(script, "load", function() {
                if(index != -1)
                    _loading.splice(index,1);

                fn();
            })
        }

        body.appendChild(script);

    }

    /**
     * ·��ת��
     * @private
     */
    UME._toPath = function(path) {
        var self = this,
            location = window.location,
            origin = location.origin,
            pathname = location.pathname,
            reg = /^(\/[^\.]+\/)/i,
            url;

        if(reg.test(pathname)){
            url = origin + RegExp["$1"] + path;
        }else{
            url = origin + path;
        }

        return url
    }

    /**
     * �ж��Ƿ��Ǻ���
     * @param fn
     * @returns {boolean}
     * @private
     */
    UME._isFunction = function(fn){
        return Object.prototype.toString.call(fn) == "[object Function]";
    }

    /**
     * �ж��Ƿ�������
     * @param arr
     * @returns {boolean}
     * @private
     */
    UME._isArray = function(arr){
        return Object.prototype.toString.call(arr) == "[object Array]";
    }

    /**
     * �ж��Ƿ��Ƕ���
     * @param arr
     * @returns {boolean}
     * @private
     */
    UME._isObject = function(obj){
        return Object.prototype.toString.call(obj) == "[object Object]";
    }


    return UME;

}(window, undefined));
