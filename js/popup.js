//刷新函数，用于读取background页面中的变量，更新一个表格
function refresh(){
    clearTable();
    var bg = chrome.extension.getBackgroundPage();
    var globalStorage = bg.getStorage();
    console.log(globalStorage);
    rule = globalStorage.allRule;
    console.log(rule);
    if(rule){
        for(var i = 0 ;i < rule.length;i++){
            var str = "<tr><td><input class='url' type='text' value='"+rule[i].url+"'></td><td><input class='reUrl' type='text' value='"+rule[i].reUrl+"'></td><td><a href='javascript:void(0)' class='alter' id='"+(i+1000)+"'>修</a></td><td><a href='javascript:void(0)' class='delete' id='"+i+"'>删</a></td></tr>";
            $("table").append(str);
        }
        addDeleteEvent();
    }
}
//清空页面的表格
function clearTable(){
    $("#allreg").html("");
}
//检查添加的URL是否与现存的有重复
function checkRepeat(url){
    var flag = true;
    $(".url").each(function(){
        if($(this).val() == url){
            flag = false
        }
    });
    return flag;
}
//addEvent 添加a标签事件监听
function addDeleteEvent(){
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
}
// 初始化按钮的点击事件
$(function(){
    $("#add").click(function(){
        var bg = chrome.extension.getBackgroundPage();
        var url = $("#url").val();
        var reUrl = $("#reUrl").val();
        if(checkRepeat(url)){
            bg.addRule(url,reUrl);
            refresh();
        }else{
            alert("URL重复！");
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
});