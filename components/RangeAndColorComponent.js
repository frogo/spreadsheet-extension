/*import React from 'react';*/
/*require('@claviska/jquery-minicolors');
require('../node_modules/@claviska/jquery-minicolors/jquery.minicolors.css');*/

//All of the above methods can be use

import React,{Component} from 'react';
import '@claviska/jquery-minicolors';
import '../node_modules/@claviska/jquery-minicolors/jquery.minicolors.css'


let minRange = 0, maxRange = 100;//默认最大值和最小值
let defaultColor = '#3A9AC5';//默认颜色
let compIndex = 0;//动态组件的索引id


/**/
const Color = React.createClass({

  // getDefaultProps: function() {
  //   return {
  //     name: 'Mary' //默认属性值
  //   };
  // },
  //
  // getInitialState: function() {
  //   return {count: this.props.initialCount}; //初始化state
  // },
  //
  // handleClick: function() {
  //   //用户点击事件的处理函数
  // },
    componentDidMount: function () {
        const self = this;
        //实例化颜色选择器
        $("#"+ this.props.datakey +"_bgColor").minicolors({
        change: function (value) {

                this.props.childColorChangeCallback(value);
            }.bind(self)
            });
    },
  render: function() {
      var dColor;
      if(this.props.color){
           dColor = this.props.color;
      } else{
          dColor = defaultColor;
      }
    return (
            <div className="color-border">
                    <input type="hidden"  id={this.props.datakey + "_bgColor"} className="range-color-bg" defaultValue = {dColor} key="" />
              </div>
    )
  }
})

/**
 * 颜色组件，包含数值范围、颜色选择器、删除按钮
 */
const RangeAndColor = React.createClass({
    clickHandler: function (evt) {
        //响应父级的删除事件
        this.props.deleteCallback($(evt.currentTarget).data('key'));
    },
    inputChange: function (obj) {
        //修改表单输入
        const $obj = $(obj.target);
        const value = $obj.val();
        const name = $obj.data('name');
        let currData = this.props.data;
        currData[name] = value;
        this.props.inputCallback(name, currData);
    },
    componentDidMount: function () {
        const self = this;
        //实例化颜色选择器
        $('#' + self.props.data.key + '_fontColor').minicolors({
            change: function (value) {
                let currData = this.props.data;
                currData.color = value;
                this.props.inputCallback('color', currData);
            }.bind(self)
        });
    },
    childColorChange:function(value){
                let currData = this.props.data;
                currData.bgColor = value;
                this.props.inputCallback('bgColor', currData);

    },

    render: function () {
        const result = this.props.data;
        let colorItem =[];
        if(this.props.excel){
            //result.rValue = '';
            //result.color ='';
            colorItem.push(<Color datakey={result.key} color={result.bgColor} childColorChangeCallback={this.childColorChange} key={result.key}/>)
        }
        return (
            <div className="color-range-comp">
                <div className="range-block">
                    <input className="range-input border-radius-left value-lt" value={result.lValue} data-name='lValue'
                        onChange={this.inputChange} disabled={result.lDisabled} data-disable={result.lDisabled}/>
                    <span className="range-icon fa fa-angle-left border-radius-right"></span>
                </div>
                <span className="range-text">值</span>
                <div  className="range-block">
                    <span className="range-icon fa fa-angle-left border-radius-left"></span>
                    <input className="range-input border-radius-right value-lg" value={result.rValue} data-name='rValue'
                        onChange={this.inputChange} />
                </div>
                <div className="color-border">
                    <input type="hidden" id={result.key+"_fontColor"} className="range-color" defaultValue={result.color} />
                </div>
        {colorItem}
                <div className="range-delete" data-key={result.key} onClick={this.clickHandler}>
                    <span className="range-delete-icon fa fa-minus"></span>
                </div>
            </div>
        );
    }
});

/**
 * 父容器
 */
const RangeAndColorGroupComponent = React.createClass({
    getInitialState: function () {
        const vizType = this.props.vizType;
        if (vizType === 'thermometer') {
            defaultColor = '#f00';
        }


        //解析颜色范围数据和最大值最小值，若初始无数据，使用默认数据代替
        let currentData = this.props.show ? JSON.parse(decodeURIComponent(this.props.show)) : [];
        if (currentData.length === 0) {
            currentData.push({'lValue': minRange, 'rValue': maxRange, 'color': defaultColor, 'key': 'color_range_default'});
        }
        else {
            minRange = currentData[0].lValue;
            maxRange = currentData[currentData.length - 1].rValue;
            currentData.forEach(function (item) {
                item.key = 'range_color_' + compIndex;
                compIndex++;
            });
        }

        const result = { 'compArr': currentData, 'min': minRange, 'max': maxRange };
        const propsData = this.props.data;
        if(propsData) {
            result['label'] = propsData.label;
            result['description'] = propsData.description;
            result['name'] = propsData.name;
        }




         if(this.props.excelRcData) {
           result.excel = true;
            if(this.props.excelRcData.length > 0){
               var excelRcData = this.props.excelRcData;
                var excelTemp =[];
                 for (var k in excelRcData){

                       excelTemp.push({lValue:excelRcData[k].lt,rValue:excelRcData[k].lg,color:excelRcData[k].fColor,bgColor:excelRcData[k].bgColor,key:'s_range_color_'+k})
                 }

                result.compArr = excelTemp;

            }else if(this.props.excelRcData.length == 0){
              result.compArr =[];
            }
        }
        if (this.props.orgChartData) {
            if(this.props.orgChartData.length > 0){
               var orgChartData = this.props.orgChartData;
                var orgChartTemp =[];
                 for (var k in orgChartData){

                       orgChartTemp.push({lValue:orgChartData[k].lt,rValue:orgChartData[k].lg,color:orgChartData[k].fColor,key:'o_range_color_'+k})
                 }

                result.compArr = orgChartTemp;

            }
        }




        // console.log("result:")
        // console.log(result)
        return result;
    },

    clickHandler: function (evt) {
        //添加事件回调
        if ($(evt.currentTarget).prop('disabled')) {
            return false;
        }

        const tempArr = this.state.compArr;
        const len = tempArr.length;
        let leftVal,rightVal,key;
        if(len == 0){
           leftVal = 0;
           rightVal =100;
           key = 'range_color_default';
        }else{
           leftVal = tempArr[len - 1] ? tempArr[len - 1]['rValue'] : '';
           rightVal = leftVal;
           key = 'range_color_' + compIndex;
        }


        compIndex++;
        tempArr.push({'lValue': leftVal, 'rValue': rightVal, 'color': defaultColor, 'key': key});
        this.setState({'compArr': tempArr});
    },
    deleteEventHandler: function (key) {
        //删除数据源中子组件key对应的数据，重新渲染dom
        const tempArr = this.state.compArr;
        const len = tempArr.length;


        if (len === 1) {

          if(this.state.excel){

          tempArr.splice(0, 1);
           this.setState({'compArr': tempArr});
          }
             return false;
        }

        //删除一条数据，并重新计算上下文
        for (let i = 0; i < len; i++) {
            if (key === tempArr[i].key) {
                if (i === 0) {
                    tempArr[i + 1].lValue = this.state.min;
                }
                else if (i === len - 1) {
                    tempArr[i - 1].rValue = this.state.max;
                }
                else if (tempArr[i - 1] && tempArr[i + 1]) {
                    tempArr[i + 1].lValue = tempArr[i - 1].rValue;
                }
                tempArr.splice(i, 1);
                break;
            }
        }
        if (len > tempArr.length) {

            this.setState({'compArr': tempArr});
        }
    },
    inputCallback: function (name, data) {
        //子组件输入时触发父组件数据修改
        let arr = this.state.compArr;
        let flag = false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].key === data.key) {
                flag = true;
                arr[i][name] = data[name];
                //若当前修改的是右侧值，同步下一条数据的左值
                if (name === 'rValue') {
                    if (arr[i + 1]) {
                        arr[i + 1].lValue = data.rValue;
                    }
                }
                break;
            }
        }
        if (flag) {

            this.setState({'compArr': arr});
        }
    },
    render: function () {
        let flag = false;//是否禁用添加按钮
        let temp = this.state.compArr;
        let excel = this.state.excel;
        // console.log('temp:')
        // console.log(temp)




        let compList = [];
        if (temp && temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                temp[i]['lDisabled'] = (i > 0);
                compList.push(<RangeAndColor data={temp[i]} excel = {excel} key={temp[i].key}
                                deleteCallback={this.deleteEventHandler}
                                inputCallback={this.inputCallback} />);
            }
        }

        //最多添加10个子组件
        if (temp && temp.length > 9) {
            flag = true;
        }
        let buttonList = [];
        if (this.props.orgChartData){
            buttonList.push(<button id="boundButton" type="button" className="btn btn-default btn-sm"
                            >
                        <span className="fa fa-plus"></span>
                        <span>绑定到{this.state.name}</span>
                        </button>)
        }

        return (
            <div id="oRangeColor">


                    <div id="rangeBlock">
                        {compList}
                    </div>
                    <button id="colorRangePlus" type="button" className="btn btn-default btn-sm"
                            onClick={this.clickHandler} disabled={flag}>
                        <span className="fa fa-plus"></span>
                        <span> 添加区间</span>
                    </button>
                    {buttonList}

            </div>
        );
    }
});

//module.exports = RangeAndColorGroupComponent;
export default RangeAndColorGroupComponent