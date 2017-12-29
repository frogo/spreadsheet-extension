import React,{Component} from 'react';
import Select2 from 'react-select2-wrapper';
let compIndex = 0;//动态组件的索引id

//----------------------------------------------------
//单元格绑定跳转看板信息操作 父组件 ES5
//----------------------------------------------------
const BindDashboardBox = React.createClass({
    getInitialState: function () {
        compIndex = 0
        //console.log(this.props.dashboardData);
        var result ={"arr":[],"dashboardList":this.props.dashboardList,"groupList":this.props.groupList};

        var dashboardData = this.props.dashboardData;
        if(this.props.dashboardData && this.props.dashboardData.length >0){

            $.each(dashboardData,function(i,e){
                var  obj = {"key":"dItem_"+compIndex,"dashboard_id":e.dashboard_id,"group_id":e.group_id,"where":e.where,"alias":e.alias}
                result.arr.push(obj)
                compIndex++;
            })

        } else if(this.props.dashboardData && this.props.dashboardData.length == 0) {
            console.log('No dashboardData!')
            //result.arr = [{"key":"dItem_default","dashboard_id":"", "group_id":[] , "where": "", "alias": ""}]
        }


        return result;
    },


    clickHandler: function (evt) {
        if ($(evt.currentTarget).prop('disabled')) {
            return false;
        }
        var tempArr = this.state.arr,
            length =  this.state.arr.length;

        tempArr.push({"key":"dItem_"+compIndex,"dashboard_id": "", "group_id": "", "where": "", "alias": ""});
        compIndex++;
        this.setState({arr:tempArr});
    },
    deleteEventHandler: function (dkey) {

        console.log(dkey)


        //删除数据源中子组件key对应的数据，重新渲染dom
        const tempArr = this.state.arr;
        const len = tempArr.length;
//                      if (len === 1) {
//                        return false;
//                       }

        //删除一条数据，并重新计算上下文
        for (let i = 0; i < len; i++) {
            if (dkey === tempArr[i]["key"]) {

                tempArr.splice(i, 1);
                break;
            }
        }
        this.setState({arr:tempArr});
    },
    changeCallback: function (key,name,data) {

        var flag = false;
        var tempArr = this.state.arr;

        for(var i =0; i<tempArr.length;i++){
            if(tempArr[i]['key'] === key){
                tempArr[i][name] = data
                flag = true;
                break;
            }
        }
        if(flag){
            this.setState({arr:tempArr});
        }

    },


    render: function () {
        //console.log('LIST:')
        //console.log(this.state.arr)

        let flag = false;//是否禁用添加按钮

        var _this = this;
        var list = this.state.arr.map(function(item,index){
            return <BindDashboardItem key={item.key} data={item} dashboardList={_this.state.dashboardList} groupList={_this.state.groupList} deleteCallback={_this.deleteEventHandler} changeCallback={_this.changeCallback}/>
        })
        //最多添加10个子组件
        if (this.state.arr && this.state.arr.length > 9) {
            flag = true;
        }

        return (
            <div className="dashboardReactBox">
                {list}
                <button type="button" onClick={this.clickHandler} className="btn btn-default btn-sm" disabled={flag}><span className="fa fa-plus"></span><span> 添加看板</span></button>
            </div>
        );
    }
});

//----------------------------------------------------
//单元格绑定跳转看板信息操作 子组件 ES5
//----------------------------------------------------
const BindDashboardItem =  React.createClass({
    /*       getInitialState: function () {
           var dashboardList = this.props.data.dashboardList,
               groupList = this.props.data.groupList,
               dashboardDefaultValue = this.props.data.dashboard_id,
               groupDefaultValue = this.props.data.group_id,
               where = this.props.data.where,
               alias = this.props.data.alias,
               key = this.props.data.key

            return {
                "dashboard":dashboardList ,//保存dashboard json对象数组
                "group": groupList,
    //            [{ text: 'bug', id: 1 },
    //                 { text: 'feature', id: 2 },
    //                 { text: 'documents', id: 3 },
    //                 { text: 'discussion', id: 4 }],
                "dashboardDefaultValue":dashboardDefaultValue,
                "groupDefaultValue":groupDefaultValue,
                "where":where,
                "alias":alias,
                "key":key

             };
         },
        componentDidUpdate: function () {

        },*/
    clickHandler: function(evt){
        this.props.deleteCallback($(evt.currentTarget).data('key'));
    },

    changeCk:function(e){
        //console.log($(e.target).parents('.dashboardItem').attr('data-key'))
        //console.log('group_id has changed')
        var dataName = $(e.target).attr('data-name')
        var dataKey = $(e.target).parents('.dashboardItem').attr('data-key')
        var data;
        if(dataName == 'dashboard_id'){
            data = $(e.target).select2('data').id
        }else if(dataName == 'group_id'){
            data = $(e.target).select2('val')
        } else if(dataName == 'where'){
            data = $(e.target).val()
        }

        this.props.changeCallback(dataKey,dataName,data)
    },
    render: function(){
        var dashboardList = this.props.dashboardList,
            dashboardDefaultValue = this.props.data.dashboard_id,

            key = this.props.data.key
        ;

        return (
            <div className="dashboardItem" data-key={key} ref="dashboardItem">
                <Select2 data-name ="dashboard_id" className="dashboardMultiSel"  options={{placeholder: 'choose dashboard'}} data={dashboardList}   value={dashboardDefaultValue}/>

                <div className="delete"  onClick={this.clickHandler} data-key={key}>
                    <span className="delete-icon fa fa-minus"></span>
                </div>
            </div>
        )
        // }

    }
});
//var DashboardSelectPanel =  React.createClass({
//    render: function(){
//    var _this =this;
//    var list = function(){
//            var arr = _this.props.data,
//               newArr = [];
//            for(var i = 0; i < arr.length; i++){
//            var href='/dashboardmodelview/dashboardexbition/id/'+ arr[i].dashboard_id;
//
//                newArr.push(<li key = {arr[i].dashboard_id}> <a href={href} data-id={arr[i].dashboard_id} data-where={arr[i].where} data-group={arr[i].group_id} className="dashboard-bind">{arr[i].dashboard_txt}</a> </li>)
//            }
//            return newArr;
//    }
//
//            return (
//                <ul>{list()}</ul>
//            )
//
//    }
//});


//----------------------------------------------------
//看板展示 电子表格单元格 看板跳转选择面板组件 ES6
//----------------------------------------------------
class DashboardSelectPanel extends Component{
    constructor(props){
        super(props);
//        this.state = { // define this.state in constructor
//            isEditing: false
//        }
    }
    render(){

        var _this =this;
        var dashboardedit_mode = this.props.dashboardedit_mode;
        var urlPrefix = '/dashboardmodelview/dashboardexbition/id/';
        if(this.props.dashboardedit_mode)
        {
            urlPrefix = '/dashboardmodelview/dashboardedit/id/'
        }
        var list = function(){
            var arr = _this.props.data,
                newArr = [];

            for(var i = 0; i < arr.length; i++){

                var groupBy = {}
                if(arr[i].group && arr[i].group != '' ){
                    groupBy = arr[i].group
                }

                var href= urlPrefix + arr[i].dashboard_id + '/parameter/?where={}&groupBy='+ JSON.stringify(groupBy) +'&whereSentence='+arr[i].where;
                //var href='/dashboardmodelview/dashboardexbition/id/'+ arr[i].dashboard_id
                newArr.push(<li key = {arr[i].dashboard_id}> <a href={href} data-id={arr[i].dashboard_id} data-where={arr[i].where} data-group={arr[i].group} className="dashboard-bind">{arr[i].dashboard_txt}</a> </li>)
            }
            return newArr;
        }

        return (
            <ul>{list()}</ul>
        )
    }
}

export default BindDashboardBox


