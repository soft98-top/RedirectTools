//refresh 刷新函数，用于读取background页面中的变量，更新一个表格
function refresh(){
    clearTable();
    var bg = chrome.extension.getBackgroundPage();
    var globalStorage = bg.getStorage();
    console.log(globalStorage);
    rule = globalStorage.allRule;
    console.log(rule);
    proxies = globalStorage.proxies;
    if(rule){
        for(var i = 0 ;i < rule.length;i++){
            var urlStr = "<td><input class='url' type='text' value='"+rule[i].url+"'></td>";
            var reUrlStr = "<td><input class='reUrl' type='text' value='"+rule[i].reUrl+"'></td>";
            var isEnableStr = "<td><input type='checkbox' "+rule[i].switch+"></td>"
            var alterStr = "<td><a href='javascript:void(0)' class='alter' id='"+(i+1000)+"'>改</a></td>";
            var deleteStr = "<td><a href='javascript:void(0)' class='delete' id='"+i+"'>删</a></td>";
            var htmlStr = "<tr>"+urlStr+reUrlStr+isEnableStr+alterStr+deleteStr+"</tr>";
            $("#allRule").append(htmlStr);
        }
        addDynamicEvent();
    }
    var proxyUrl = bg.globalProxy;
    if(proxies){
        for(var i = 0 ;i < proxies.length;i++){
            var str = "";
            if(proxies[i].proxyUrl == proxyUrl){
                str += "<option id='"+proxies[i].name+"' class='switchProxy' value='"+proxies[i].name+"' selected='selected'>"+proxies[i].name+"</option>";
            }else{
                str += "<option id='"+proxies[i].name+"' class='switchProxy' value='"+proxies[i].name+"'>"+proxies[i].name+"</option>";
            }
            $("#proxy").append(str);
        }
    }
    var proxyWay = bg.proxyWay;
    $("#proxyWay").val(proxyWay);
    if(proxyWay == "global"){
        $("#proxyWay").attr("checked","checked");
    }
}
//clearTable 清空页面的表格
function clearTable(){
    $("#allRule").html("");
    $("#proxy").html("");
}
//initAgent 初始化同步Agent
function initAgent(){
    var bg = chrome.extension.getBackgroundPage();
    var agentStorage = bg.agentStorage;
    var currentAgent = bg.currentAgent;
    var str = "";
    agentStorage.agents.forEach(element => {
        str += "<option id='"+element.name+"' class='switchAgent' value='"+element.name+"'>"+element.name+"</option>";
    });
    $("#agent").append(str);
    $("#"+currentAgent).attr("selected","selected")

}
//checkRepeat 检查添加的URL是否与现存的有重复
function checkRepeat(url){
    var flag = true;
    if(url==null || url==""){
        flag = false;
    }
    $(".url").each(function(){
        if($(this).val() == url){
            flag = false
        }
    });
    return flag;
}
//addDynamicEvent 添加动态事件（当规则表格发生变化时，需要重新设置事件）
// 目前有修改、删除、规则开关事件
function addDynamicEvent(){
    $("a").on("click",function(){
        var id = $(this).attr("id");
        var type = $(this).attr("class");
        console.log(id);
        var bg = chrome.extension.getBackgroundPage();
        if(type=="alter"){
            var url = $(this).parent().parent().find("input.url").val();
            var reUrl = $(this).parent().parent().find("input.reUrl").val();
            console.log(url+reUrl)
            bg.alterRule(id-1000,url,reUrl);
        }else if(type=="delete"){
            bg.deleteRule(id);
        }
        refresh();
    });
    $("#allRule :checkbox").on("click",function(){
        var id = $(this).parent().parent().find("a.delete").attr("id");
        var isEnable = this.checked;
        console.log(id+" "+isEnable);
        var bg = chrome.extension.getBackgroundPage();
        bg.alterSwitch(id,isEnable);
    });
    $("#proxy").change(function(){
        var bg = chrome.extension.getBackgroundPage();
        var proxyName = $(this).val();
        var way = $("proxyWay").val();
        console.log(proxyName);
        bg.popupSwitchProxy(proxyName,way);
    });
}
// 初始化按钮的点击事件
$(function(){
    $("#add").click(function(){
        var bg = chrome.extension.getBackgroundPage();
        var url = $("#url").val();
        var reUrl = $("#reUrl").val();
        if(checkRepeat(url)){
            bg.addRule(url,reUrl);
            $("#url").val("");
            $("#reUrl").val("");
            refresh();
        }else{
            alert("URL重复或输入为空值！");
        }
    });
    $("#refresh").click(function(){
        refresh();
    });
    $("#clear").click(function(){
        var bg = chrome.extension.getBackgroundPage();
        bg.deleteRule();
        refresh();
    })
    refresh();
    initAgent();
    $("#agent").change(function(){
        var bg = chrome.extension.getBackgroundPage();
        var newAgent = $(this).val();
        console.log(newAgent);
        bg.updateAgent(newAgent);
    });
    $("#updateByLink").click(function(){
        var bg = chrome.extension.getBackgroundPage();
        var link = $("#link").val();
        bg.updateByLink(link);
        $("#link").val("");
    })
    $("#proxyWay").on("click",function(){
        var way = $(this).val();
        if(way == "pac"){
            way = "global";
        }else{
            way = "pac";
        }
        $(this).val(way);
        var bg = chrome.extension.getBackgroundPage();
        var proxyName = $("#proxy").val();
        bg.popupSwitchProxy(proxyName,way);
    });
});