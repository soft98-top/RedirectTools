//------------------------------------------//
//定义StorageObj类
//------------------------------------------//
var StorageObj = {
    globalStorage:"",
    //浏览器存储数据
    set:function(newStorage){
        if(newStorage){
            chrome.storage.sync.set(newStorage,function(){
                RuleObj.updateRuleDataIndex(newStorage);
            });
        }
    },
    //从浏览器获取存取的数据
    get:function(){
        chrome.storage.sync.get({allRule:[],agentName:"默认"},function(items){
            StorageObj.globalStorage = items;
            RuleObj.updateRuleDataIndex(items);
            AgentObj.get();
        });
    }
}
//------------------------------------------//
//定义RuleObj类
//------------------------------------------//
var RuleObj = {
    ruleData:[],
    //添加规则
    addRule:function(url,reUrl){
        var ruleJson = {"url":url,"reUrl":reUrl,"switch":"checked"};
        if(StorageObj.globalStorage.allRule != ""){
            StorageObj.globalStorageallRule.push(ruleJson);
        }else{
            StorageObj.globalStorage.allRule = [ruleJson];
        }
        StorageObj.set(StorageObj.globalStorage);
    },
    //删除规则
    deleteRule:function(id){
        if(id != undefined){
            StorageObj.globalStorage.allRule.splice(id,1);
            StorageObj.set(StorageObj.globalStorage);
        }
    },
    //清空规则
    clearRule:function(){
        StorageObj.globalStorage.allRule = [];
        StorageObj.set(StorageObj.globalStorage);
    },
    //修改规则
    alterRule:function(id,url,reUrl){
        StorageObj.globalStorage.allRule[id].url = url;
        StorageObj.globalStorage.allRule[id].reUrl = reUrl;
        StorageObj.set(StorageObj.globalStorage);
    },
    //开启｜关闭规则
    alterSwitch:function(id,status){
        StorageObj.globalStorage.allRule[id].switch = status?"checked":"unchecked";
        StorageObj.set(StorageObj.globalStorage);
    },
    //根据规则，判断是否需要加载数据
    updateRuleDataIndex:function(items){
        if(this.ruleData.length>0){
            this.ruleData = [];
        }
        if(items.allRule != null){
            var rule = items.allRule;
            for(var i=0;i<rule.length;i++){
                if(rule[i].reUrl.startsWith("js:")||rule[i].reUrl.startsWith("js：")||rule[i].reUrl.startsWith("jsonf:")||rule[i].reUrl.startsWith("jsonf：")){
                    ruleUrl = rule[i].reUrl.replace("js:","");
                    ruleUrl = ruleUrl.replace("js：","");
                    ruleUrl = ruleUrl.replace("jsonf:","");
                    ruleUrl = ruleUrl.replace("jsonf：","");
                    this.ruleData.push("");
                    RuleObj.ajaxRequest(i,ruleUrl);
                }else if(rule[i].reUrl.startsWith("json:")||rule[i].reUrl.startsWith("json：")){
                    jsonData = rule[i].reUrl.replace("json:","");
                    jsonData = jsonData.replace("json：","");
                    RuleObj.updateRuleData(i,jsonData);
                }else{
                    this.ruleData.push("");
                }
            }
        }
    },
    //请求目标规则网址，获取返回的数据
    ajaxRequest:function(index,targetUrl){
        $.ajax({
            type:"GET",
            url:targetUrl,
            success:function(res){
                RuleObj.updateRuleData(index,res);
            },
            error:function(res){
                console.log(res);
            }
        });
    },
    //将请求返回的数据保存到指定索引
    updateRuleData:function(index,data){
        this.ruleData[index] = data;
    }
}
//------------------------------------------//
//定义LinkTool类
//------------------------------------------//
var LinkTool = {
    //通过json格式的数据更新规则
    updateByJson:function(data){
        var allRule = data.allRule;
        if(allRule){
            for(i=0;i<allRule.length;i++){
            StorageObj.globalStorage.allRule.push(allRule[i]);
            }
        }
        StorageObj.set(StorageObj.globalStorage);
    },
    //通过网址更新规则
    updateByLink:function(dataUrl){
        if(dataUrl.startsWith("json:")||dataUrl.startsWith("json：")){
            dataUrl = dataUrl.replace("json:","");
            dataUrl = dataUrl.replace("json：","");
            json = JSON.parse(dataUrl);
            LinkTool.updateByJson(json);
        }else{
            $.ajax({
                type:"get",
                url:dataUrl,
                dataType:"json",
                success:function(res){
                    LinkTool.updateByJson(res);
                }
            });
        }
    }
}
//------------------------------------------//
//定义AgentObj类
//------------------------------------------//
var AgentObj = {
    agentName:"默认",
    agentValue:"",
    agentValues:{ "agents":
        [
            {name:"默认",agent:""},
            {name:"chrome",agent:"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"},
            {name:"Firefox",agent:"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0"},
            {name:"IPhone",agent:"Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5"},
            {name:"Android",agent:"Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_Wildfire_A3333 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"},
        ]
    },
    //设置User-Agent
    set:function(newAgent){
        if(newAgent){
            this.agentName = newAgent;
            StorageObj.globalStorage.agentName = newAgent;
            StorageObj.set(StorageObj.globalStorage);
            this.agentValues.agents.forEach(function(item){
                if(item.name == AgentObj.agentName){
                    AgentObj.agentValue = item.agent;
                }
            });
        }
    },
    //获取存储信息
    get:function(){
        this.agentName = StorageObj.globalStorage.agentName;
        this.agentValues.agents.forEach(function(item){
            if(item.name == AgentObj.agentName){
                AgentObj.agentValue = item.agent;
            }
        });
    }
}
//------------------------------------------//
//定义ProxyObj类
//------------------------------------------//
var ProxyObj = {
    pacValue:"",
    proxyValue:"",
    proxyWay:"",
    //存储当前的代理
    store:function(proxyUrl,way){
        StorageObj.globalStorage.proxyValue = proxyUrl?proxyUrl:"";
        StorageObj.globalStorage.proxyWay = way?way:"pac";
        this.proxyValue = StorageObj.globalStorage.proxyValue;
        this.proxyWay = StorageObj.globalStorage.proxyWay;
        StorageObj.set(StorageObj.globalStorage);
    },
    //获取存储中的数据
    get:function(){
        this.proxyValue = StorageObj.globalStorage.proxyValue;
        this.proxyWay = StorageObj.globalStorage.proxyWay;
        this.getGfwList2Pac();
    },
    clear:function(){
        this.switch();
        StorageObj.globalStorage.proxies = [];
        StorageObj.set(StorageObj.globalStorage);
    },
    //切换代理
    switch:function(proxyUrl,way){
        if(proxyUrl&&proxyUrl!="noproxy"&&proxyUrl!=""){
            way = way?way:"pac";
            var config = {};
            if(way=="pac"){
                var tempProxy = this.pacValue.match(/var proxy = \'(.*)\'\;/)[1];
                this.pacValue = this.pacValue.replace(tempProxy,proxyUrl);
                config = {
                    mode:"pac_script",
                    pacScript:{
                        data:this.pacValue
                    }
                };
            }else if(way=="global"){
                config = {
                    mode:"pac_script",
                    pacScript:{
                        data:"function FindProxyForURL(url,host){\n"
                            +"return '" + proxyUrl + "';\n"
                            +"}"
                    }
                };
            }
            chrome.proxy.settings.set({value:config,scope:"regular"},function(){});
            this.store(proxyUrl,way);
        }else{
            chrome.proxy.settings.clear({scope:"regular"},function(){});
            this.store(proxyUrl);
        }
    },
    //通过代理名称切换代理
    switchByName:function(proxyName,way){
        var proxies = StorageObj.globalStorage.proxies;
        for(var i=0;i<proxies.length;i++){
            if(proxies[i].name == proxyName){
                this.switch(proxies[i].proxyUrl,way);
            }
        }
    },
    //获取GfwList
    getGfwList2Pac:function(){
        var gfwUrl = "https://raw.githubusercontent.com/petronny/gfwlist2pac/master/gfwlist.pac";
        $.ajax({
            type:"GET",
            url:gfwUrl,
            dataType:"",
            success:function(res){
                ProxyObj.pacValue = res;
                ProxyObj.switch(ProxyObj.proxyValue,ProxyObj.proxyWay)
            }
        });
    },
    delete:function(id){
        if(id != undefined){
            StorageObj.globalStorage.proxies.splice(id,1);
            StorageObj.set(StorageObj.globalStorage);
        }
    },
}
//------------------------------------------//
//初始化
//------------------------------------------//
StorageObj.get();

//------------------------------------------//
//监听网页请求，读取本地存储信息
//判断请求网页与添加的规则是否相匹配
//相符就重定向为指定网址
//------------------------------------------//
chrome.webRequest.onBeforeRequest.addListener(details => {
    var Rules = StorageObj.globalStorage;
    if(Rules.allRule.length!=0){
        var rule = Rules.allRule;
        for(var i = 0;i<rule.length;i++){
            if(rule[i].switch == "checked"){
                try {
                    var reg = new RegExp(rule[i].url);
                } catch (error) {
                    reg = false;
                }
                if(details.url.startsWith(rule[i].url)||reg&&reg.test(details.url)){
                    var reData = rule[i].reUrl;
                    if(reData.startsWith("json:")||reData.startsWith("json：")){
                        return {redirectUrl: "data:application/json;charset=UTF-8;base64," + Base64.encode(RuleObj.ruleData[i])};
                    }
                    if(reData.startsWith("jsonf:")||reData.startsWith("jsonf：")){
                        return {redirectUrl:"data:application/json;charset=UTF-8;base64," + Base64.encode(RuleObj.ruleData[i])}
                    }
                    if(reData.startsWith("js:")||reData.startsWith("js：")){
                        return {redirectUrl:"data:application/javascript;charset=UTF-8;base64," + Base64.encode(RuleObj.ruleData[i])};
                    }
                    if(reData.startsWith("http:")||reData.startsWith("https:")){
                        return {redirectUrl:rule[i].reUrl};
                    }
                }
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["blocking"]);

//------------------------------------------//
//监听网页请求的header信息
//如果本地存储变量为空则执行浏览器默认的Agent
//如果不为空，则替换为存储的内容
//------------------------------------------//
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    if(AgentObj.agentValue != ""){
        var length = details.requestHeaders.length;
        for(var j=0;j<length;j++){
            if(details.requestHeaders[j].name == "User-Agent"){
                details.requestHeaders[j].value = AgentObj.agentValue;
                return {requestHeaders:details.requestHeaders};
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["blocking","requestHeaders"]);

//------------------------------------------//
//添加右键菜单将当前页添加到规则
//在弹出框中输入重定向后的网址
//------------------------------------------//
chrome.contextMenus.create({
    "type":"normal",
    "title":"将当前页添加到规则",
    "contexts":["page"],
    "onclick":function(params){
        var url = params.pageUrl;
        var reUrl = prompt("请输入重定向后的网址：");
        if(reUrl != null){
            RuleObj.addRule(url,reUrl);
        }
    }
});