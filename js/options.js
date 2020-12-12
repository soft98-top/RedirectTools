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
            if(type=="alter btn btn-info"){
                var url = $(this).parent().parent().parent().parent().find("input.url").val();
                var reUrl = $(this).parent().parent().parent().parent().find("input.reUrl").val();
                Events.bg.RuleObj.alterRule(id-1000,url,reUrl);
            }else if(type=="delete btn btn-info"){
                Events.bg.RuleObj.deleteRule(id);
            }
            Events.refresh();
        });
        $("#allRule :checkbox").on("click",function(){
            var id = $(this).parent().parent().parent().find("a.delete").attr("id");
            var isEnable = this.checked;
            Events.bg.RuleObj.alterSwitch(id,isEnable);
        });
    },
    //页面内刷新事件
    refresh:function(){
        this.clearHtml();
        var rules = this.bg.StorageObj.globalStorage.allRule;
        if(rules){
            for(var i = 0 ;i < rules.length;i++){
                var urlStr = "<td><input class='url form-control' type='text' value='"+rules[i].url+"'></td>";
                var reUrlStr = "<td><input class='reUrl form-control' type='text' value='"+rules[i].reUrl+"'></td>";
                var isEnableStr = "<td width=150px><div class='input-group md-3 input-group-md'><div class='input-group-prepend'><div class='input-group-text'><input type='checkbox' "+rules[i].switch+"></div></div>"
                var alterStr = "<div class=‘btn-group’><a href='javascript:void(0)' class='alter btn btn-info' id='"+(i+1000)+"'>改</a>";
                var deleteStr = "<a href='javascript:void(0)' class='delete btn btn-info' id='"+i+"'>删</a></div></div></td>";
                var htmlStr = "<tr>"+urlStr+reUrlStr+isEnableStr+alterStr+deleteStr+"</tr>";
                $("#allRule").append(htmlStr);
            }
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
    $("#agent").change(function(){
        var newAgent = $(this).val();
        Events.bg.AgentObj.set(newAgent);
    });
    $("#updateByLink").click(function(){
        var link = $("#link").val();
        Events.bg.LinkTool.updateByLink(link);
        $("#link").val("");
    })
});