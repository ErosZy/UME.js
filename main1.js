/**
 * Created by mac on 14-3-18.
 */

UME.define("./main1.js",["./module2.js","./module1.js","./module3.js"],function(module2,module1,module3){
    alert(module1.name+" "+module2.name+" "+module3.name);
})