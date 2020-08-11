//初始化全局存储变量
var globalStorage = "";
var agentStorage = { "agents":
    [
        {name:"默认",agent:""},
        {name:"chrome",agent:"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"},
        {name:"Firefox",agent:"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0"},
        {name:"IPhone",agent:"Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5"},
        {name:"Android",agent:"Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_Wildfire_A3333 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"},
    ]
}
var currentAgent = "默认";
var globalAgent = "";
var globalProxy = "";
//updateAgent 更新Agent函数，有传参就设置为新的头，没有就获取storage中存储的值
function updateAgent(newAgent){
    if(newAgent){
        chrome.storage.sync.set({"currentAgent":newAgent},function(){
            currentAgent = newAgent;
            agentStorage.agents.forEach(function(item){
                if(item.name == currentAgent){
                    globalAgent = item.agent;
                }
            });
        });
    }else{
        chrome.storage.sync.get({"currentAgent":"默认"},function(items){
            currentAgent = items.currentAgent;
        });
        agentStorage.agents.forEach(function(item){
            if(item.name == currentAgent){
                globalAgent = item.agent;
            }
        });
    }
}
//updateStorage 更新函数，无传参就是更新JS中的全局变量，有传参就是将变量同步到本地存储
function updateStorage(newStorage){
    if(newStorage){
        chrome.storage.sync.set(newStorage,function(){
            updateStorage();
        });
    }else{
        chrome.storage.sync.get({allRule:""},function(items){
            console.log(JSON.stringify(items.allRule));
            globalStorage = items;
            console.log("get"+JSON.stringify(globalStorage));
        });
        if(globalStorage.allRule == "[Object Object]"){
            var arr = [];
            globalStorage = {"allRule":arr};
            updateStorage(globalStorage);
        }
    }
}
//getStorage 获取JS的全局存储变量，目前主要用于popup获取background页面的存储变量
function getStorage(){
    return globalStorage;
}
//addRule 添加规则
function addRule(url,reUrl){
    var json = {"url":url,"reUrl":reUrl,"switch":"checked"};
    console.log(json);
    if(globalStorage.allRule != ""){
        globalStorage.allRule.push(json);
    }else{
        globalStorage.allRule = [json];
    }
    updateStorage(globalStorage);
    console.log(JSON.stringify(globalStorage));
}
//deletRule 删除规则，如果不传参就是清空，传参就是删除指定的规则
function deleteRule(id){
    if(id != undefined){
        globalStorage.allRule.splice(id,1);
        updateStorage(globalStorage);
    }else{
        globalStorage = {"allRule":[]};
        updateStorage(globalStorage);
    }
}
// alterRule 修改规则，id用来定位数组中的位置，然后进行替换修改
function alterRule(id,url,reUrl){
    globalStorage.allRule[id].url = url;
    globalStorage.allRule[id].reUrl = reUrl;
    updateStorage(globalStorage);
}
// alterSwitch 规则开关，id用来定位数组中的位置，isEnable是是否开启，如果开启，则将开关设置为checked，否则为unchecked
function alterSwitch(id,isEnable){
    var switchStr = "unchecked";
    if(isEnable == true){
        switchStr = "checked";
    }
    globalStorage.allRule[id].switch = switchStr;
}
// 设置或取消代理
function switchProxy(proxyUrl){
    if(proxyUrl){
        var config = {
            mode:"pac_script",
            pacScript:{
                data:"function FindProxyForURL(url,host){\n"
                    +"return '" + proxyUrl + "';\n"
                    +"}"
            }
        };
        chrome.proxy.settings.set({value:config,scope:"regular"},function(){});
    }else{
        chrome.proxy.settings.clear({scope:"regular"},function(){});
    }
}
// 存储代理信息
function updateProxy(proxyUrl){
    if(proxyUrl){
        chrome.storage.sync.set({"proxyUrl":proxyUrl},function(){
            globalProxy = proxyUrl;
        });
    }else{
        chrome.storage.sync.get({"proxyUrl":""},function(item){
            globalProxy = item.proxyUrl;
        });
    }
}
// 通过连接更新SRC规则
function updateByLink(targetUrl){
    $.ajax({
        type:"get",
        url:targetUrl,
        dataType:"json",
        success:function(res){
            var allRule = res.allRule;
            console.log(allRule);
            for(i=0;i<allRule.length;i++){
                globalStorage.allRule.push(allRule[i]);
            }
            updateStorage(globalStorage);
        }
    });
}
// 用来初始化更新全局存储变量
updateStorage();
updateAgent();
updateProxy();
//监听网页请求，读取本地存储信息，判断请求网页与添加的规则是否相匹配，相符就重定向为指定网址
chrome.webRequest.onBeforeRequest.addListener(details => {
    var Rules = globalStorage;
    if(Rules.allRule.length!=0){
        var rule = Rules.allRule;
        for(var i = 0;i<rule.length;i++){
            if(rule[i].switch == "checked"){
                if(details.url == rule[i].url){
                    console.log(details.url);
                    var reData = rule[i].reUrl;
                    if(reData.startsWith("json:")||reData.startsWith("json：")){
                        reData = reData.replace("json:","");
                        reData = reData.replace("json：","");
                        return {redirectUrl: "data:application/json;charset=UTF-8;base64," + Base64.encode(reData)};
                    }
                    if(reData.startsWith("http:")||reData.startsWith("https:")){
                        return {redirectUrl:rule[i].reUrl};
                    }
                    console.log(reData);
                }
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["blocking"]);

//监听网页请求的header信息，如果本地存储变量为空则执行浏览器默认的Agent，如果不为空，则替换为存储的内容
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    if(globalAgent != ""){
        var length = details.requestHeaders.length;
        for(var j=0;j<length;j++){
            if(details.requestHeaders[j].name == "User-Agent"){
                details.requestHeaders[j].value = globalAgent;
                return {requestHeaders:details.requestHeaders};
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["blocking","requestHeaders"]);

//添加右键菜单将当前页添加到规则，在弹出框中输入重定向后的网址
chrome.contextMenus.create({
    "type":"normal",
    "title":"将当前页添加到规则",
    "contexts":["page"],
    "onclick":function(params){
        var url = params.pageUrl;
        var reUrl = prompt("请输入重定向后的网址：");
        if(reUrl != null){
            addRule(url,reUrl);
        }
    }
});

chrome.contextMenus.create({
    "type":"normal",
    "title":"设置代理",
    "contexts":["page"],
    "onclick":function(){
        var proxyUrl = prompt("请输入要设置的代理：",globalProxy);
        if(proxyUrl != null){
            switchProxy(proxyUrl);
            updateProxy(proxyUrl);
        }
    }
});
chrome.contextMenus.create({
    "type":"normal",
    "title":"取消代理",
    "contexts":["page"],
    "onclick":function(){
        switchProxy();
    }
});
