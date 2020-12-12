//------------------------------------------//
//定义需要执行的操作
//------------------------------------------//
var Events = {
    bg:chrome.extension.getBackgroundPage(),
    //初始化User-Agent
    init:function(){
        var agentValues = this.bg.AgentObj.agentValues;
        var agentName = this.bg.AgentObj.agentName;
        var str = "";
        agentValues.agents.forEach(element => {
            str += '<option value="'+element.name+'" id="'+element.name+'">'+element.name+'</option>';
        });
        $("#ualist").append(str);
        $("#"+agentName).attr("selected","selected")
        var rules = this.bg.StorageObj.globalStorage.allRule;
        if(rules){
            for(var i = 0 ;i < rules.length;i++){
                var prefix = '<div class="input-group md-3 input-group-md">';
                var urlStr = '<input type="text" class="form-control url" value="'+rules[i].url+'">';
                var checkbox = '<div class="input-group-append"><div class="input-group-text"><input type="checkbox" '+rules[i].switch+' id="'+i+'"></div></div></div>';
                var htmlStr = prefix+urlStr+checkbox;
                $("#allRule").append(htmlStr);
            }
        }
    },
}
//------------------------------------------//
//初始化
//------------------------------------------//
$(function(){
    Events.init();
    $("#allRule :checkbox").on("click",function(){
        var id = $(this).attr("id");
        var isEnable = this.checked;
        Events.bg.RuleObj.alterSwitch(id,isEnable);
    });
    $("#ualist").change(function(){
        var newAgent = $(this).val();
        Events.bg.AgentObj.set(newAgent);
    });
});