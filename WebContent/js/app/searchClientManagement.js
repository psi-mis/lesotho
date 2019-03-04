
function SearchClientManagement( _mainPage, _metaData, _appPage )
{
	var me = this;
	
	me.mainPage = _mainPage;
	me.metaData = _metaData;
	me.appPage = _appPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.validationObj = me.mainPage.validationObj;
	me.inputTagGeneration;
	
	// Search Form	
	me.searchClientFormTag = $("#searchClientForm");
	me.searchClientBtnTag = $("#searchClientBtn");
	me.searchResultTag = $("#searchResult");
	me.searchResultTbTag = $("#searchResultTb");
	me.searchResultKeyTag = $("#searchResultKey");
	me.searchMatchResultKeyTag = $("#searchMatchResultKey");
	me.searchResultOptionsTag = $("#searchResultOptions");
	me.seachAddClientFormTag = $("#seachAddClientForm");
	me.backToSearchClientResultBtnTag = $("[name=backToSearchClientResultBtn]");
	me.searchResultHeaderTag = $("#searchResultHeader");
	me.showAddNewClientFormTag = $("#showAddNewClientForm");
	me.backToSearchClientFormTag = $("#backToSearchClientForm");
	me.showTodayCaseTag = $("#showTodayCase");
	
	// Ids
	me.attr_DoB = me.mainPage.settingsManagement.attr_DoB;
	me.attr_DistrictOB = me.mainPage.settingsManagement.attr_DistrictOB;
	me.attr_FirstName = me.mainPage.settingsManagement.attr_FirstName;
	me.attr_LastName = me.mainPage.settingsManagement.attr_LastName;
	me.attr_BirthOrder = me.mainPage.settingsManagement.attr_BirthOrder;
	me.attr_HIVEventDate = me.mainPage.settingsManagement.attr_HIVEventDate;
	    
	me.searchClientAttributeIds = [me.attr_DoB, me.attr_DistrictOB, me.attr_FirstName, me.attr_LastName, me.attr_BirthOrder];
	
	// ----------------------------------------------------------------------------
	// Init method
	// ----------------------------------------------------------------------------
	
	me.init = function()
	{
		me.inputTagGeneration = new InputTagGeneration();
	
		me.createSearchClientForm();
		
		me.setUp_Events();
		
		// Not allow coordinator to add a new client
		if( me.appPage == Commons.APPPAGE_COORDINATOR )
		{
			me.searchResultKeyTag.hide();
			me.showAddNewClientFormTag.hide();
		}
		
	};
	
	// ----------------------------------------------------------------------------
	// Add Events for [Search Client Form]
	// ----------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{
		// Back to [Search Client Result]
		
		me.backToSearchClientResultBtnTag.click(function(){
			MsgManager.msgAreaHide();
			me.mainPage.clientFormManagement.addClientFormDivTag.hide();
			me.mainPage.clientFormManagement.selectOrgUnitWarningMsgTag.hide();
			me.searchResultTbTag.show();
			me.searchResultTag.show();
		});
			
		// Add Datepicker to date fields
			
		me.seachAddClientFormTag.find("[isDate='true']").each(function(){
			Util.datePicker($(this));
		});
		
		// Search Result buttons
				
		me.showAddNewClientFormTag.click( function(){
			me.mainPage.clientFormManagement.showAddClientForm();
		});

		me.backToSearchClientFormTag.click( function(){
			Util.resetPageDisplay();
			me.showSearchClientForm();
		});
		
		me.showTodayCaseTag.click( function(){
			me.mainPage.listManagement.listTodayCases();
		});
				
		// Call [Search clients] function
		
		me.searchClientBtnTag.click(function(e){
			e.preventDefault();
			
			var clientData = Util.getArrayJsonData( "attribute", me.searchClientFormTag );
			var requestData = { "attributes": clientData };
			
			if( requestData.attributes.length == 0 )
			{
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_validation_requiredValueInOneField" );
				MsgManager.msgAreaShow( tranlatedText, "ERROR" );
				alert( tranlatedText );
				MsgManager.appUnblock();
			}
			else
			{
				MsgManager.msgAreaHide();
				me.runSearchClients();
			}
			
		});

		me.seachAddClientFormTag.find("input,select").keyup(function(e){
			if ( e.keyCode === 13 ) {
				e.preventDefault();
				me.runSearchClients();
			}
		});
		
		
		// Validation for fields in [Search Client] form
		
		me.seachAddClientFormTag.find("input,select").change(function(){
			
			if( $(this).val() != "" )
			{
				MsgManager.msgAreaHide();
			}
		});
		
		
		me.setUp_validationCheck( me.seachAddClientFormTag.find( 'input,select' ) );
			
		
	};
	
	me.setUp_validationCheck = function( tags )
	{
		tags.change( function() {
			me.validationObj.checkValidations( $(this) );
		});
	};
	
	
	// ----------------------------------------------------------------------------
	// Create INPUT fields for [Search Client Form]
	// ----------------------------------------------------------------------------
	
	me.createSearchClientForm = function()
	{
		var attrGroups = me.metaData.attGroups.programSections;
		
		for( var i in attrGroups )
		{
			var attrList = attrGroups[i].programTrackedEntityAttribute;
			for( var j in attrList )
			{
				var attribute = attrList[j];
				for( var k in me.searchClientAttributeIds )
				{
					if( attribute.id == me.searchClientAttributeIds[k] )
					{
						var inputTag = me.inputTagGeneration.generateInputTag( attribute, "attribute" );
						
						var fieldTag = $("<div class='form-group'></div>");
						fieldTag.append("<label for='" + attribute.id + "' class='col-sm-2 control-label' style='font-weight:300'>" + attribute.shortName + "</label>");
						var fieldInputTag = $( "<div class='col-sm-10'></div>" );
						fieldInputTag.append( inputTag );
						fieldTag.append( fieldInputTag );
						
						me.seachAddClientFormTag.append( fieldTag );
					}
				}
			}
		}
		
		// Remove all of mandatory attribute for all fields
		me.seachAddClientFormTag.find("input,select").removeAttr("mandatory");
		me.validationObj.setUp_isNumberOnly_OlderBrowserSupport( me.seachAddClientFormTag );
		
		// set validation for firstName and lastName
		me.getAttributeField( me.attr_FirstName ).attr( "notAllowSpecialChars", true );
		me.getAttributeField( me.attr_LastName ).attr( "notAllowSpecialChars", true );
		
		
		var dobTag = me.seachAddClientFormTag.find( "input[attribute='" + me.attr_DoB + "']" );
		dobTag.attr( "readonly", true );
	

		// Remove the 'mandatory' SPAN from the Search table
		me.seachAddClientFormTag.find("span.required").remove();
		
	};	

	
	// ---------------------------------------------------------------------------------------------------------------
	// Search Client
	// ---------------------------------------------------------------------------------------------------------------
	
	me.runSearchClients = function( exeFunc )
	{
		if( me.validationObj.checkFormEntryTagsData( me.searchClientFormTag ) )
		{
			Commons.checkSession( function( isInSession ) {
				if ( isInSession ) {
					var clientData = Util.getArrayJsonData( "attribute", me.searchClientFormTag );
					var requestData = {
						"attributes": clientData
					};
					
					if( requestData.attributes.length > 0 && me.validationObj.checkFormEntryTagsData( me.searchClientFormTag ) )
					{
						me.searchResultTbTag.find("tbody").html("");
						me.backToSearchClientResultBtnTag.show();
						me.mainPage.listManagement.backToCaseListBtnTag.hide();
						
						me.searchClients( requestData, event, function( searchResult ){
							var searchCriteria = me.getSearchCriteria( me.searchClientFormTag );
							me.searchMatchResultKeyTag.html( searchCriteria );
							
							var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchResult_msg_add" );
							me.searchResultKeyTag.html( tranlatedText + " " + searchCriteria );
							
							var clientList = searchResult.listGrid.rows;
							if( clientList.length > 0 )
							{
								me.populateSearchClientData( clientList );
								me.highlightSearchMatches();
								me.showSearchClientTableResult();
							}
							else
							{
								me.showSearchClientNoResult();
							}
							
							if( exeFunc !== undefined ) exeFunc();
						} );
						
					}
					else if( requestData.attributes.length == 0 )
					{
						var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_validation_requiredValueInOneField" );
						alert( tranlatedText );
					}
				} else {
					me.mainPage.settingsManagement.showExpireSessionMessage();					
				}
			});
		}
		
	};
	
	me.populateSearchClientData = function( clientList )
	{		
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_rowTooltip" );
		
		for( var i in clientList )
		{
			var client = clientList[i];
			var clientId = client[0];
			var firstName = client[1].trim();
			var lastName = client[2].trim();
			
			var dob = client[3].trim();
			dob = ( dob != "" ) ? Util.formatDate_LocalDisplayDate( dob ) : "";
			
			var district = client[4].trim();
			if( district != "" ) {
				var optionText = me.searchClientFormTag.find("[attribute='" + me.attr_DistrictOB + "'] option[value='" + district + "']").text();
				district = ( optionText == "" ) ? district :  optionText;
			}
			
			var birthOrder = client[5].trim();
			if( birthOrder != "" ) {
				var optionText = me.searchClientFormTag.find("[attribute='" + me.attr_BirthOrder + "'] option[value='" + birthOrder + "']").text();
				birthOrder = ( optionText == "" ) ? birthOrder :  optionText;
			}
			
			var adquisition = client[6].trim();
			adquisition = ( adquisition != "" ) ? Util.formatDate_DisplayDate( adquisition ) : "";
			var lastTestNS = "";
			
			if( client[7] != null ) 
			{
				lastTestNS = client[7].trim();
				lastTestNS = ( lastTestNS != "" ) ? Util.formatDate_DisplayDate( lastTestNS ) : "";
			}
			
			var rowTag = $("<tr title='" + tranlatedText + "' clientId='" + clientId + "'></tr>");
			rowTag.append( "<td>" + firstName + "</td>" );
			rowTag.append( "<td>" + lastName + "</td>" );
			rowTag.append( "<td>" + dob + "</td>" );
			rowTag.append( "<td>" + district + "</td>" );
			rowTag.append( "<td>" + birthOrder + "</td>" );
			rowTag.append( "<td>" + adquisition + "</td>" ); // The create date is the enrollement date
			rowTag.append( "<td>" + lastTestNS + "</td>" ); // The latest event date
			
			
			// -------------------------------------------------------------------
			// Add [Click] event for row
			// -------------------------------------------------------------------

			me.addEventForSearchResultRow( rowTag );
			
			me.searchResultTbTag.find("tbody").append( rowTag );
		}
		
	};
	
	me.highlightSearchMatches = function()
	{
		me.searchClientFormTag.find("input,select").each( function(){
			var value = $(this).val().toLowerCase();
			var colIdx = 0;
			if( value != "" )
			{
				var attributeId = $(this).attr( "attribute" );
				
				if( attributeId === me.attr_FirstName ){
					colIdx = 1;
				}
				else if( attributeId === me.attr_LastName ){
					colIdx = 2;
				}
				else if( attributeId === me.attr_DoB ){
					colIdx = 3;
				}
				else if( attributeId === me.attr_DistrictOB ){
					colIdx = 4;
					value = $(this).find("option:selected").text().toLowerCase();
				}
				else if( attributeId === me.attr_BirthOrder ){
					colIdx = 5;
					value = $(this).find("option:selected").text().toLowerCase();
				}
				
				me.searchResultTbTag.find('td:nth-child(' + colIdx + ')').each( function(){
					var colTag = $(this);
					if( colTag.html().toLowerCase().indexOf( value ) >= 0 )
					{
						var html = Util.highlightWords( colTag.html(), value );
						colTag.html( html );
					}
				});
			}
		});
	};
	
	// Add [Click] event for each row in search result
	
	me.addEventForSearchResultRow = function( rowTag )
	{
		rowTag.click(function(){
			me.mainPage.clientFormManagement.loadClientDetails( rowTag.attr("clientId") );
		});	
	};
	
	me.searchClients = function( jsonQuery, event, exeFunc )
	{
		var searchKey = ( me.appPage == Commons.APPPAGE_COORDINATOR ) ? "positive" : "all";
		
		$.ajax(
			{
				type: "POST"
				,url: "../client/search?searchType=" + searchKey
				,dataType: "json"
				,data: JSON.stringify( jsonQuery )
	            ,contentType: "application/json;charset=utf-8"
	            ,beforeSend: function( xhr ) {
	        		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_msg_searching" );
					MsgManager.appBlock( tranlatedText + " ..." );
	            }
				,success: function( response ) 
				{
					me.storageObj.addItem("page", me.mainPage.settingsManagement.PAGE_SEARCH_CLIENT_RESULT);
					me.storageObj.addItem("param", JSON.stringify( jsonQuery ) );
					exeFunc( response );
				}
				,error: function(response)
				{
					alert(response);
					console.log(response);
				}
			}).always( function( data ) {
				MsgManager.appUnblock();
			});
	};
	
	
	me.getAttributeField = function( attrId )
	{
		return me.seachAddClientFormTag.find("[attribute='" + attrId + "']");
	};
	

	// ---------------------------------------------------------------------------------------------------------------
	// Show/Hide form
	// ---------------------------------------------------------------------------------------------------------------
	
	me.showSearchClientForm = function()
	{	
		me.storageObj.addItem("page", me.mainPage.settingsManagement.PAGE_SEARCH_PARAM);
		me.searchResultTag.find("span.labelOpt").css("font-size","");		
		me.searchClientFormTag.show("fast");
	};

	me.resetSearchClientForm = function()
	{
		me.searchResultTag.find("span.labelOpt").css("font-size","");
		me.searchResultTag.find("input:radio:checked").attr("checked", false );
		me.searchClientFormTag.find("input,select").val("");
	};
	
	
	me.showSearchClientTableResult = function()
	{
		me.searchClientFormTag.hide();
		
		me.searchResultTbTag.css( "cursor", "pointer" );
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_optionTitle" );
		me.searchResultHeaderTag.html( tranlatedText );

		me.searchResultTbTag.show();
		me.searchResultTag.show("fast");
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------
	// Search messages
	// ---------------------------------------------------------------------------------------------------------------

	// Generate a message based on Client search criteria
	// Matches for [Med Rod, Measer, 10 Jan 2014, 01]
	me.getSearchCriteria = function( formTag )
	{
		var searchCriteria = "";
		
		var firstName = me.getAttributeField( me.attr_FirstName ).val();
		var lastName = me.getAttributeField( me.attr_LastName ).val();
		var districtOfBirthTag = me.getAttributeField( me.attr_DistrictOB ).find("option:selected");
		var dob = me.getAttributeField( me.attr_DoB ).val();
		var birthOrder = me.getAttributeField( me.attr_BirthOrder ).val();
		
		if( firstName != "" || lastName != "" ) {
			searchCriteria += $.trim( firstName + " " + lastName ) + " ";
		}
		else
		{
			var translatedText = me.translationObj.getTranslatedValueByKey( "searchResult_msg_client" );
			searchCriteria += translatedText;
		}
		
		
		if( districtOfBirthTag.val() != "" ) {
			var translatedText = me.translationObj.getTranslatedValueByKey( "searchResult_msg_bornAt" );
			searchCriteria +=  " " + translatedText + " " + districtOfBirthTag.text() + " ";
		}
		
		
		if( dob != "" )
		{
			var translatedText = me.translationObj.getTranslatedValueByKey( "searchResult_msg_on" );
			searchCriteria += translatedText + " " + dob + " ";
		}
		

		if( birthOrder != "" )
		{
			searchCriteria += " [" + birthOrder + "] ";
		}
		
		return searchCriteria.substring( 0, searchCriteria.length - 1 );
	};
	
	
	// Show the result after searching clients
	
	me.showSearchClientNoResult = function()
	{
		me.searchClientFormTag.hide();
		me.searchResultTbTag.hide();
		
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_noClientFound" );		
		me.searchResultHeaderTag.html( tranlatedText );
		
		me.searchResultTag.show("fast");
	};

	
	// ----------------------------------------------------------------------------
	// RUN Init method
	// ----------------------------------------------------------------------------
	
	me.init();
	
}