var globalStorage = "";

//更新函数，无传参就是更新JS中的变量，有传参就是将变量同步到本地存储
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
//获取JS的本地存储变量
function getStorage(){
    return globalStorage;
}
//addRule 添加规则
function addRule(url,reUrl){
    var json = {"url":url,"reUrl":reUrl};
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
function test_storage(){
    chrome.storage.sync.get({allrule:""},function(items){
        local_storage = items;
    });
}

updateStorage();
//监听网页请求，读取本地存储信息，判断请求网页与添加的规则是否相匹配，相符就重定向为指定位网址
chrome.webRequest.onBeforeRequest.addListener(details => {
    var Rules = globalStorage;
    if(Rules.allRule.length!=0){
        var rule = Rules.allRule;
        for(var i = 0;i<rule.length;i++){
            if(details.url == rule[i].url){
                console.log(details.url);
                return {redirectUrl:rule[i].reUrl};
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["blocking"]);