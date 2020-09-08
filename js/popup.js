//------------------------------------------//
//定义需要执行的操作
//------------------------------------------//
var Events = {
    bg:chrome.extension.getBackgroundPage(),
    //初始化User-Agent
    initAgent:function(){
        var agentValues = this.bg.AgentObj.agentValues;
        var agentName = this.bg.AgentObj.agentName;
        var str = "";
        agentValues.agents.forEach(element => {
            str += "<option id='"+element.name+"' class='switchAgent' value='"+element.name+"'>"+element.name+"</option>";
        });
        $("#agent").append(str);
        $("#"+agentName).attr("selected","selected")
    },
    //清空页面显示内容
    clearHtml:function(){
        $("#allRule").html("");
        $("#proxy").html("");
    },
    //添加事件--此方法为一些刷新数据后失效的事件
    addDynamicEvent:function(){
        $("a").on("click",function(){
            var id = $(this).attr("id");
            var type = $(this).attr("class");
            if(type=="alter"){
                var url = $(this).parent().parent().find("input.url").val();
                var reUrl = $(this).parent().parent().find("input.reUrl").val();
                Events.bg.RuleObj.alterRule(id-1000,url,reUrl);
            }else if(type=="delete"){
                Events.bg.RuleObj.deleteRule(id);
            }
            Events.refresh();
        });
        $("#allRule :checkbox").on("click",function(){
            var id = $(this).parent().parent().find("a.delete").attr("id");
            var isEnable = this.checked;
            Events.bg.RuleObj.alterSwitch(id,isEnable);
        });
        $("#proxy").change(function(){
            var proxyName = $(this).val();
            var way = $("proxyWay").val();
            Events.bg.ProxyObj.switchByName(proxyName,way);
        });
        $("#proxy").dblclick(function(){
            var id = $("#proxy :selected").attr("index");
            Events.bg.ProxyObj.delete(id);
            Events.bg.ProxyObj.switch("");
            Events.refresh();
        });
    },
    //页面内刷新事件
    refresh:function(){
        this.clearHtml();
        var rules = this.bg.StorageObj.globalStorage.allRule;
        if(rules){
            for(var i = 0 ;i < rules.length;i++){
                var urlStr = "<td><input class='url' type='text' value='"+rules[i].url+"'></td>";
                var reUrlStr = "<td><input class='reUrl' type='text' value='"+rules[i].reUrl+"'></td>";
                var isEnableStr = "<td><input type='checkbox' "+rules[i].switch+"></td>"
                var alterStr = "<td><a href='javascript:void(0)' class='alter' id='"+(i+1000)+"'>改</a></td>";
                var deleteStr = "<td><a href='javascript:void(0)' class='delete' id='"+i+"'>删</a></td>";
                var htmlStr = "<tr>"+urlStr+reUrlStr+isEnableStr+alterStr+deleteStr+"</tr>";
                $("#allRule").append(htmlStr);
            }
        }
        var proxies = this.bg.StorageObj.globalStorage.proxies;
        var proxyUrl = this.bg.ProxyObj.proxyValue;
        if(proxies){
            for(var i = 0 ;i < proxies.length;i++){
                var str = "";
                if(proxies[i].proxyUrl == proxyUrl){
                    str += "<option id='"+proxies[i].name+"' index='"+i+"' class='switchProxy' value='"+proxies[i].name+"' selected='selected'>"+proxies[i].name+"</option>";
                }else{
                    str += "<option id='"+proxies[i].name+"' index='"+i+"' class='switchProxy' value='"+proxies[i].name+"'>"+proxies[i].name+"</option>";
                }
                $("#proxy").append(str);
            }
        }
        var proxyWay = this.bg.ProxyObj.proxyWay;
        $("#proxyWay").val(proxyWay);
        if(proxyWay == "global"){
            $("#proxyWay").attr("checked","checked");
        }
        this.addDynamicEvent();
    },
    //审核添加的url是否重复
    checkRepeat:function(){
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
}
//------------------------------------------//
//初始化
//------------------------------------------//
$(function(){
    Events.refresh();
    Events.initAgent();
    $("#add").click(function(){
        var url = $("#url").val();
        var reUrl = $("#reUrl").val();
        if(Events.checkRepeat(url)){
            Events.bg.RuleObj.addRule(url,reUrl);
            $("#url").val("");
            $("#reUrl").val("");
            Events.refresh();
        }else{
            alert("URL重复或输入为空值！");
        }
    });
    $("#refresh").click(function(){
        Events.refresh();
    });
    $("#clearRule").click(function(){
        Events.bg.RuleObj.clearRule();
        Events.refresh();
    });
    $("#clearProxy").click(function(){
        Events.bg.ProxyObj.clear();
        Events.refresh();
    });
    $("#agent").change(function(){
        var newAgent = $(this).val();
        Events.bg.AgentObj.set(newAgent);
    });
    $("#updateByLink").click(function(){
        var link = $("#link").val();
        Events.bg.LinkTool.updateByLink(link);
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
        var proxyName = $("#proxy").val();
        Events.bg.ProxyObj.switchByName(proxyName,way);
    });
});