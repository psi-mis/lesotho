
function Util() {}

Util.CONTROL_VALUE = "WebApp v 0.3";


//-------------------------------------------------------------------
// Utils INPUT Tags



Util.getInputTag = function( attributeId )
{
	return $("[attributeId='" + attributeId + "']");
};


Util.disableTag = function( tag, isDisable )
{
	tag.prop( 'disabled', isDisable);
	
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		if( element.prop( "tagName" ) == 'SELECT' || element.prop( "tagName" ) == 'INPUT' || element.prop( "tagName" ) == 'BUTTON' )
		{
			if( isDisable )
			{
				element.css( 'background-color', '#FAFAFA' ).css( 'cursor', 'auto' );
				if( element.prop( "tagName" ) == 'BUTTON' && element.find("span").length > 0  )
				{
					element.find("span").css( 'color', 'gray' );
				}
				else
				{
					element.css( 'color', 'gray' );
				}
			}
			else
			{
				element.css( 'background-color', 'white' ).css( 'cursor', '' ).css( 'color', '' );
				if( element.prop( "tagName" ) == 'BUTTON' && element.find("span").length > 0  )
				{
					element.find("span").css( 'color', '' );
				}
			}
		}
	}
};


Util.readonlyTag = function( tag )
{
	Util.disableTag( tag, true );
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		element.attr( 'isReadOnly', true );
	}
};

Util.setAutoCompleteTag = function( selectTag )
{
	selectTag.hide();
	
	// Remove the [Please select] option
	selectTag.find("option[value='']").remove();
	
    selected = selectTag.children(":selected");
    var value = selected.val() ? selected.val() : "";
    var text = selected.text() ? selected.text() : "";
    var wrapper = $("<span>").addClass("ui-combobox").insertAfter(selectTag);
    
	var input = $("<input>").appendTo(wrapper).val( text );
	input.attr( "mandatory", selectTag.attr("mandatory") );
	
	input.addClass( "form-control" );
    input.autocomplete( {
        delay: 0,
        minLength: 2,
        source: function(request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            response( selectTag.children("option").map(function() {
                var text = $(this).text();
                var value = $(this).val();
                if ( this.value && (!request.term || matcher.test(text))) return {
                    label: text,
                    value: text,
                    option: this
                };
            }));
        },
        select: function ( event, ui ) {	
    	  ui.item.option.selected = true;
    	  selectTag.val( ui.item.option.value );
    	  selectTag.change();
        },
        focus: function(event, ui) {
        	$(this).val(ui.item.label);
        	return false;
        },
        change: function( event, ui ) {
        	 if (!ui.item) {
                 var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
                     valid = false;
                 selectTag.children("option").each(function() {
                     if ($(this).text().match(matcher)) {
                         this.selected = valid = true;
                         return false;
                     }
                 });
                 if (!valid) {
                     // remove invalid value, as it didn't match anything
                     $(this).val("");
                     selectTag.val("");
                     input.data("autocomplete").term = "";
                     return false;
                 }
             }
        }
    } ).addClass( 'ui-widget' );

    input.data( 'ui-autocomplete' )._renderItem = function ( ul, item ) {
        return $( '<li></li>' )
            .data( 'item.autocomplete', item )
            .append( '<a>' + item.label + '</a>' )
            .appendTo( ul );
    };

    var wrapper = this.wrapper = $( '<span style="width:200px">' )
        .addClass( 'ui-combobox' )
        .insertAfter( input );

    var button = $( '<a style="width:20px; margin-bottom:1px; height:20px;">' )
        .attr( 'tabIndex', -1 )
        .appendTo( wrapper )
        .button( {
            icons: {
                primary: 'ui-icon-triangle-1-s'
            },
            text: false
        } )
        .addClass( 'small-button' )
        .click( function () {
            if ( input.autocomplete( 'widget' ).is( ':visible' ) ) {
                input.autocomplete( 'close' );
                return;
            }
            $( this ).blur();
            input.autocomplete( 'search', '' );
            input.focus();
        } );
}

//-------------------------------------------------------------------
// Utils - FORM
//-------------------------------------------------------------------


Util.disableForm = function( tag, isDisable )
{
	var inputTags = tag.find("input,select,button");
	inputTags.each( function(){
		if( $(this).attr( 'isReadOnly' ) == undefined )
		{
			Util.disableTag( $(this), isDisable);
		}
	});
}


Util.resetForm = function( formTag )
{
	formTag.find("input[type='hidden']").val("");
	formTag.find("input[type='text']:enabled,select:enabled,textarea").val("");
	formTag.find("input[type='checkbox']").prop("checked", false);
	formTag.find( "span.errorMsg" ).remove();
};

Util.resetPageDisplay = function()
{
	$("div.mainContent").hide();
	$("span.errorMsg").remove();
};


Util.getCheckedInputValues = function( formTag )
{
	var checkedVals = formTag.find('input:checkbox:checked').map(function() {
	    return this.value;
	}).get();
	
	return checkedVals;
};

Util.getCheckedInputTexts = function( formTag )
{
	var checkedTexts = formTag.find('input:checkbox:checked').map(function() {
	    return $(this).closest("tr").find("td:nth-child(1)").find("span").html();
	}).get();
	
	return checkedTexts;
};

// Generate JSON data in client form / event form

Util.getArrayJsonData = function( key, formTag, isGetEmptyValue )
{
	var jsonData = [];
	formTag.find("input[" + key + "],select[" + key + "],textarea[" + key + "]").each(function(){
		var item = $(this);
		var attrId = item.attr(key);
		var value = item.val();
		
		if( item.attr("type") == "checkbox" )
		{
			if( item.prop("checked") )
			{
				value = "true";
			}
			else
			{
				value = "";
			}
		}
		else if( item.tagName == "TEXTAREA" )
		{
			value = item.html();
		}
		
		if( value != null && value !== "" )
		{
			if( item.attr("isDate") !== undefined && item.attr("isDate") == "true" && value != "" )
			{
				if( item.attr("isMonthYear") === "true" )
				{
					value = "01 " + value;
				}
				
				value = Util.formatDate_DbDate( value );
			}
			else if( item.attr("isDateTime") !== undefined && item.attr("isDateTime") == "true" && value != "" )
			{
				value = Util.formatDate_DbDate( value );
			}
			
			var data = {};
			data[key] = attrId;
			data["value"] = value;
			//data["value"] = encodeURI(value);
			
			jsonData.push(data);
		}		
	});
	
	return jsonData;
};


//-------------------------------------------------------------------
// Utils - List
//-------------------------------------------------------------------

Util.findItemFromList = function( listData, searchProperty, searchValue )
{
	var foundData;

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			foundData = item;
			return false;
		}
	});

	return foundData;
};

Util.findAndReplaceItemFromList = function( listData, searchProperty, searchValue, replacedData )
{
	var found = false;
	
	// Found item, replace a new one
	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			listData[i] = JSON.parse( JSON.stringify( replacedData ) );
			found = true;
		}
	});

	// Not found item, add a new one
	if( !found )
	{
		listData[listData.length] = replacedData;
	}
};


Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	$.each( list, function( i, item )
	{
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			return false;
		}
	});

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return index;
};

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.sortDescByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? 1 : ( ( x > y ) ? -1 : 0 ) );
	});
};


//-------------------------------------------------------------------
// Utils - Strings


Util.trim = function( input )
{
	return input.replace( /^\s+|\s+$/gm, '' );
};

Util.isNumberDigit = function( input )
{
	return /^\d+$/.test( input );
};

Util.startsWith = function( fullVal, val )
{
	return ( fullVal.indexOf( val ) == 0 );
};

Util.highlightWords = function( data, search )
{
	var searchExp = (search + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");	
	return data.replace( new RegExp( "(" + searchExp + ")" , 'gi' ), "<span style=\"background-color:yellow\">$1</span>" );
};


Util.formatNumber = function( value ){
	var floorVal = Math.floor( value );
	var ceilVal = Math.ceil( value );
	
	if( floorVal == ceilVal )
	{
		return floorVal;
	}
	
	return value;
};


Util.calculateAge = function( birthDateStr )
{
	var today = new Date();
    var birthDate = new Date( birthDateStr );
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if ( m < 0 || ( m === 0 && today.getDate() < birthDate.getDate() ) ) 
    {
        age--;
    }
    return age;
};


//-------------------------------------------------------------------
// Utils URL

Util.getURLParameterByName = function( url, name )
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


Util.addUrlParam = function( key, val )
{
	var search = document.location.search;
	
	var newParam = key + '=' + val,
	params = '?' + newParam;

	// If the "search" string exists, then build params from it
	if (search) {
		// Try to replace an existance instance
		params = search.replace(new RegExp('([?&])' + key + '[^&]*'), '$1' + newParam);

		// If nothing was replaced, then add the new param to the end
		if (params === search) {
			params += '&' + newParam;
		}
	}
	
	document.location.pathname + params;
};


//-------------------------------------------------------------------
// Date Utils


Util.MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Util.DAYS = ["Sunday", "Monday", "Tuesday", "Webnesday", "Thursday", "Friday", "Saturday"];
Util.MONTH_INDEXES = {"Jan" : "01", "Feb" : "02", "Mar" : "03", "Apr" : "04", "May" : "05", "Jun" : "06", "Jul" : "07", "Aug" : "08", "Sep" : "09", "Oct" : "10", "Nov" : "11", "Dec" : "12"};


/** 
 * Result : 2017-01-30
 * **/
Util.getCurrentDate = function()
{
	var date = Util.getLastNDate( 0 );
	
	var day = date.getDate();
	day = ( day < 10 ) ? "0" + day : day;
	
	var month = date.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var year = date.getFullYear();
	
	return year + "-" + month + "-" + day;
};

/** 
 * Result : 2017-01-30 10:30
 * **/
Util.getCurrentDateTime = function()
{
	var date = Util.getLastNDate( 0 );
	
	var day = date.getDate();
	day = ( day < 10 ) ? "0" + day : day;
	
	var month = date.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var year = date.getFullYear();
	
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	
	return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
};


/** 
 * Get a past date object from a special date 
 * Param  : dateStr ( '2017-01-02' )
 * Result : Object Date( converted from server time to local time )
 * **/
Util.getLastXDateFromDateStr = function( dateStr, noDays )
{
	var date = Util.convertUTCDateToLocalDate( dateStr );
    date.setDate( date.getDate() - noDays );
    
    return date;
};


/** 
 * Get a past date object from a special date
 * Params : dateStr ( '2017-01-02' )
 * 		   The number of days in the past
 * Result : 17 Jan 2017 ( converted from server time to local time )
 * **/
Util.formatDate_LastXDateFromDateStr = function( dateStr, noDays )
{  
    return Util.formatDateObj_DisplayDate( Util.getLastXDateFromDateStr( dateStr, noDays ) );
};


/** 
 * Get a past date object from current date
 * Params : A number
 * Result : Date object( converted from local time to UTM time )
 * **/
Util.getLastNDate = function( noDays )
{
	var date = new Date();
    date.setDate( date.getDate() - noDays );
    
    return Util.convertLocalTimeToUTM( date );
};


/** 
 * Get a string past date from current date ( UTM time (
 * Params : A number
 * Result : Date object( converted from local time to UTM time )
 * **/
Util.formatDate_LastNDate = function( noDays )
{
	var date = new Date();
    date.setDate(date.getDate() - noDays);
    
    return Util.formatDate_DisplayDateInWeek( Util.convertLocalTimeToUTM(date) );
};



/** 
 * dateStr : Date Object
 * Result : Sunday, Jan 31
 * **/
Util.formatDate_DisplayDateInWeek = function( date )
{
	var month = date.getMonth();
	var dayInWeek = date.getDay();		
	var dayInMonth = date.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	return Util.DAYS[dayInWeek] + ", " + Util.MONTHS[month] + " " + dayInMonth;
};


/** 
 * Convert date from UTC time to local time
 * dateStr : A UTC time date string ( 2017-01-02 )
 * Result : 02 Jan 2017 ( local time )
 * **/
Util.formatDate_DisplayDate = function( dateStr )
{
	var date = Util.convertUTCDateToLocalDate( dateStr );
	
	var year = date.getFullYear();
	var month = date.getMonth()
	var dayInMonth = date.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	return dayInMonth + " " + Util.MONTHS[month] + " " + year;
};


/** 
 * dateStr : 2017-01-02
 * Result : 02 Jan 2017
 * **/
Util.formatDate_LocalDisplayDate = function( localDateStr )
{
	var year = localDateStr.substring( 0, 4 );
	var month = eval( localDateStr.substring( 5,7 ) ) - 1;
	var day = localDateStr.substring( 8, 10 );
	
	var formattedDateStr = day + " " + Util.MONTHS[month] + " " + year;
	if( localDateStr.length > 10 )
	{
		var hours = localDateStr.substring( 11,13 );
		var minutes = localDateStr.substring( 14, 16 );
		var seconds = localDateStr.substring( 17, 19 );
		formattedDateStr += " " + hours + ":" + minutes + ":" + seconds;
	}
	return formattedDateStr;
};


/** 
 * dateStr : 2017-01-02
 * Result : Jan 2017
 * **/
Util.formatDate_LocalDisplayMonthYear = function( localDateStr )
{
	var year = localDateStr.substring( 0, 4 );
	var month = eval( localDateStr.substring( 5,7 ) ) - 1;
	var day = localDateStr.substring( 8, 10 );
	
	return Util.MONTHS[month] + " " + year;
};


/** Convert a date from server UTM time to local time
 * dateStr : "2017-02-07T09:56:10.298"
 * Result : 07 Feb 2017 09:56
 * **/
Util.formatDate_DisplayDateTime = function( dateStr, showSeconds )
{
	var date = Util.convertUTCDateToLocalDate( dateStr );
	
	var year = date.getFullYear();
	var month = date.getMonth();
	
	var dayInMonth = date.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	var hours = date.getHours();
	hours = ( hours < 10 ) ? "0" + hours : "" + hours;
	
	var minutes = date.getMinutes();
	minutes = ( minutes < 10 ) ? "0" + minutes : "" + minutes;
	
	var seconds = "";
	if( showSeconds ){
		seconds = date.getSeconds();
		seconds = ( seconds < 10 ) ? "0" + seconds : "" + seconds;
	}
	
	
	return dayInMonth + " " + Util.MONTHS[month] + " " + year + " " + hours + ":" + minutes + ":" + seconds;
};


/** 
 * dateObj : "2017-02-07T09:56:10.298"
 * Result : 07 Feb 2017 09:56
 * **/
Util.formatDateObj_DisplayDate = function( dateObj )
{	
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth();
	
	var dayInMonth = dateObj.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	return dayInMonth + " " + Util.MONTHS[month] + " " + year;
};

/** 
 * dateObj : "2017-02-07T09:56:10.298"
 * Result : 07 Feb 2017 09:56
 * **/
Util.formatDateObj_DisplayDateTime = function( dateObj )
{	
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth();
	
	var dayInMonth = dateObj.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	var hours = date.getHours();
	hours = ( hours < 10 ) ? "0" + hours : "" + hours;
	
	var minutes = date.getMinutes();
	minutes = ( minutes < 10 ) ? "0" + minutes : "" + minutes;
	
	var seconds = date.getSeconds();
	seconds = ( seconds < 10 ) ? "0" + seconds : "" + seconds;
	
	return dayInMonth + " " + Util.MONTHS[month] + " " + year + " " + hours + ":" + minutes + ":" + seconds;;
};

/** 
 * dateStr : "2017 Jan 07"
 * Result : 2017-01-07
 * **/
Util.formatDate_DbDate = function( dateStr )
{
	var day = dateStr.substring(0,2);
	var month = Util.MONTH_INDEXES[dateStr.substring(3,6)];
	var year = dateStr.substring(7,11);
	
	var formattedDateStr = year + "-" + month + "-" + day;
	
	if( dateStr.length > 11 )
	{
		var hours = dateStr.substring( 12,14 );
		var minutes = dateStr.substring( 15, 17 );
		var seconds = dateStr.substring( 18, 20 );
		formattedDateStr += "T" + hours + ":" + minutes + ":" + seconds;
	}
	
	return formattedDateStr;
};

/** 
 * dateStr : "2017-03-04 13:19:05.0"
 * Result : "13:19" ( local time )
 * **/
Util.formatTimeInDateTime = function( dateTimeStr )
{
	var date = Util.convertUTCDateToLocalDate( dateTimeStr );
	var hours = date.getHours();
	var minutes = date.getMinutes();

	var subfix = "";
	if( hours > 12 )
	{
		hours = ( hours - 12 );
		subfix = "pm";
	}
	else if( hours == 12 && minutes > 0 )
	{
		subfix = "pm";
	}
	else
	{
		subfix = "am";
	}

	hours = ( hours < 10 ) ? "0" + hours : "" + hours;
	minutes = ( minutes < 10 ) ? "0" + minutes : "" + minutes;
	
	return hours + ":" + minutes + " " + subfix;
};

Util.convertUTCDateToLocalDate = function( serverdate ) {
	var year = serverdate.substring( 0, 4 );
	var month = eval( serverdate.substring( 5,7 ) ) - 1;
	var day = eval( serverdate.substring( 8, 10 ) );
	
	var hour = "00";
	var minute = "00";
	var second = "00";
	if( serverdate.length > 10 )
	{
		hour = serverdate.substring( 11, 13);
		minute = serverdate.substring( 14, 16 );
		second = serverdate.substring( 17, 19 );
	}

	var date = new Date( year, month, day, hour, minute, second );
	
	var newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    
    return newDate;
};


Util.convertLocalTimeToUTM = function( localDate )
{
	var newDate = new Date(localDate);
    newDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    return newDate;
}  

Util.getDaysTimeElapsed = function( date1, date2 )
{
	var diff = date2.valueOf() - date1.valueOf();
	var diffInHours = Math.floor( diff/1000/60/60 ); // Convert milliseconds to hours
	
	var noDays = Math.floor( diffInHours/24 );
	noDays = ( noDays < 10 ) ? "0" + noDays : noDays;
	
	var noHours = diffInHours - ( 24 * noDays ); 
	noHours = ( noHours < 10 ) ? "0" + noHours : noHours;
	
	return noDays + "d " + noHours + "h";
};


Util.getDaysElapsed = function( date1, date2 )
{
	var diff = date2.valueOf() - date1.valueOf();
	var diffInHours = Math.floor( diff/1000/60/60 ); // Convert milliseconds to hours
	
	var noDays = Math.floor( diffInHours/24 );
	
	return noDays;
};


Util.getTimeElapsed = function( date1, date2 )
{
	var diff = date2.valueOf() - date1.valueOf();
	
	var noHours = Math.floor( diff/1000/60/60 ); // Convert milliseconds to hours
	var noSeconds = Math.floor( ( diff - ( noHours * 1000*60*60 ))/1000/60 );
	
	noHours = ( noHours < 10 ) ? "0" + noHours : noHours;
	noSeconds = ( noSeconds < 10 ) ? "0" + noSeconds : noSeconds;
	
	return noHours + ":" + noSeconds;
};

Util.getMonthsBetweenDates = function( d1, d2 )
{
	var months;
    months = ( d2.getFullYear() - d1.getFullYear() ) * 12;
    months = months + d2.getMonth() - d1.getMonth();
    return months <= 0 ? 0 : months;
};

Util.convertDateStrToObject = function( dateStr )
{
	var year = dateStr.substring( 0, 4 );
	var month = eval( dateStr.substring( 5,7 ) ) - 1;
	var day = eval( dateStr.substring( 8, 10 ) );
	
	return new Date( year, month, day );
}

/** 
 * dateObj : Date Object
 * Result : 2017-01-02
 * **/
Util.convertDateObjToStr = function( dateObj )
{	
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : "" + month;
	
	var dayInMonth = dateObj.getDate();
	dayInMonth = ( dayInMonth < 10 ) ? "0" + dayInMonth : dayInMonth;
	
	return year + "-" + month + "-" + dayInMonth;
};


Util.datePicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,maxDate: new Date()
		,ignoreReadonly: true
        ,showClear: true
     });
	 
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
	
};


// Date FOR pass and future
Util.freeDatePicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,ignoreReadonly: true
        ,showClear: true
     });
	 
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
	
};

Util.monthYearPicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.monthYearFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,maxDate: new Date()
		,ignoreReadonly: true
        ,showClear: true
     });
		 
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
};

Util.dateFuturePicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,ignoreReadonly: true
	    ,showClear: true
     });
	
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
};


Util.dateFutureOnlyPicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,minDate: new Date()
		,ignoreReadonly: true
        ,showClear: true
     });
	
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
		  
};

Util.dateTimePicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateTimeFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,maxDate: new Date()
		,ignoreReadonly: true
        ,showClear: true
     });
	 
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
	
};

Util.dateTimeFuturePicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateTimeFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,ignoreReadonly: true
	    ,showClear: true
     });
	
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
};

Util.dateTimeFutureOnlyPicker = function( dateTag )
{
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateTimeFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,minDate: new Date()
		,ignoreReadonly: true
        ,showClear: true
     });
	
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
		  
};


Util.datePickerStartEnd = function( dateTag, startDateStr, endDateStr )
{
	var startDate = Util.convertDateStrToObject( startDateStr );
	var endDate = Util.convertDateStrToObject( endDateStr );
	
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,maxDate: startDate
		,minDate: endDate
		,ignoreReadonly: true
        ,showClear: true
     });
	 
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
	
};

Util.dateTimePicker = function( dateTag )
{	
	dateTag.attr( "readonly", true );
	
	dateTag.datetimepicker({
		viewMode: 'years'
        ,format: Commons.dateFormat
        ,widgetPositioning: { 
            vertical: 'bottom'
        }
		,ignoreReadonly: true
	    ,showClear: true
     });
	
	dateTag.on('dp.change', function(e){ 
		dateTag.change();
	});
};


Util.datePicker_SetDateRange = function( dateTag, startDateStr, endDateStr )
{
	var startDate = Util.convertDateStrToObject( startDateStr );
	dateTag.data("DateTimePicker").minDate( startDate );
	
	var endDate = Util.convertDateStrToObject( endDateStr );
	dateTag.data("DateTimePicker").maxDate( endDate );
};

//-------------------------------------------------------------------------------------
// Utils Periods


Util.getCurrentWeekPeriod = function() {
	return Util.getWeekIdx( new Date() );
};

Util.getWeekIdx = function( date ) {
	var onejan = new Date(date.getFullYear(), 0, 1);
    var weekIdx =  Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    
    return date.getFullYear() + "W" + weekIdx;
};

Util.getCurrentMonthPeriod = function() {
	var date = new Date();
	
	var month = date.getMonth();
	month = ( month < 10 ) ? "0" + month : month + "";
	
	return date.getFullYear() + month;
};

Util.getCurrentQuarterly = function( reportPeriodList )
{
	var period = "";
	for( var i in reportPeriodList )
	{
		if( reportPeriodList[i].indexOf("Q") )
		{
			period = reportPeriodList[i];
		}
	}
	
	return period;
};

// Get data from JSON FILE
Util.getAttributeValue = function( list, propertyName, id )
{
	var found = Util.findItemFromList( list, propertyName, id );
	return ( found !== undefined ) ? found.value : "";
};

Util.setHideTag = function( tab, hidden )
{
	var rowTag = tab.closest("tr");
	rowTag.attr( "alwaysHide", true );
	if( hidden )
	{
		rowTag.hide();
	}
	else
	{
		rowTag.show();
	}
};

//=====================================================================================
// FormBlock Utils
//=====================================================================================

function FormBlock() {}

FormBlock.block = function( block, msg, cssSetting, tag )
{
	var msgAndStyle = { message: msg, css: cssSetting };

	if ( tag === undefined )
	{
		if ( block ) $.blockUI( msgAndStyle );
		else $.unblockUI();
	}
	else
	{
		if ( block ) tag.block( msgAndStyle );
		else tag.unblock();
	}
}


//=====================================================================================
//FormBlock Utils
//=====================================================================================

function MsgManager() {}

MsgManager.cssBlock_Body = { 
	border: 'none'
	,padding: '15px'
	,backgroundColor: '#000'
	,'-webkit-border-radius': '10px'
	,'-moz-border-radius': '10px'
	,opacity: .5
	,color: '#fff'
	,width: '200px'
};


// --- Messaging ---
MsgManager.divMsgAreaTag;
MsgManager.spanMsgAreaCloseTag;
MsgManager.btnMsgAreaCloseTag;
MsgManager.spanMsgAreaTextTag;
MsgManager.dialogFormTag;

MsgManager.initialSetup = function()
{
	MsgManager.divMsgAreaTag = $( '#divMsgArea' );
	MsgManager.spanMsgAreaCloseTag = $( '#spanMsgAreaClose' );
	MsgManager.btnMsgAreaCloseTag = $( '#btnMsgAreaClose' );
	MsgManager.spanMsgAreaTextTag = $( '#spanMsgAreaText' );
	MsgManager.dialogFormTag = $( '#dialogForm' );
	


	MsgManager.btnMsgAreaCloseTag.click( function()
	{
		MsgManager.divMsgAreaTag.hide( 'fast' );
	});
};

MsgManager.appBlock = function( msg )
{
	if (  msg === undefined ) msg = "Processing..";

	FormBlock.block( true, msg, MsgManager.cssBlock_Body );
};

MsgManager.appUnblock = function()
{
	FormBlock.block( false );
};

MsgManager.msgAreaShow = function( msg, status )
{
	MsgManager.divMsgAreaTag.hide( 'fast' );
	MsgManager.spanMsgAreaTextTag.text( '' );

	MsgManager.spanMsgAreaTextTag.text( msg );
	MsgManager.divMsgAreaTag.show( 'medium' );
	
	if( status === undefined )
	{
		MsgManager.divMsgAreaTag.css("background-color", "#eee" );
	}
	else if( status === "ERROR" )
	{
		MsgManager.divMsgAreaTag.css("background-color", "#f2dede" );
	}
	else if( status === "SUCCESS" )
	{
		MsgManager.divMsgAreaTag.css("background-color", "#dff0d8" );
	}
};

MsgManager.msgAreaHide = function()
{
	MsgManager.divMsgAreaTag.hide( 'fast' );
};


MsgManager.showDialogForm = function( msg ){
	MsgManager.dialogFormTag.html( msg );
	MsgManager.dialogFormTag.dialog({
		title: 'Setting Form',
		maximize: true,
		closable: true,
		modal: true,
		width: 400,
		height: 200,
		buttons: [ 
          { 
              text: "Ok",
              class: 'btn btn-default', 
              click: function() {
            	  $(this).dialog("close"); 
              } 
          }
      ]
	}).show();
};
	

	