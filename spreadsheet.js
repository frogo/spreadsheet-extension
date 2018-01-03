
var XLSX = require('xlsx');
var XLS  = require('xlsjs');
var React = require('react');
var ReactDOM = require('react-dom');
var FileSaver = require('./pulgin/FileSaver.js');
var SocialCalc = require('./socialcalc/SocialCalc.js');
// var RangeAndColorComponent  = require('./components/RangeAndColorComponent.js') ;
import RangeAndColorComponent from './components/RangeAndColorComponent'
import BindDashboardBox from './components/DashboardComponent'
var $ = window.$ = require('jquery');
require('./pulgin/Blob.js');

import 'react-select2-wrapper/css/select2.css';
import './style/style.css';
window.SocialCalc = SocialCalc;
window.XLSX = XLSX;






//----------------------------------------------------
//时间格式化
//----------------------------------------------------
Date.prototype.pattern=function(fmt) {
    var o = {
    "M+" : this.getMonth()+1, //月份
    "d+" : this.getDate(), //日
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
    "H+" : this.getHours(), //小时
    "m+" : this.getMinutes(), //分
    "s+" : this.getSeconds(), //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S" : this.getMilliseconds() //毫秒
    };
    var week = {
    "0" : "/u65e5",
    "1" : "/u4e00",
    "2" : "/u4e8c",
    "3" : "/u4e09",
    "4" : "/u56db",
    "5" : "/u4e94",
    "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}


//----------------------------------------------------
//数组完全相同
//----------------------------------------------------
function isAllEqual(array){
    if(array.length>0){
       return !array.some(function(value,index){
         return value !== array[0];
       });
    }else{
        return true;
    }
}

//----------------------------------------------------
//Is string
//----------------------------------------------------
function isString(str){
    return (typeof str=='string')&&str.constructor==String;
}

//----------------------------------------------------
//export xlsx file
//----------------------------------------------------

function Workbook() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
function datenum(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
};
function save(ws,name){
    if(!name || name ==''){
        alert('please enter file name!')
        return
    }
    if(!ws || ws ==''){
        alert('No data can be exported!')
        return
    }
    var ws_name = "SheetJS";
    //var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
    var wb = new Workbook();
    //ws = ws;
    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});


    FileSaver.saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), name+".xlsx")
}
function exportXlsx(event){

    var name;
    if(document.getElementById('xlsx_name') && document.getElementById('xlsx_name').value){
        name = document.getElementById('xlsx_name').value
    }else{

        var date = new Date();

        name = date.pattern("yyyy-MM-dd hh:mm:ss")
    }

    var ws={};
    var ref_range = {s:{c:0,r:0},e:{c:event.data.sheet.attribs.lastcol,r:event.data.sheet.attribs.lastrow}}
    ws['!ref'] = XLSX.utils.encode_range(ref_range);
    //ws['!ref'] = event.s.sheet.copiedfrom;
    ws['!merges'] = [];
    var sheet = event.data.sheet;
    var cells = event.data.sheet.cells;
    for (var coord in cells){
        var cell ={}
        cell['v']=cells[coord].datavalue;
        if(typeof cell['v'] === 'number')
        {cell.t = 'n'}
        else
        {cell.t = 's';}

        cell['s'] = {
            fill:{},
            alignment:{},
            font:{},
            border:{},
            numFmt:""
        }
        var startCoord =  XLSX.utils.decode_cell(coord);

        // is merge
        if(cells[coord].colspan && !cells[coord].rowspan){
            var merge = {s:startCoord,e:{c:startCoord.c + cells[coord].colspan -1 ,r:startCoord.r}}
            ws['!merges'].push(merge);
        }
        else if (!cells[coord].colspan && cells[coord].rowspan){
            var merge = {s:startCoord,e:{c:startCoord.c ,r:startCoord.r + cells[coord].rowspan -1}}
            ws['!merges'].push(merge);

        } else if(cells[coord].colspan && cells[coord].rowspan){
            var merge = {s:startCoord,e:{c:startCoord.c + cells[coord].colspan -1 ,r:startCoord.r + cells[coord].rowspan -1}}
            ws['!merges'].push(merge);
        }

        // font color
        if(cells[coord].color){
            cell.s.font['color'] = { rgb: "FF"+spreadsheet.RGBToHex(sheet.colors[cells[coord].color])}
        }

        if(cells[coord].font){
            var fonts = sheet.fonts[cells[coord].font];
            (fonts.indexOf('bold') != -1) && (cell.s.font.bold=true);
            (fonts.indexOf('italic') != -1) && (cell.s.font.italic=true);
            if(fonts.indexOf('pt') != -1){
                cell.s.font.sz = fonts.slice(fonts.indexOf('pt')-2,fonts.indexOf('pt')).replace(/\s+/g,"")
            }
            if(fonts.indexOf('px') != -1){
                cell.s.font.sz = fonts.slice(fonts.indexOf('pt')-2,fonts.indexOf('pt'))* 72 / 96;
                cell.s.font.sz.replace(/\s+/g,"")
            }
        }else {
            cell.s.font.sz = '10'
        }

        //alignment
        if(cells[coord].cellformat){
            cell.s.alignment['horizontal'] = sheet.cellformats[cells[coord].cellformat];
        }

        if(cells[coord].layout){
            (sheet.layouts[cells[coord].layout].indexOf('middle') != -1) && (cell.s.alignment.vertical='center');
            (sheet.layouts[cells[coord].layout].indexOf('top') != -1) && (cell.s.alignment.vertical='top');
            (sheet.layouts[cells[coord].layout].indexOf('bottom') != -1) && (cell.s.alignment.vertical='bottom');
        }

        //bg color
        if(cells[coord].bgcolor){
            cell.s.fill['fgColor']= { rgb: "FF"+spreadsheet.RGBToHex(sheet.colors[cells[coord].bgcolor])}
        }

        // border
        if(cells[coord].bt){
            cell.s.border['top'] = {"style":"thin","color":{"rgb":"FF"+spreadsheet.RGBToHex(sheet.borderstyles[cells[coord].bt])}}
        }
        if(cells[coord].br){
            cell.s.border['right'] = {"style":"thin","color":{"rgb":"FF"+spreadsheet.RGBToHex(sheet.borderstyles[cells[coord].br])}}
        }
        if(cells[coord].bb){
            cell.s.border['bottom'] = {"style":"thin","color":{"rgb":"FF"+spreadsheet.RGBToHex(sheet.borderstyles[cells[coord].bb])}}
        }
        if(cells[coord].bl){
            cell.s.border['left'] = {"style":"thin","color":{"rgb":"FF"+spreadsheet.RGBToHex(sheet.borderstyles[cells[coord].bl])}}
        }


        // if empty then delete
        JSON.stringify(cell.s.fill) == "{}" && delete cell.s.fill
        JSON.stringify(cell.s.font) == "{}" && delete cell.s.font
        JSON.stringify(cell.s.alignment) == "{}" && delete cell.s.alignment
        JSON.stringify(cell.s.border) == "{}" && delete cell.s.border
        JSON.stringify(cell.s.numFmt) == "" && delete cell.s.numFmt

        JSON.stringify(cell.s.fill) == "{}" &&
        JSON.stringify(cell.s.font) == "{}" &&
        JSON.stringify(cell.s.alignment) == "{}" &&
        JSON.stringify(cell.s.border) == "{}" &&
        JSON.stringify(cell.s.numFmt) == "" &&
        delete cell.s




        ws[coord] = cell
    }

    if(ws['!merges'].length == 0){
        delete ws['!merge'];
    }


    save(ws,name)

}


//----------------------------------------------------
//Convert the data of the cell binding to real data
//----------------------------------------------------
function switchingData(s){
    if(!$.isEmptyObject(s.sheet.cells)){
        $.each(s.sheet.cells,function(i,e){

            var tempCellObj ={};//template of First cell be use for extension
            var cellLetter = e.coord.replace(/[^a-z]/ig,"");//e.g. A2 = A
            var cellNumber = e.coord.replace(/[^0-9]+/ig,"");//e.g. A2 = 2
            var colIndex = spreadsheet.coordToCr(e.coord).col;//e.g. C2 = 3,AA3 = 27 The index value in columns
            var colorRangeOpt ={},//be use for cell colorRange extension
                dashboardBindOpt ={};//be use for cell dashboardBind extension

            var isMerge = s.cellBind.cellMerge.indexOf(e.coord);





            if(e.datatype == "t" && e.datavalue && isString(e.datavalue) && e.datavalue.charAt(0) == "$")
            {

                e.datavalue = s.sheetDataMap[0][e.datavalue.substring(1)]//Gets $xx..(key) and convert to true value
                e.displaystring = s.sheetDataMap[0][e.datavalue.substring(1)]
                e.datatype ='t';
                e.valuetype = 't';
            }
            else if(e.datatype == "t" && e.datavalue && isString(e.datavalue) && e.datavalue.charAt(0) == "^")
            {
                tempCellObj = e;

                for(var k in s.cellBind.colorRangeData){
                    if(s.cellBind.colorRangeData[k]['coord'] == tempCellObj.coord ){
                        colorRangeOpt = s.cellBind.colorRangeData[k]['opt']// if this cell has a colorRange, get it
                    }
                }
                for(var k in s.cellBind.dashboardData){
                    if(s.cellBind.dashboardData[k]['coord'] == tempCellObj.coord ){
                        dashboardBindOpt = s.cellBind.dashboardData[k]['opt']// if this cell has a dashboard bind data, get it
                    }
                }

                var cellKey = e.datavalue.substr(e.datavalue.indexOf('^')+1); //e.g. ^日期 = 日期
                var sKeyIndex = Object.getOwnPropertyNames(s.sheetDataMap[0]).indexOf(cellKey);//The index value of the column name (property) in the array object
                var realValueArr = [];

                $.each(s.sheetDataMap,function(index,item){

                    realValueArr.push(s.sheetDataMap[index][cellKey]);
                    var cellObjCoord = s.rcColname(colIndex) + cellNumber;
                    var cellObj = s.sheet.cells[cellObjCoord];//get cell's object
                    if(!$.isEmptyObject(colorRangeOpt)){
                        s.cellBind.colorRangeData.push({"coord":cellObjCoord,"opt":colorRangeOpt})//add colorRange data for this cell
                    }
                    if(!$.isEmptyObject(dashboardBindOpt)){
                        s.cellBind.dashboardData.push({"coord":cellObjCoord,"opt":dashboardBindOpt})//add dashboard bind data for this cell
                    }


                    if(cellObj){//The cell object already exists
                        //cellObj.datavalue = index+"^"+Object.getOwnPropertyNames(item)[sKeyIndex];
                        cellObj.datavalue = s.sheetDataMap[index][cellKey];
                        cellObj.displaystring = s.sheetDataMap[index][cellKey];
                        cellObj.datatype = 't';
                        cellObj.valuetype = 't';
                        //cellObj.dataIndex = index;

                    }else{//The cell object is empty and the SC recreates it
                        //s.sheet.cells[cellObjCoord] = tempCellObj;
                        s.sheet.cells[cellObjCoord] = new SocialCalc.Cell(cellObjCoord);
                        for(var k in tempCellObj){//把扩展数据根CELL的实体的内容（包括样式，值，等等）复制给扩展出来的CELL 实体
                            if(k == 'coord'){//改变coord
                                s.sheet.cells[cellObjCoord]['coord'] = cellObjCoord;
                            } else {
                                s.sheet.cells[cellObjCoord][k] = tempCellObj[k]
                            }
                        }
                        //spreadsheet.sheet.cells[cellObjCoord].datavalue = index+"^"+Object.getOwnPropertyNames(item)[sKeyIndex];
                        s.sheet.cells[cellObjCoord].datavalue =  s.sheetDataMap[index][cellKey];
                        s.sheet.cells[cellObjCoord].displaystring = s.sheetDataMap[index][cellKey];
                        s.sheet.cells[cellObjCoord].datatype = 't';
                        s.sheet.cells[cellObjCoord].valuetype = 't';
                        //spreadsheet.sheet.cells[cellObjCoord].dataIndex = index;
                    }
                    colIndex++
                })

                if(isMerge != -1 && isAllEqual(realValueArr)){//All the array values are the same,merge cell
                    s.sheet.cells[e.coord].colspan = realValueArr.length
                }

            }
            else if(e.datatype == "t" && e.datavalue && isString(e.datavalue) && e.datavalue.charAt(0) == "!")
            {

                tempCellObj = e;

                for(var k in s.cellBind.colorRangeData){
                    if(s.cellBind.colorRangeData[k]['coord'] == tempCellObj.coord ){
                        colorRangeOpt = s.cellBind.colorRangeData[k]['opt']// if this cell has a colorRange, get it
                    }
                }
                for(var k in s.cellBind.dashboardData){
                    if(s.cellBind.dashboardData[k]['coord'] == tempCellObj.coord ){
                        dashboardBindOpt = s.cellBind.dashboardData[k]['opt']// if this cell has a dashboard bind data, get it
                    }
                }

                var cellKey = e.datavalue.substr(e.datavalue.indexOf('!')+1); //e.g. !日期 = 日期
                var realValueArr = [];


                $.each(s.sheetDataMap,function(index,item){
                    realValueArr.push(s.sheetDataMap[index][cellKey]);
                    var cellObjCoord = cellLetter + cellNumber;
                    var cellObj = s.sheet.cells[cellObjCoord];//get cell's object

                    if(!$.isEmptyObject(colorRangeOpt)){
                        s.cellBind.colorRangeData.push({"coord":cellObjCoord,"opt":colorRangeOpt})//add colorRange data for this cell
                    }
                    if(!$.isEmptyObject(dashboardBindOpt)){
                        s.cellBind.dashboardData.push({"coord":cellObjCoord,"opt":dashboardBindOpt})//add dashboard bind data for this cell
                    }


                    if(cellObj){//The cell object already exists
                        //cellObj.datavalue = index+"!"+Object.getOwnPropertyNames(item)[sKeyIndex];
                        cellObj.datavalue = s.sheetDataMap[index][cellKey]
                        cellObj.displaystring = s.sheetDataMap[index][cellKey];
                        cellObj.datatype = 't';
                        cellObj.valuetype = 't';
                        //cellObj.dataIndex = index;
                    }else{//The cell object is empty and the SC recreates it
                        //s.sheet.cells[cellObjCoord] = tempCellObj
                        s.sheet.cells[cellObjCoord] = new SocialCalc.Cell(cellObjCoord);
                        for(var k in tempCellObj){//把扩展数据根CELL的实体的内容（包括样式，值，等等）复制给扩展出来的CELL 实体
                            if(k == 'coord'){//改变coord
                                s.sheet.cells[cellObjCoord]['coord'] = cellObjCoord;
                            } else {
                                s.sheet.cells[cellObjCoord][k] = tempCellObj[k]
                            }
                        }
                        // spreadsheet.sheet.cells[cellObjCoord].datavalue = index+"!"+Object.getOwnPropertyNames(item)[sKeyIndex];
                        s.sheet.cells[cellObjCoord].datavalue = s.sheetDataMap[index][cellKey]
                        s.sheet.cells[cellObjCoord].displaystring = s.sheetDataMap[index][cellKey];
                        s.sheet.cells[cellObjCoord].datatype = 't';
                        s.sheet.cells[cellObjCoord].valuetype = 't';
                        s.sheet.cells[cellObjCoord].dataIndex = index;
                    }
                    cellNumber++
                })

                if(isMerge != -1 && isAllEqual(realValueArr)){//All the array values are the same,merge cell
                    s.sheet.cells[e.coord].rowspan = realValueArr.length
                }

            }





        })
    }
}

//----------------------------------------------------
//cell range color set
//----------------------------------------------------
function cellColorAlarm(s){//e.g. A1 1~100 red
    $.each(s.cellBind.colorRangeData,function(i,e){

        var cell,
            cellValue,
            sheetColorHash =  s.sheet.colorhash,
            sheetColors = s.sheet.colors;

        if(s.sheet.cells[e.coord] && s.sheet.cells[e.coord].datavalue){
            cell = s.sheet.cells[e.coord];
            cellValue = cell.datavalue;
        } else {
            return
        }

        if(isNaN(cellValue)){
            if(cellValue.indexOf('<')!=-1 && cellValue.indexOf('>')!=-1){
                cellValue = cellValue.substr(0,cellValue.indexOf('<'))
            } else{
                return
            }
        }


        if(e.opt.length ==1)
        {
            var opt = e.opt[0];
            var   color = s.HexToRGB(opt.fColor) ,
                bg = s.HexToRGB(opt.bgColor);
            if(parseInt(cellValue) >= opt.lt && parseInt(cellValue) <= opt.lg)
            {

                if(sheetColorHash.hasOwnProperty(color)){//Color already exists
                    cell.color = sheetColorHash[color];//set the color to current cell's font color
                }else{//Color is not exist
                    sheetColorHash[color] = Object.getOwnPropertyNames(sheetColorHash).length+1//added color to {colorhash}
                    sheetColors[sheetColorHash[color]] = color;
                    cell.color = sheetColorHash[color];//set the color to current cell's font color
                }

                if(sheetColorHash.hasOwnProperty(bg)){//bgColor already exists
                    cell.bgcolor = sheetColorHash[bg];//set the color to current cell's bg color
                }else{//Color is not exist
                    sheetColorHash[bg] = Object.getOwnPropertyNames(sheetColorHash).length+1//added color to {colorhash}
                    sheetColors[sheetColorHash[bg]] = bg;
                    cell.bgcolor = sheetColorHash[bg];//set the color to current cell's bg color
                }

            }




        }
        else if(e.opt.length >1)
        {
            var optList = e.opt;
            for(var k in optList)
            {
                var   color = s.HexToRGB(optList[k].fColor) ,
                    bg = s.HexToRGB(optList[k].bgColor);
                if(parseInt(cellValue) >= optList[k].lt && parseInt(cellValue) <= optList[k].lg)
                {

                    if(sheetColorHash.hasOwnProperty(color)){//Color already exists
                        cell.color = sheetColorHash[color];//set the color to current cell's font color
                    }else{
                        sheetColorHash[color] = Object.getOwnPropertyNames(sheetColorHash).length+1//added color to {colorhash}
                        sheetColors[sheetColorHash[color]] = color;
                        cell.color = sheetColorHash[color];//set the color to current cell's font color
                    }

                    if(sheetColorHash.hasOwnProperty(bg)){//bgColor already exists
                        cell.bgcolor = sheetColorHash[bg];//set the color to current cell's bg color
                    }else{
                        sheetColorHash[bg] = Object.getOwnPropertyNames(sheetColorHash).length+1//added color to {colorhash}
                        sheetColors[sheetColorHash[bg]] = bg;
                        cell.bgcolor = sheetColorHash[bg];//set the color to current cell's bg color
                    }

                }
            }
        }



    })
}


var zh_CN = {
    "s_BrowserNotSupported": "浏览器不支持",
    "s_InternalError": "网络错误 (通常是网络异常): ",
    "s_pssUnknownColType": "Unknown col type item",
    "s_pssUnknownRowType": "Unknown row type item",
    "s_pssUnknownLineType": "Unknown line type",
    "s_cfspUnknownCellType": "Unknown cell type item",
    "s_escUnknownSheetCmd": "Unknown sheet command: ",
    "s_escUnknownSetCoordCmd": "Unknown set coord command: ",
    "s_escUnknownCmd": "Unknown command: ",
    "s_caccCircRef": "Circular reference to ",
    "s_rcMissingSheet": "Render Context must have a sheet object",
    "s_statusline_executing": "Executing...",
    "s_statusline_displaying": "Displaying...",
    "s_statusline_ordering": "Ordering...",
    "s_statusline_calculating": "Calculating...",
    "s_statusline_calculatingls": "Calculating... Loading Sheet...",
    "s_statusline_doingserverfunc": "doing server function ",
    "s_statusline_incell": " in cell ",
    "s_statusline_calcstart": "Calculation start...",
    "s_statusline_sum": "SUM",
    "s_statusline_recalcneeded": "<span style=\"color:#999;\">(Recalc needed)</span>",
    "s_statusline_circref": "<span style=\"color:red;\">Circular reference: ",
    "s_inputboxdisplaymultilinetext": "[Multi-line text: Click icon on right to edit]",
    "s_CHfillAllTooltip": "Fill Contents and Formats Down/Right",
    "s_CHfillContentsTooltip": "Fill Contents Only Down/Right",
    "s_CHmovePasteAllTooltip": "Move Contents and Formats",
    "s_CHmovePasteContentsTooltip": "Move Contents Only",
    "s_CHmoveInsertAllTooltip": "Slide Contents and Formats within Row/Col",
    "s_CHmoveInsertContentsTooltip": "Slide Contents within Row/Col",
    "s_CHindicatorOperationLookup": {
        "Fill": "填充",
        "FillC": "填充内容",
        "Move": "移动",
        "MoveI": "滑动",
        "MoveC": "移动内容",
        "MoveIC": "滑动内容"
    },
    "s_CHindicatorDirectionLookup": {
        "Down": " 下",
        "Right": " 右",
        "Horizontal": " 水平",
        "Vertical": " 垂直"
    },
    "s_panesliderTooltiph": "Drag to lock pane vertically",
    "s_panesliderTooltipv": "Drag to lock pane horizontally",
    "s_TCTDFthumbstatusPrefixv": "Row ",
    "s_TCTDFthumbstatusPrefixh": "Col ",
    "s_PopupListCancel": "[取消]",
    "s_PopupListCustom": "自定义",
    "s_loc_align_center": "居中",
    "s_loc_align_left": "居左",
    "s_loc_align_right": "居右",
    "s_loc_alignment": "对其方式",
    "s_loc_audit": "操作记录",
    "s_loc_audit_trail_this_session": "操作记录",
    "s_loc_auto": "自动",
    "s_loc_auto_sum": "自动求和",
    "s_loc_auto_wX_commas": "Auto w/ commas",
    "s_loc_automatic": "主动",
    "s_loc_background": "背景颜色",
    "s_loc_bold": "粗体",
    "s_loc_bold_XampX_italics": "粗体 &amp; 斜体",
    "s_loc_bold_italic": "粗斜体",
    "s_loc_borders": "边框",
    "s_loc_borders_off": "取消边框",
    "s_loc_borders_on": "打开边框",
    "s_loc_bottom": "底",
    "s_loc_bottom_border": "底边",
    "s_loc_cell_settings": "单元格设置",
    "s_loc_csv_format": "逗号分隔(CSV)格式",
    "s_loc_cancel": "取消",
    "s_loc_category": "分類",
    "s_loc_center": "中央",
    "s_loc_clear": "清空",
    "s_loc_clear_socialcalc_clipboard": "清空 SocialCalc 剪切版",
    "s_loc_clipboard": "剪切板",
    "s_loc_color": "顏色",
    "s_loc_column_": "栏 ",
    "s_loc_comment": "留言",
    "s_loc_copy": "复制",
    "s_loc_custom": "自定义",
    "s_loc_cut": "剪切",
    "s_loc_default": "默认",
    "s_loc_default_alignment": "默认对齐",
    "s_loc_default_column_width": "默认栏宽度",
    "s_loc_default_font": "默认字体",
    "s_loc_default_format": "默认格式",
    "s_loc_default_padding": "默认留白",
    "s_loc_delete": "删除",
    "s_loc_delete_column": "删除列",
    "s_loc_delete_contents": "清空内容",
    "s_loc_delete_row": "删除行",
    "s_loc_description": "描述",
    "s_loc_display_clipboard_in": "显示剪切板为",
    "s_loc_down": "降序",
    "s_loc_edit": "编辑",
    "s_loc_existing_names": "已有名称",
    "s_loc_family": "字体",
    "s_loc_fill_down": "向下填充",
    "s_loc_fill_right": "向右填充",
    "s_loc_font": "字体",
    "s_loc_format": "格式",
    "s_loc_formula": "公式",
    "s_loc_function_list": "函数表",
    "s_loc_functions": "函数",
    "s_loc_grid": "格",
    "s_loc_graph": "图表",
    "s_loc_hidden": "隐藏",
    "s_loc_hide_column": "隐藏列",
    "s_loc_hide_row": "隐藏行",
    "s_loc_horizontal": "水平",
    "s_loc_insert_column": "插入一列",
    "s_loc_insert_row": "插入一行",
    "s_loc_italic": "斜体",
    "s_loc_last_sort": "第三排序",
    "s_loc_left": "左",
    "s_loc_left_border": "左边框",
    "s_loc_link": "链接",
    "s_loc_link_input_box": "链接输入框",
    "s_loc_list": "列表",
    "s_loc_load_socialcalc_clipboard_with_this": "载入剪切板内容",
    "s_loc_lock_cell": "锁定单元格",
    "s_loc_major_sort": "主要排序",
    "s_loc_manual": "手册",
    "s_loc_merge_unmerge_cells": "合并/分解单元格",
    "s_loc_middle": "居中",
    "s_loc_minor_sort": "次要排序",
    "s_loc_move_insert": "移动插入",
    "s_loc_move_paste": "移动粘贴",
    "s_loc_multiXline_input_box": "多行输入",
    "s_loc_name": "名称",
    "s_loc_names": "名称",
    "s_loc_no_padding": "不留白",
    "s_loc_normal": "一般",
    "s_loc_number": "数字",
    "s_loc_number_horizontal": "Number Horizontal",
    "s_loc_ok": "确定",
    "s_loc_padding": "留白",
    "s_loc_page_name": "页码",
    "s_loc_paste": "粘贴",
    "s_loc_paste_formats": "格式化粘贴",
    "s_loc_plain_text": "空白文件",
    "s_loc_recalc": "重算",
    "s_loc_recalculation": "重新计算",
    "s_loc_redo": "重做",
    "s_loc_right": "右",
    "s_loc_right_border": "右边框",
    "s_loc_sheet_settings": "表格设置",
    "s_loc_save": "保存",
    "s_loc_save_to": "存储为",
    "s_loc_set_cell_contents": "设置单元格内容",
    "s_loc_set_cells_to_sort": "设置单元格排序",
    "s_loc_set_value_to": "赋值",
    "s_loc_set_to_link_format": "Set to Link format",
    "s_loc_setXclear_move_from": "设置/清除 移动操作",
    "s_loc_show_cell_settings": "显示单元格设置",
    "s_loc_show_sheet_settings": "显示表格设置",
    "s_loc_show_in_new_browser_window": "Show in new browser window",
    "s_loc_size": "Size",
    "s_loc_socialcalcXsave_format": "SocialCalc 格式",
    "s_loc_sort": "排序",
    "s_loc_sort_": "排序 ",
    "s_loc_sort_cells": "排序单元格",
    "s_loc_swap_colors": "交换颜色",
    "s_loc_tabXdelimited_format": "分隔符",
    "s_loc_text": "文本",
    "s_loc_text_horizontal": "Text Horizontal",
    "s_loc_this_is_aXbrXsample": "这是<br>示例",
    "s_loc_top": "上",
    "s_loc_top_border": "上边框",
    "s_loc_undone_steps": "UNDONE STEPS",
    "s_loc_url": "网址",
    "s_loc_undo": "撤销",
    "s_loc_unlock_cell": "解锁单元格",
    "s_loc_unmerge_cells": "取消合并",
    "s_loc_up": "升序",
    "s_loc_value": "值",
    "s_loc_vertical": "垂直",
    "s_loc_wikitext": "协作文字",
    "s_loc_workspace": "工作区",
    "s_loc_XnewX": "[New]",
    "s_loc_XnoneX": "[无]",
    "s_loc_Xselect_rangeX": "[选择范围]",
    //EXTRA
    "s_loc_binddata_to_cell":"绑定数据到单元格",
    "s_loc_import":"导入",
    "s_loc_binddata":"数据",
    "s_loc_plain":"预览",
    "s_loc_color_interval_alarm":"单元格不同值范围颜色区间配置",
    "s_loc_row_extension":"行扩展",
    "s_loc_column_extension":"列扩展",
    "s_loc_bind_dashboard":"绑定看板到单元格",
    "s_loc_please_enter_the_name_of_the_file":"请输入想要保存的文件名称",
    "s_loc_export_file":"导出文件",
    "s_loc_choose":"选择",
    "s_loc_current_cell":"当前单元格",
    "s_loc_drop_file":"拖动一个 cvs/ods或者一个xlsx文件到这里导入。",
    "s_loc_cell_binddata":"单元格绑定数据",
    "s_loc_merge_cell_of_same_values":"合并相同值的单元格",
    "s_loc_freeze":"冻结",
    "s_loc_none_freeze":"无窗格冻结",
    "s_loc_freeze_top_row":"冻结首行",
    "s_loc_freeze_first_column":"冻结首列",
    "s_loc_freeze_panes":"冻结拆分窗格",

    "s_FormatNumber_daynames": [
        "周日",
        "周一",
        "周二",
        "周三",
        "周四",
        "周五",
        "周六"
    ],
    "s_FormatNumber_daynames3": [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
    ],
    "s_FormatNumber_monthnames": [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月"
    ],
    "s_FormatNumber_monthnames3": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ],
    "s_FormatNumber_am": "AM",
    "s_FormatNumber_am1": "A",
    "s_FormatNumber_pm": "PM",
    "s_FormatNumber_pm1": "P",
    "s_parseerrexponent": "Improperly formed number exponent",
    "s_parseerrchar": "Unexpected character in formula",
    "s_parseerrstring": "Improperly formed string",
    "s_parseerrspecialvalue": "Improperly formed special value",
    "s_parseerrtwoops": "Error in formula (two operators inappropriately in a row)",
    "s_parseerrmissingopenparen": "Missing open parenthesis in list with comma(s). ",
    "s_parseerrcloseparennoopen": "Closing parenthesis without open parenthesis. ",
    "s_parseerrmissingcloseparen": "Missing close parenthesis. ",
    "s_parseerrmissingoperand": "Missing operand. ",
    "s_parseerrerrorinformula": "Error in formula.",
    "s_calcerrerrorvalueinformula": "Error value in formula",
    "s_parseerrerrorinformulabadval": "Error in formula resulting in bad value",
    "s_formularangeresult": "Formula results in range value:",
    "s_calcerrnumericnan": "Formula results in an bad numeric value",
    "s_calcerrnumericoverflow": "Numeric overflow",
    "s_sheetunavailable": "Sheet unavailable:",
    "s_calcerrcellrefmissing": "Cell reference missing when expected.",
    "s_calcerrsheetnamemissing": "Sheet name missing when expected.",
    "s_circularnameref": "Circular name reference to name",
    "s_calcerrunknownname": "Unknown name",
    "s_calcerrincorrectargstofunction": "Incorrect arguments to function",
    "s_sheetfuncunknownfunction": "Unknown function",
    "s_sheetfunclnarg": "LN argument must be greater than 0",
    "s_sheetfunclog10arg": "LOG10 argument must be greater than 0",
    "s_sheetfunclogsecondarg": "LOG second argument must be numeric greater than 0",
    "s_sheetfunclogfirstarg": "LOG first argument must be greater than 0",
    "s_sheetfuncroundsecondarg": "ROUND second argument must be numeric",
    "s_sheetfuncddblife": "DDB life must be greater than 1",
    "s_sheetfuncslnlife": "SLN life must be greater than 1",
    "s_fdef_ABS": "Absolute value function. ",
    "s_fdef_ACOS": "Trigonometric arccosine function. ",
    "s_fdef_AND": "True if all arguments are true. ",
    "s_fdef_ASIN": "Trigonometric arcsine function. ",
    "s_fdef_ATAN": "Trigonometric arctan function. ",
    "s_fdef_ATAN2": "Trigonometric arc tangent function (result is in radians). ",
    "s_fdef_AVERAGE": "Averages the values. ",
    "s_fdef_CHOOSE": "Returns the value specified by the index. The values may be ranges of cells. ",
    "s_fdef_COLUMNS": "Returns the number of columns in the range. ",
    "s_fdef_COS": "Trigonometric cosine function (value is in radians). ",
    "s_fdef_COUNT": "Counts the number of numeric values, not blank, text, or error. ",
    "s_fdef_COUNTA": "Counts the number of non-blank values. ",
    "s_fdef_COUNTBLANK": "Counts the number of blank values. (Note: \"\" is not blank.) ",
    "s_fdef_COUNTIF": "Counts the number of number of cells in the range that meet the criteria. The criteria may be a value (\"x\", 15, 1+3) or a test (>25). ",
    "s_fdef_DATE": "Returns the appropriate date value given numbers for year, month, and day. For example: DATE(2006,2,1) for February 1, 2006. Note: In this program, day \"1\" is December 31, 1899 and the year 1900 is not a leap year. Some programs use January 1, 1900, as day \"1\" and treat 1900 as a leap year. In both cases, though, dates on or after March 1, 1900, are the same. ",
    "s_fdef_DAVERAGE": "Averages the values in the specified field in records that meet the criteria. ",
    "s_fdef_DAY": "Returns the day of month for a date value. ",
    "s_fdef_DCOUNT": "Counts the number of numeric values, not blank, text, or error, in the specified field in records that meet the criteria. ",
    "s_fdef_DCOUNTA": "Counts the number of non-blank values in the specified field in records that meet the criteria. ",
    "s_fdef_DDB": "Returns the amount of depreciation at the given period of time (the default factor is 2 for double-declining balance).   ",
    "s_fdef_DEGREES": "Converts value in radians into degrees. ",
    "s_fdef_DGET": "Returns the value of the specified field in the single record that meets the criteria. ",
    "s_fdef_DMAX": "Returns the maximum of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DMIN": "Returns the maximum of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DPRODUCT": "Returns the result of multiplying the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DSTDEV": "Returns the sample standard deviation of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DSTDEVP": "Returns the standard deviation of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DSUM": "Returns the sum of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DVAR": "Returns the sample variance of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_DVARP": "Returns the variance of the numeric values in the specified field in records that meet the criteria. ",
    "s_fdef_EVEN": "Rounds the value up in magnitude to the nearest even integer. ",
    "s_fdef_EXACT": "Returns \"true\" if the values are exactly the same, including case, type, etc. ",
    "s_fdef_EXP": "Returns e raised to the value power. ",
    "s_fdef_FACT": "Returns factorial of the value. ",
    "s_fdef_FALSE": "Returns the logical value \"false\". ",
    "s_fdef_FIND": "Returns the starting position within string2 of the first occurrence of string1 at or after \"start\". If start is omitted, 1 is assumed. ",
    "s_fdef_FV": "Returns the future value of repeated payments of money invested at the given rate for the specified number of periods, with optional present value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    "s_fdef_HLOOKUP": "Look for the matching value for the given value in the range and return the corresponding value in the cell specified by the row offset. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match<=value) instead of exact match. ",
    "s_fdef_HOUR": "Returns the hour portion of a time or date/time value. ",
    "s_fdef_IF": "Results in true-value if logical-expression is TRUE or non-zero, otherwise results in false-value. ",
    "s_fdef_INDEX": "Returns a cell or range reference for the specified row and column in the range. If range is 1-dimensional, then only one of rownum or colnum are needed. If range is 2-dimensional and rownum or colnum are zero, a reference to the range of just the specified column or row is returned. You can use the returned reference value in a range, e.g., sum(A1:INDEX(A2:A10,4)). ",
    "s_fdef_INT": "Returns the value rounded down to the nearest integer (towards -infinity). ",
    "s_fdef_IRR": "Returns the interest rate at which the cash flows in the range have a net present value of zero. Uses an iterative process that will return #NUM! error if it does not converge. There may be more than one possible solution. Providing the optional guess value may help in certain situations where it does not converge or finds an inappropriate solution (the default guess is 10%). ",
    "s_fdef_ISBLANK": "Returns \"true\" if the value is a reference to a blank cell. ",
    "s_fdef_ISERR": "Returns \"true\" if the value is of type \"Error\" but not \"NA\". ",
    "s_fdef_ISERROR": "Returns \"true\" if the value is of type \"Error\". ",
    "s_fdef_ISLOGICAL": "Returns \"true\" if the value is of type \"Logical\" (true/false). ",
    "s_fdef_ISNA": "Returns \"true\" if the value is the error type \"NA\". ",
    "s_fdef_ISNONTEXT": "Returns \"true\" if the value is not of type \"Text\". ",
    "s_fdef_ISNUMBER": "Returns \"true\" if the value is of type \"Number\" (including logical values). ",
    "s_fdef_ISTEXT": "Returns \"true\" if the value is of type \"Text\". ",
    "s_fdef_LEFT": "Returns the specified number of characters from the text value. If count is omitted, 1 is assumed. ",
    "s_fdef_LEN": "Returns the number of characters in the text value. ",
    "s_fdef_LN": "Returns the natural logarithm of the value. ",
    "s_fdef_LOG": "Returns the logarithm of the value using the specified base. ",
    "s_fdef_LOG10": "Returns the base 10 logarithm of the value. ",
    "s_fdef_LOWER": "Returns the text value with all uppercase characters converted to lowercase. ",
    "s_fdef_MATCH": "Look for the matching value for the given value in the range and return position (the first is 1) in that range. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match<=value) instead of exact match. If rangelookup is -1, act like 1 but the bracket is match>=value. ",
    "s_fdef_MAX": "Returns the maximum of the numeric values. ",
    "s_fdef_MID": "Returns the specified number of characters from the text value starting from the specified position. ",
    "s_fdef_MIN": "Returns the minimum of the numeric values. ",
    "s_fdef_MINUTE": "Returns the minute portion of a time or date/time value. ",
    "s_fdef_MOD": "Returns the remainder of the first value divided by the second. ",
    "s_fdef_MONTH": "Returns the month part of a date value. ",
    "s_fdef_N": "Returns the value if it is a numeric value otherwise an error. ",
    "s_fdef_NA": "Returns the #N/A error value which propagates through most operations. ",
    "s_fdef_NOT": "Returns FALSE if value is true, and TRUE if it is false. ",
    "s_fdef_NOW": "Returns the current date/time. ",
    "s_fdef_NPER": "Returns the number of periods at which payments invested each period at the given rate with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period) has the given present value. ",
    "s_fdef_NPV": "Returns the net present value of cash flows (which may be individual values and/or ranges) at the given rate. The flows are positive if income, negative if paid out, and are assumed at the end of each period. ",
    "s_fdef_ODD": "Rounds the value up in magnitude to the nearest odd integer. ",
    "s_fdef_OR": "True if any argument is true ",
    "s_fdef_PI": "The value 3.1415926... ",
    "s_fdef_PMT": "Returns the amount of each payment that must be invested at the given rate for the specified number of periods to have the specified present value, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    "s_fdef_POWER": "Returns the first value raised to the second value power. ",
    "s_fdef_PRODUCT": "Returns the result of multiplying the numeric values. ",
    "s_fdef_PROPER": "Returns the text value with the first letter of each word converted to uppercase and the others to lowercase. ",
    "s_fdef_PV": "Returns the present value of the given number of payments each invested at the given rate, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). ",
    "s_fdef_RADIANS": "Converts value in degrees into radians. ",
    "s_fdef_RATE": "Returns the rate at which the given number of payments each invested at the given rate has the specified present value, with optional future value (default 0) and payment type (default 0 = at end of period, 1 = beginning of period). Uses an iterative process that will return #NUM! error if it does not converge. There may be more than one possible solution. Providing the optional guess value may help in certain situations where it does not converge or finds an inappropriate solution (the default guess is 10%). ",
    "s_fdef_REPLACE": "Returns text1 with the specified number of characters starting from the specified position replaced by text2. ",
    "s_fdef_REPT": "Returns the text repeated the specified number of times. ",
    "s_fdef_RIGHT": "Returns the specified number of characters from the text value starting from the end. If count is omitted, 1 is assumed. ",
    "s_fdef_ROUND": "Rounds the value to the specified number of decimal places. If precision is negative, then round to powers of 10. The default precision is 0 (round to integer). ",
    "s_fdef_ROWS": "Returns the number of rows in the range. ",
    "s_fdef_SECOND": "Returns the second portion of a time or date/time value (truncated to an integer). ",
    "s_fdef_SIN": "Trigonometric sine function (value is in radians) ",
    "s_fdef_SLN": "Returns the amount of depreciation at each period of time using the straight-line method. ",
    "s_fdef_SQRT": "Square root of the value ",
    "s_fdef_STDEV": "Returns the sample standard deviation of the numeric values. ",
    "s_fdef_STDEVP": "Returns the standard deviation of the numeric values. ",
    "s_fdef_SUBSTITUTE": "Returns text1 with the all occurrences of oldtext replaced by newtext. If \"occurrence\" is present, then only that occurrence is replaced. ",
    "s_fdef_SUM": "Adds the numeric values. The values to the sum function may be ranges in the form similar to A1:B5. ",
    "s_fdef_SUMIF": "Sums the numeric values of cells in the range that meet the criteria. The criteria may be a value (\"x\", 15, 1+3) or a test (>25). If range2 is present, then range1 is tested and the corresponding range2 value is summed. ",
    "s_fdef_SYD": "Depreciation by Sum of Year's Digits method. ",
    "s_fdef_T": "Returns the text value or else a null string. ",
    "s_fdef_TAN": "Trigonometric tangent function (value is in radians) ",
    "s_fdef_TIME": "Returns the time value given the specified hour, minute, and second. ",
    "s_fdef_TODAY": "Returns the current date (an integer). Note: In this program, day \"1\" is December 31, 1899 and the year 1900 is not a leap year. Some programs use January 1, 1900, as day \"1\" and treat 1900 as a leap year. In both cases, though, dates on or after March 1, 1900, are the same. ",
    "s_fdef_TRIM": "Returns the text value with leading, trailing, and repeated spaces removed. ",
    "s_fdef_TRUE": "Returns the logical value \"true\". ",
    "s_fdef_TRUNC": "Truncates the value to the specified number of decimal places. If precision is negative, truncate to powers of 10. ",
    "s_fdef_UPPER": "Returns the text value with all lowercase characters converted to uppercase. ",
    "s_fdef_VALUE": "Converts the specified text value into a numeric value. Various forms that look like numbers (including digits followed by %, forms that look like dates, etc.) are handled. This may not handle all of the forms accepted by other spreadsheets and may be locale dependent. ",
    "s_fdef_VAR": "Returns the sample variance of the numeric values. ",
    "s_fdef_VARP": "Returns the variance of the numeric values. ",
    "s_fdef_VLOOKUP": "Look for the matching value for the given value in the range and return the corresponding value in the cell specified by the column offset. If rangelookup is 1 (the default) and not 0, match if within numeric brackets (match>=value) instead of exact match. ",
    "s_fdef_WEEKDAY": "Returns the day of week specified by the date value. If type is 1 (the default), Sunday is day and Saturday is day 7. If type is 2, Monday is day 1 and Sunday is day 7. If type is 3, Monday is day 0 and Sunday is day 6. ",
    "s_fdef_YEAR": "Returns the year part of a date value. ",
    "s_fdef_SUMPRODUCT": "Sums the pairwise products of 2 or more ranges. The ranges must be of equal length.",
    "s_fdef_CEILING": "Rounds the given number up to the nearest integer or multiple of significance. Significance is the value to whose multiple of ten the value is to be rounded up (.01, .1, 1, 10, etc.)",
    "s_fdef_FLOOR": "Rounds the given number down to the nearest multiple of significance. Significance is the value to whose multiple of ten the number is to be rounded down (.01, .1, 1, 10, etc.)",
    "s_farg_v": "value",
    "s_farg_vn": "value1, value2, ...",
    "s_farg_xy": "valueX, valueY",
    "s_farg_choose": "index, value1, value2, ...",
    "s_farg_range": "range",
    "s_farg_rangec": "range, criteria",
    "s_farg_date": "year, month, day",
    "s_farg_dfunc": "databaserange, fieldname, criteriarange",
    "s_farg_ddb": "cost, salvage, lifetime, period, [factor]",
    "s_farg_find": "string1, string2, [start]",
    "s_farg_fv": "rate, n, payment, [pv, [paytype]]",
    "s_farg_hlookup": "value, range, row, [rangelookup]",
    "s_farg_iffunc": "logical-expression, true-value, [false-value]",
    "s_farg_index": "range, rownum, colnum",
    "s_farg_irr": "range, [guess]",
    "s_farg_tc": "text, count",
    "s_farg_log": "value, base",
    "s_farg_match": "value, range, [rangelookup]",
    "s_farg_mid": "text, start, length",
    "s_farg_nper": "rate, payment, pv, [fv, [paytype]]",
    "s_farg_npv": "rate, value1, value2, ...",
    "s_farg_pmt": "rate, n, pv, [fv, [paytype]]",
    "s_farg_pv": "rate, n, payment, [fv, [paytype]]",
    "s_farg_rate": "n, payment, pv, [fv, [paytype, [guess]]]",
    "s_farg_replace": "text1, start, length, text2",
    "s_farg_vp": "value, [precision]",
    "s_farg_valpre": "value, precision",
    "s_farg_csl": "cost, salvage, lifetime",
    "s_farg_cslp": "cost, salvage, lifetime, period",
    "s_farg_subs": "text1, oldtext, newtext, [occurrence]",
    "s_farg_sumif": "range1, criteria, [range2]",
    "s_farg_hms": "hour, minute, second",
    "s_farg_txt": "text",
    "s_farg_vlookup": "value, range, col, [rangelookup]",
    "s_farg_weekday": "date, [type]",
    "s_farg_dt": "date",
    "s_farg_rangen": "range1, range2, ...",
    "s_farg_vsig": "value, [significance]",
    "function_classlist": [
        "all",
        "stat",
        "lookup",
        "datetime",
        "financial",
        "test",
        "math",
        "text",
        "gui",
        "action"
    ],
    "s_fclass_all": "All",
    "s_fclass_stat": "Statistics",
    "s_fclass_lookup": "Lookup",
    "s_fclass_datetime": "Date & Time",
    "s_fclass_financial": "Financial",
    "s_fclass_test": "Test",
    "s_fclass_math": "Math",
    "s_fclass_text": "Text",
    "lastone": null
};







function translation() {
    if (navigator.language == "zh-CN") {
        for (var k in zh_CN) {
            SocialCalc.Constants[k] = zh_CN[k];
        }
    }
}


module.exports = function (slice) {
  var has_init = false; // Initial flags, 'code' can only be updated after init
  var spreadsheet = {}; // declare spreadsheet obj for current spreadsheet slice
  var expolre_mode = false;
  SocialCalc.ConstantsSetImagePrefix('socialcalc/images/sc_');

  // translation must done before create an instance of SocialCalc.SpreadsheetControl
  translation();
  spreadsheet = window.spreadsheet = new SocialCalc.SpreadsheetControl();

  //----------------------------------------------------
  //单元格颜色不同值预警信息 和 单元格绑定跳转看板信息 存储
  //----------------------------------------------------
  spreadsheet.cellBind = {
  colorRangeData:[],//color range data (coord, opt[])
  dashboardData:[],//cell link to dashboard ({coord:dashboard_id})
  cellMerge:[],//Merge cell of same values(coord)
  freeze:''//freeze panes information
  }



    //----------------------------------------------------
    //根据URL判断当前页面模式
    //----------------------------------------------------
    expolre_mode = true;

  //----------------------------------------------------
  //电子表格编辑模式
  //----------------------------------------------------
  if (expolre_mode) {

    // Initialize the Spreadsheet Control and display it
    $('body').html('<div id="calceditor" style="margin:0px 0px 0px 0px;">editor goes here</div>');
    spreadsheet.InitializeSpreadsheetControl('calceditor');
    spreadsheet.sheet.ResetSheet();
    spreadsheet.ExecuteCommand('redisplay', '');
    $('#freezeSelect').on('change',spreadsheet,freezeInfoBind)

  } else {
    spreadsheet.editor.ignoreRender = true;

  }




  // StatusCallback when sheet changed
  spreadsheet.editor.StatusCallback.CalcTable = {
    func: sheetChangeCallback
  };


    //----------------------------------------------------
    //store freeze information to spreadsheet
    //----------------------------------------------------
    function freezeInfoBind(event){
        var val = $(event.target).find('option:selected').val();
        var $nameSpan = $(event.target).siblings('.freezeSplitCellName')
        if(val == 0){
            event.data.cellBind.freeze = '';
            $nameSpan.text('')
        }else if(val == 1){
            event.data.cellBind.freeze = 'row';
            $nameSpan.text('row')
        }else if(val == 2){
            event.data.cellBind.freeze = 'col';
            $nameSpan.text('col')
        }else if(val == 3){
            event.data.cellBind.freeze = event.data.editor.ecell.coord;
            $nameSpan.text(event.data.editor.ecell.coord)
        }

        /* save data of cellBind */
        var cellBindDom = $('#cellbind')[0];
        if(cellBindDom){
            cellBindDom.value = JSON.stringify(spreadsheet.cellBind)
        }

    }

  //----------------------------------------------------
  //rewriting 【Edit】 tab 【onclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.edit].onclick = function (s) {
     console.log('access edit')

         var div = document.getElementById(s.idPrefix+"formulabar-div");
         div.style.display = "block";

         $('#freezeSelect').on('change',s,freezeInfoBind)

  }


  //----------------------------------------------------
  //rewriting 【Edit】 tab 【unonclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.edit].onunclick = function (s) {
     console.log('edit exit')

         var div = document.getElementById(s.idPrefix+"formulabar-div");
         div.style.display = "none";

  }



  //----------------------------------------------------
  //rewriting 【binddata】 tab 【onclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.binddata].onclick = function (s) {
    document.getElementById(s.idPrefix+"binddatacell").innerHTML = s.editor.ecell.coord;
    var  range;
    if (s.editor.range.hasrange) {
               range = SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top) + ":" +
               SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
               console.log(range)
               alert('You have chosen a range, the program will select the last cell!')
    }
/*       document.getElementById(s.idPrefix+"binddatasave").value = SocialCalc.LocalizeString("Save to")+": "+s.editor.ecell.coord;
       document.getElementById(s.idPrefix+"rangedatasave").value = SocialCalc.LocalizeString("Save to")+": "+s.editor.ecell.coord;
       document.getElementById(s.idPrefix+"binddashboardsave").value = SocialCalc.LocalizeString("Save to")+": "+s.editor.ecell.coord;*/

    var slistDom  = $('#SocialCalc-binddataslist'),
        dataTypeDom = $('#SocialCalc-binddatatype'),
        dashboardBindBox = $('#SocialCalc-dashboardBindBox');

    var isBindData = false;


    var currentCell = s.editor.ecell.coord,
        currentCellDataValue ='',
        currentCellValueType ='',
        currentCellValue ='';

        if(spreadsheet.sheet.cells[spreadsheet.editor.ecell.coord]){
          currentCellDataValue = spreadsheet.sheet.cells[spreadsheet.editor.ecell.coord]["datavalue"];
           if(currentCellDataValue && isNaN(currentCellDataValue)){
             if(currentCellDataValue.charAt(0).indexOf('^')!= -1 || currentCellDataValue.charAt(0).indexOf('!')!= -1 || currentCellDataValue.charAt(0).indexOf('$')!= -1){
               isBindData = true;
               switch(currentCellDataValue.charAt(0))
                {
                   case "^":
                    currentCellValueType = 'row'
                   break;
                   case "!":
                    currentCellValueType = 'column'
                   break;
                   case "$":
                    currentCellValueType = 'single'
                   default:
                     console.log('No bind data')
                }
              currentCellValue = currentCellDataValue.substring(1)
            }
           }
        }



    var init_data = function(sData){



          slistDom.empty();
          slistDom.append('<option selected>'+ SocialCalc.LocalizeString("choose") +'</option>')

         if(sData)
         {
           //if(Object.prototype.toString.call(sData)  === '[object Array]' && sData.length!= 0){//extended data
             if(sData.length > 1)
             {//extended data

                dataTypeDom.find("option[value=0]").remove();
                $.each(Object.getOwnPropertyNames(sData[0]),function(i,v){
                   slistDom.append('<option value="' + v + '">'+ "[" + v + "]" +'</option>')//
                })
               if(isBindData){
                  if(currentCellValueType == 'row'){
                    dataTypeDom.find("option[value=1]").attr("selected",true)
                  }else if(currentCellValueType == 'column'){
                    dataTypeDom.find("option[value=2]").attr("selected",true)
                  }

                  $.each(slistDom.find('option'),function(i,e){
                      if($(e).val() == currentCellValue){
                        $(e).attr("selected",true)
                      }
                   })

                //slistDom.find('option[value='+ currentCellValue +']').attr("selected",true)
               }


               //} else if(Object.prototype.toString.call(sData)  === '[object Object]' && !$.isEmptyObject(sData)){//single data
             }
             else if(sData.length ==1)//single data
             {
                dataTypeDom.find("option[value=1]").remove();
                dataTypeDom.find("option[value=2]").remove();
                $.each(sData[0],function(k,v){
                  slistDom.append('<option value="'+ k +'">'+ k +'</option>')
                })
                 if(isBindData){
                   $.each(slistDom.find('option'),function(i,e){
                      if($(e).val() == currentCellValue){
                        $(e).attr("selected",true)
                      }
                   })

                   //slistDom.find('option[value='+ currentCellValue +']').attr("selected",true)
                 }
               $('#SocialCalc-ismerge').hide()
             }
             else
             {
                 alert('data format error!')
             }
         }
         else
         {
             alert('No data!')


         }
    }

      $.getJSON("testData/data.js",function(result){
          init_data(result)
          s.sheetDataMap = result
      })


     if(s.cellBind.cellMerge.length > 0 && s.cellBind.cellMerge.indexOf(s.editor.ecell.coord) != -1){
            $('#SocialCalc-ismerge').prop('checked',true)
     }else{
            $('#SocialCalc-ismerge').prop('checked',false)
     }


     var  excelRcData=[];
     if(s.cellBind.colorRangeData.length > 0)
     {
         $.each(s.cellBind.colorRangeData,function(i,e){
            if(e.coord == s.editor.ecell.coord){
                 excelRcData = e.opt;
              }
         })
      }
     ReactDOM.render(
        <RangeAndColorComponent excelRcData={excelRcData} />,
        document.getElementById('rangeBox')
      );


      $.getJSON("testData/dashboardData.js",function(data) {
          var dashboardData = [],
              dashboardList = [];

          for (var key in data.dashboard_list) {
              var obj = {"text": data.dashboard_list[key], "id": key}
              dashboardList.push(obj)
          }

          if (s.cellBind.dashboardData.length > 0) {
              $.each(s.cellBind.dashboardData, function (i, e) {
                  if (e.coord == s.editor.ecell.coord) {
                      dashboardData = e.opt;
                  }
              })
          }
          ReactDOM.render(
          < BindDashboardBox
          dashboardData = {dashboardData}
          dashboardList = {dashboardList}
          />,
          document.getElementById('dashboardBindBox')
      )
          ;

      })

  }


  //----------------------------------------------------
  //Bind data to cell
  //----------------------------------------------------
  $('#SocialCalc-binddatas-savecell').on('click',function(){
    /* Declare some variables for the following function */


    /* cell data */
          var currentSelectedCell = spreadsheet.editor.ecell.coord; //e.g. A1
          var curCell = spreadsheet.sheet.cells[currentSelectedCell];//get cell's object
          var curDataKey = $("#SocialCalc-binddataslist option:selected").attr('value');//key or [key]
          var type = $("#SocialCalc-binddatatype option:selected").attr('value');// 0(single cell) 1(row extend) or 2(column extend)
          var typeStr =["$","^","!"]
          var isFixedValue = false;//是否是一个固定值

          var isMerge = $('#SocialCalc-ismerge').prop('checked');//当绑定的数据为扩展数据并且扩展的数据值都一致时，是否合并单元格


          if(curCell && curCell.datavalue &&
          curCell.datavalue.toString().indexOf('^') == -1 &&
          curCell.datavalue.toString().indexOf('!') == -1 &&
          curCell.datavalue.toString().indexOf('$') == -1
          ){
            isFixedValue = true;//是一个固定值
          }

          if(!curDataKey && !isFixedValue){
           alert('Please select a data key!')
           return false
          }



          if(curCell && curDataKey)
          {
             curCell.datavalue = typeStr[type]+curDataKey;
             curCell.displaystring = typeStr[type]+curDataKey;
             curCell.datatype = 't';
             curCell.valuetype = 't';
          }
          else if(!curCell && curDataKey)
          {
             spreadsheet.sheet.cells[currentSelectedCell] = new SocialCalc.Cell(currentSelectedCell);
             spreadsheet.sheet.cells[currentSelectedCell].datavalue = typeStr[type]+curDataKey;
             spreadsheet.sheet.cells[currentSelectedCell].displaystring = typeStr[type]+curDataKey;
             spreadsheet.sheet.cells[currentSelectedCell].datatype = 't';
             spreadsheet.sheet.cells[currentSelectedCell].valuetype = 't';
           }


           if(isMerge && spreadsheet.cellBind.cellMerge.indexOf(currentSelectedCell) == -1){
             spreadsheet.cellBind.cellMerge.push(currentSelectedCell)
           }else if(!isMerge && spreadsheet.cellBind.cellMerge.indexOf(currentSelectedCell) != -1){
             spreadsheet.cellBind.cellMerge.splice(spreadsheet.cellBind.cellMerge.indexOf(currentSelectedCell),1)
           }

    /* colorRange */


      rangeDataSave()

    /* dashboard bind */

      bindDashboardSave()

    /* save data of cellBind */
       var cellBindDom = $('#cellbind')[0];
       if(cellBindDom){
         cellBindDom.value = JSON.stringify(spreadsheet.cellBind)
       }

    /* reset  */
       //spreadsheet.sheet.ResetSheet();
       spreadsheet.ParseSheetSave(spreadsheet.CreateSheetSave())
       //spreadsheet.ExecuteCommand('redisplay', '');
       spreadsheet.ExecuteCommand('recalc', '');
       SocialCalc.SetTab(spreadsheet.tabs[0].name)

    })

  function rangeDataSave(){

       var coord = spreadsheet.editor.ecell.coord,
           isExist =false,
           existNum = -1,
           range = $('#rangeBlock'),
            range_comp =$('#rangeBlock').find('.color-range-comp'),
             e_lt = range_comp.find('.value-lt'),
             e_lg = range_comp.find('.value-lg'),
             e_fColor = range_comp.find('.range-color'),
             e_bgColor = range_comp.find('.range-color-bg'),
           dataObj = {coord:coord,opt:[]};

           $.each(spreadsheet.cellBind.colorRangeData,function(i,e){
               if(e.coord == coord){
                  isExist =true;
                  existNum =i;
               }
           })

         if(!isExist && range_comp.length == 1)
          {
                dataObj.opt.push({lt:e_lt.val(),lg:e_lg.val(),fColor:e_fColor.val(),bgColor:e_bgColor.val()})
                spreadsheet.cellBind.colorRangeData.push(dataObj)

          }
         else if(isExist && range_comp.length == 1)
          {

                dataObj.opt.push({lt:e_lt.val(),lg:e_lg.val(),fColor:e_fColor.val(),bgColor:e_bgColor.val()})
                spreadsheet.cellBind.colorRangeData.splice(existNum,1,dataObj)

          }
         else if(!isExist && range_comp.length > 1)
          {

                 $.each(range_comp,function(i,e)
                 {
                     if(e_lt[i].value && e_lg[i].value && (e_fColor[i].value || e_bgColor[i].value)){

                         dataObj.opt.push({lt:e_lt[i].value,lg:e_lg[i].value,fColor:e_fColor[i].value,bgColor:e_bgColor[i].value})

                     } else {
                         alert('Please enter the full interval value')
                         return
                     }
                 })
                  spreadsheet.cellBind.colorRangeData.push(dataObj)
          }
         else if(isExist && range_comp.length > 1)
          {
                 $.each(range_comp,function(i,e)
                  {
                      if(e_lt[i].value && e_lg[i].value && (e_fColor[i].value || e_bgColor[i].value)){

                          dataObj.opt.push({lt:e_lt[i].value,lg:e_lg[i].value,fColor:e_fColor[i].value,bgColor:e_bgColor[i].value})

                       } else {
                          alert('Please enter the full interval value')
                          return
                       }
                  })
             spreadsheet.cellBind.colorRangeData.splice(existNum,1,dataObj)
          }
         else if(!isExist && range_comp.length == 0)
          {
            console.log('No colorRange data is saved')
          }
         else if(isExist && range_comp.length == 0)
          {
          spreadsheet.cellBind.colorRangeData.splice(existNum,1)
          }


  }

   function bindDashboardSave(){
     var coord = spreadsheet.editor.ecell.coord;
     var obj ={"coord":coord,"opt":[]}
     var dashboardBox =  $("#dashboardBindBox");
     var dashboardItem = dashboardBox.find(".dashboardItem");
     var isExist =false,
         existNum = -1;
     $.each(spreadsheet.cellBind.dashboardData,function(i,e){
                  if(e.coord == coord){
                   isExist =true;
                   existNum =i;
                 }
      })

     var singleDashboard = function(){
             var dashboard_id = dashboardBox.find(".dashboardItem").find(".dashboardMultiSel").select2('data')[0].id,
              dashboard_txt = dashboardBox.find(".dashboardItem").find(".dashboardMultiSel").select2('data')[0].text;
              if(!dashboard_id){
                alert('Please choose a dashboard ')
                return
              }




          var optItem = {"dashboard_id":dashboard_id,"dashboard_txt":dashboard_txt}
          obj.opt.push(optItem)

     }
     var multipleDashboard = function(){

            $.each(dashboardItem,function(i,e){
             var dashboard_id = $(e).find(".dashboardMultiSel").select2('data').id,
                 dashboard_txt = $(e).find(".dashboardMultiSel").select2('data').text;


                if(!dashboard_id){
                  alert('Please choose a dashboard ')
                  return
                }


             var optItem = {"dashboard_id":dashboard_id,"dashboard_txt":dashboard_txt}
              obj.opt.push(optItem)
           })

     }
     if(isExist){
          if(dashboardItem.length == 1)
          {
                singleDashboard()
                spreadsheet.cellBind.dashboardData.splice(existNum,1,obj)
          }
          else if(dashboardItem.length > 1)
          {
               multipleDashboard()
               spreadsheet.cellBind.dashboardData.splice(existNum,1,obj)
          }
          else if(dashboardItem.length == 0)
          {
               spreadsheet.cellBind.dashboardData.splice(existNum,1)
          }
     }else{
          if(dashboardItem.length == 1)
          {
                singleDashboard()
                spreadsheet.cellBind.dashboardData.push(obj)
          }
          else if(dashboardItem.length > 1)
          {
               multipleDashboard()
               spreadsheet.cellBind.dashboardData.push(obj)
          }
          else if(dashboardItem.length == 0)
          {
              console.log('No dashboardBind  data is saved')
          }
     }


   }




  //----------------------------------------------------
  //rewriting 【binddata】 tab 【onunclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.binddata].onunclick = function (s) {
     console.log('exit binddata')
      ReactDOM.unmountComponentAtNode(document.getElementById('rangeBox'))
      ReactDOM.unmountComponentAtNode(document.getElementById('dashboardBindBox'))
  }

  //----------------------------------------------------
  //rewriting 【plain】 tab 【onclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.plain].onclick = function (s) {

       s.editCode = s.CreateSheetSave();// save edit state code, and used to restore the edit state
       s.editCellBind = JSON.parse(JSON.stringify(s.cellBind));//save edit state cellBind data, and used to restore the edit state
       switchingData(s)//switching data to real data
       cellColorAlarm(s)// Values show different colors in different ranges


       $('#export_xlsx').on('click','',s,exportXlsx) //binding export event to button


       s.ParseSheetSave(s.CreateSheetSave())
       s.ExecuteCommand('recalc', '');

      $(spreadsheet.views.plain.element).height(200).width(500).css({'overflow':'initial'})
      $(spreadsheet.views.plain.element).html(
          '<div id="spreadsheet_slice">'+
          '<div class="spreadsheet-tool">'+
          '<span type="button" class="spreadsheet-export"><i class="fa fa-share-square-o" title="导出"></i></span>'+
          '</div>'+
          '<div class="spreadsheet-outbox"><div class="spreadsheet-container">'+spreadsheet.CreateSheetHTML()+'</div></div>'+
          '</div>'
      );
      var $spreadsheetSliceDom = $('#spreadsheet_slice');
      $spreadsheetSliceDom.on('click','.spreadsheet-export',spreadsheet,exportXlsx) //binding export event to each spreadsheet slice
      var scHeight =   $(spreadsheet.views.plain.element).height() - $spreadsheetSliceDom.find('.spreadsheet-tool').height();
      $spreadsheetSliceDom.find('.spreadsheet-container').height(scHeight);

      //frozen rows or columns
      if(spreadsheet.cellBind.freeze){
          $spreadsheetSliceDom.find('.spreadsheet-outbox').css({'position':'relative','overflow':'hidden'}).parents('.slice_container').css({"overflow":"hidden"})
          var tempAttribs = JSON.parse(JSON.stringify(spreadsheet.sheet.attribs));//Temporary storage of lastcol and lastrow


          if(spreadsheet.cellBind.freeze == 'row'){//freeze first row
              spreadsheet.sheet.attribs.lastrow = 1;
              spreadsheet.sheet.freeze = 'row';
              $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_row">'+spreadsheet.CreateSheetHTML()+'</div>')
              spreadsheet.sheet.attribs.lastrow = tempAttribs.lastrow;//restore attribs
          }else if(spreadsheet.cellBind.freeze == 'col'){//freeze first column
              spreadsheet.sheet.attribs.lastcol = 1;
              spreadsheet.sheet.freeze = 'col';
              $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_col">'+spreadsheet.CreateSheetHTML()+'</div>')
              spreadsheet.sheet.attribs.lastcol = tempAttribs.lastcol;//restore attribs
          }  else  {//freeze split
              var left_col =  spreadsheet.coordToCr(spreadsheet.cellBind.freeze).col - 1,//The number of columns on the left side of the the cell
                  left_row =  spreadsheet.coordToCr(spreadsheet.cellBind.freeze).row - 1;//The number of rows on the top side of the the cell

              if(left_col != 0 && left_row != 0){//columns and rows need to be frozen




                  spreadsheet.sheet.attribs.lastrow = left_row;
                  spreadsheet.sheet.freeze = 'row';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_row">'+spreadsheet.CreateSheetHTML()+'</div>')

                  spreadsheet.sheet.attribs.lastrow = tempAttribs.lastrow;//restore lastrow
                  spreadsheet.sheet.attribs.lastcol = left_col;
                  spreadsheet.sheet.freeze = 'col';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_col">'+spreadsheet.CreateSheetHTML()+'</div>')

                  spreadsheet.sheet.attribs.lastcol = tempAttribs.lastcol


              }

              if(left_col != 0 && left_row == 0){//Only the column needs to be frozen
                  spreadsheet.sheet.attribs.lastrow = left_col;
                  spreadsheet.sheet.freeze = 'col';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_column">'+spreadsheet.CreateSheetHTML()+'</div>')
              }

              if(left_col == 0 && left_row != 0){//Only the row needs to be frozen
                  spreadsheet.sheet.attribs.lastcol = left_row;
                  spreadsheet.sheet.freeze = 'row';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="freeze_row">'+spreadsheet.CreateSheetHTML()+'</div>')
              }
          }

          // bind event(scroll) for frozen
          $spreadsheetSliceDom.find('.spreadsheet-container').on('scroll',function(){
              var beforeTop = $(this).scrollTop(),
                  beforeLeft = $(this).scrollLeft();
              $(this).scroll(function() {
                  var afterTop = $(this).scrollTop(),
                      afterLeft = $(this).scrollLeft();
                  ;
                  if (beforeTop!=afterTop) {
                      //console.log('上下');
                      $(this).find('.freeze_col').css({"top":-afterTop,"z-index":"0"})
                      $(this).find('.freeze_row').css({'left':-afterLeft,"z-index":"1"})
                      beforeTop = afterTop;
                  };
                  if (beforeLeft!=afterLeft) {
                      // console.log('左右');
                      $(this).find('.freeze_row').css({'left':-afterLeft,"z-index":"0"})
                      $(this).find('.freeze_col').css({'top':-afterTop,"z-index":"1"})
                      beforeLeft = afterLeft;
                  };
              });
          });

      }



  }




  //----------------------------------------------------
  //rewriting 【plain】 tab 【onunclick】 events
  //----------------------------------------------------
  spreadsheet.tabs[spreadsheet.tabnums.plain].onunclick = function (s) {
       s.plainCode = s.CreateSheetSave();
       console.log(s.plainCode)

       s.cellBind = s.editCellBind;
       s.sheet.ResetSheet();
       s.ParseSheetSave(s.editCode)
       s.ExecuteCommand('recalc', '');
       $('#export_xlsx').off('click')

    }








function sheetChangeCallback(editor, status, arg) {
  if (status !== 'doneposcalc') {
    return;
  }


   var savestr = spreadsheet.CreateSheetSave();
  var code_ctl = $("#code")[0];

  if (code_ctl) {
    code_ctl.value = savestr;
  }
}



  function onRefresh() {

  }

  function onResize() {
    if (expolre_mode) {
/*      spreadsheet.requestedHeight = slice.container.height() - 24;
      spreadsheet.requestedWidth = slice.container.width();*/
      spreadsheet.DoOnResize();
    }else{

    }
  }




  function onSuccess(json){

      spreadsheet.sheetDataMap = json.data.records
      spreadsheet.ParseSheetSave(json.form_data.code);
      if(json.form_data.cellbind != ''){
       spreadsheet.cellBind = JSON.parse(json.form_data.cellbind)
      }

      switchingData(spreadsheet)// parse ! ^ $ to real data
      cellColorAlarm(spreadsheet)// highlight the cell color accord to the cell's value

      spreadsheet.ParseSheetSave(spreadsheet.CreateSheetSave())



      $(spreadsheet.views.plain.element).html(
      '<div id="spreadsheet_slice">'+
      '<div class="spreadsheet-tool">'+
      '<span type="button" class="spreadsheet-export"><i class="fa fa-share-square-o" title="导出"></i></span>'+
      '</div>'+
      '<div class="spreadsheet-outbox"><div class="spreadsheet-container">'+spreadsheet.CreateSheetHTML()+'</div></div>'+
      '</div>'
      );
      var $spreadsheetSliceDom = $('#spreadsheet_slice');
          $spreadsheetSliceDom.on('click','.spreadsheet-export',spreadsheet,exportXlsx) //binding export event to each spreadsheet slice
      var scHeight =   $(spreadsheet.views.plain.element).height() - $spreadsheetSliceDom.find('.spreadsheet-tool').height();
          $spreadsheetSliceDom.find('.spreadsheet-container').height(scHeight);

      //frozen rows or columns
      if(spreadsheet.cellBind.fix){
            $spreadsheetSliceDom.find('.spreadsheet-outbox').css({'position':'relative','overflow':'hidden'}).parents('.slice_container').css({"overflow":"hidden"})

            if(spreadsheet.cellBind.fix == 'row'){//Fix first row
                  spreadsheet.sheet.attribs.lastrow = 1;
                  spreadsheet.sheet.fix = 'row';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_row">'+spreadsheet.CreateSheetHTML()+'</div>')
            }else if(spreadsheet.cellBind.fix == 'col'){//fix first column
                  spreadsheet.sheet.attribs.lastcol = 1;
                  spreadsheet.sheet.fix = 'col';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_col">'+spreadsheet.CreateSheetHTML()+'</div>')
            }  else  {//fix split
              var left_col =  spreadsheet.coordToCr(spreadsheet.cellBind.fix).col - 1,//The number of columns on the left side of the the cell
                  left_row =  spreadsheet.coordToCr(spreadsheet.cellBind.fix).row - 1;//The number of rows on the top side of the the cell

                 if(left_col != 0 && left_row != 0){//columns and rows need to be frozen
                    var tempAttribs = JSON.parse(JSON.stringify(spreadsheet.sheet.attribs));



                  spreadsheet.sheet.attribs.lastrow = left_row;
                  spreadsheet.sheet.fix = 'row';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_row">'+spreadsheet.CreateSheetHTML()+'</div>')

                  spreadsheet.sheet.attribs.lastrow = tempAttribs.lastrow;//restore lastrow
                  spreadsheet.sheet.attribs.lastcol = left_col;
                  spreadsheet.sheet.fix = 'col';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_col">'+spreadsheet.CreateSheetHTML()+'</div>')



                 }

                 if(left_col != 0 && left_row == 0){//Only the column needs to be frozen
                  spreadsheet.sheet.attribs.lastrow = left_col;
                  spreadsheet.sheet.fix = 'col';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_column">'+spreadsheet.CreateSheetHTML()+'</div>')
                 }

                 if(left_col == 0 && left_row != 0){//Only the row needs to be frozen
                  spreadsheet.sheet.attribs.lastcol = left_row;
                  spreadsheet.sheet.fix = 'row';
                  $spreadsheetSliceDom.find('.spreadsheet-container').append('<div class="fix_row">'+spreadsheet.CreateSheetHTML()+'</div>')
                 }
            }

            // bind event(scroll) for frozen
            $spreadsheetSliceDom.find('.spreadsheet-container').on('scroll',function(){
                var beforeTop = $(this).scrollTop(),
				     beforeLeft = $(this).scrollLeft();
                $(this).scroll(function() {
                    var afterTop = $(this).scrollTop(),
					    afterLeft = $(this).scrollLeft();
					;
                    if (beforeTop!=afterTop) {
                        //console.log('上下');
					   $(this).find('.fix_col').css({"top":-afterTop,"z-index":"0"})
                       $(this).find('.fix_row').css({'left':-afterLeft,"z-index":"1"})
                        beforeTop = afterTop;
                    };
                    if (beforeLeft!=afterLeft) {
                       // console.log('左右');
					   $(this).find('.fix_row').css({'left':-afterLeft,"z-index":"0"})
                       $(this).find('.fix_col').css({'top':-afterTop,"z-index":"1"})
                        beforeLeft = afterLeft;
                    };
                });
            });

          }

      //dashboard bind to cell

/*        var cellBindDashboards = spreadsheet.cellBind.dashboardData;
        if(cellBindDashboards && cellBindDashboards.length > 0){
           $.each(cellBindDashboards,function(i,e){

               var $cellDom = $spreadsheetSliceDom.find('.spreadsheet-container #cell_'+e.coord);
                    //cellDom =  $('#spreadsheet_' + json.form_data.slice_id +' .spreadsheet-container #cell_'+e.coord),


                   $cellDom.append('<div id="dashboardSelectPanel_slice_'+ e.coord +'" class="dashboardSelectPanel"></div>')

               var $dashboardSelectPanelDom = $('#dashboardSelectPanel_slice_'+ e.coord)

                   ReactDOM.render(
                       <DashboardSelectPanel data={e.opt} dashboardedit_mode={dashboardedit_mode}/>,
                       document.getElementById('dashboardSelectPanel_slice_'+ e.coord)
                   );

                 $dashboardSelectPanelDom.append('<i class="fa fa-close"></i>')

                 $cellDom.on('click',function(e){

                     if($(e.target).parents('.dashboardSelectPanel').length > 0){
                       return
                      }

                    $('.dashboardSelectPanel').hide()

                    var dashboards = {"dashboard_ids":[]}
                    var _this = $(this);


                    _this.find('.dashboardSelectPanel ul li a').each(function(i,e){
                      dashboards.dashboard_ids.push($(e).attr('data-id'))
                    })

                     $.ajax({
                       type: "POST",
                       url: "/dashboardmodelview/get_dashboard_bindinfo/",
                       contentType: "application/json",
                       dataType: "json",
                       data: JSON.stringify(dashboards),
                       success: function (res) {
                         console.log(res.data)
                         _this.find('.dashboardSelectPanel ul li a').each(function(i,e){
                              var dataId = $(e).attr('data-id');
                              var tabName;

                              for (var k in res.data){
                                  if(dataId == k){
                                  var nodeName = res.data[k];
                                      if(nodeName.indexOf('/')>0){
                                          nodeName = nodeName.split('/');
                                          tabName = nodeName[nodeName.length-2];
                                      }else {
                                          tabName = nodeName
                                      }

                                 }
                            }

                            $(e).attr('data-name',tabName)

                         })


                       }
                     });

                    $(this).find('.dashboardSelectPanel').show()
                 })
                 $dashboardSelectPanelDom.on('click','i.fa-close',function(e){

                         if (e && e.stopPropagation) {
                              e.stopPropagation();
                             }
                             else
                             {
                              window.event.cancelBubble = true;
                              return false;
                             }
                        $(this).parent('.dashboardSelectPanel').hide();
                 })


            })
        }*/


  }










  return {
    render: onRefresh,
    resize: onResize,
    success: onSuccess,

  };
};




