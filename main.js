var spreadsheet = require('./spreadsheet.js');
//import spreadsheet from './spreadsheet.js'

var s;
$(function(){
   spreadsheet()
   s  = spreadsheet();
})

$(window).resize(function() {
    s.resize()
});
