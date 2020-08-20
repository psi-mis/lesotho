
function SearchClientManagement( _mainPage, _metaData, _appPage )
{
	var me = this;
	
	me.mainPage = _mainPage;
	me.metaData = _metaData;
	me.appPage = _appPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.validationObj = me.mainPage.validationObj;
	me.clientFormManagementObj = me.mainPage.clientFormManagement;
	me.inputTagGeneration;
	
	// Ids
	me.attr_DoB = MetaDataID.attr_DoB;
	me.attr_DistrictOB = MetaDataID.attr_DistrictOB;
	me.attr_FirstName = MetaDataID.attr_FirstName;
	me.attr_LastName = MetaDataID.attr_LastName;
	me.attr_BirthOrder = MetaDataID.attr_BirthOrder;
	    
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
			Element.searchResultKeyTag.hide();
			Element.showAddNewClientFormTag.hide();
		}
		
	};
	
	// ----------------------------------------------------------------------------
	// Add Events for [Search Client Form]
	// ----------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{
		// Back to [Search Client Result]
		
		Element.backToSearchClientResultBtnTag.click(function(){
			MsgManager.msgAreaHide();
			Element.addClientFormDivTag.hide();
			Element.selectOrgUnitWarningMsgTag.hide();
			Element.searchResultTbTag.show();
			Element.searchResultTag.show();
			
			Element.searchResultRelationshipTbTag.hide();
		});
			
//		Element.backToSearchRelationshipClientResultBtnTag.click( function(){
//			MsgManager.msgAreaHide();
//			Element.addClientFormDivTag.hide();
//			Element.selectOrgUnitWarningMsgTag.hide();
//			Element.searchResultRelationshipTbTag.show();
//			Element.searchResultTag.show();
//		});
		
		// Add Datepicker to date fields
			
		Element.seachAddClientFormTag.find("[isDate='true']").each(function(){
			Util.datePicker($(this));
		});
		
		
		// Search client - Result buttons
				
		Element.showAddNewClientFormTag.click( function(){
			me.mainPage.clientFormManagement.showAddClientForm();
		});

		Element.backToSearchClientFormTag.click( function(){
			Util.resetPageDisplay();
			ClientUtil.setSearchClientStatus();
			me.showSearchClientForm();
		});
		
		Element.showTodayCaseTag.click( function(){
			me.mainPage.listManagement.listTodayCases();
		});
				

		// [Search relationship clients] - Result buttons

		Element.showAddNewRelationClientFormBtnTag.click( function(){
			
			me.showAddRelationshipFormDialog( true );
			
			Element.addRelationshipFormDivTag.find("[attribute]").each(function(){
				var attrId = $(this).attr("attribute");
				var value = Element.searchClientFormTag.find("[attribute='" + attrId + "']").val();
				if( value != "" )
				{
					$(this).val( value );
				}
			});
		});
		
		Element.backToSearchRelationshipResultBtnTag.click( function(){
			Element.searchResultTag.hide();
			Element.searchClientFormTag.show("fast");
		});

		Element.backToClientFormBtnTag.click( function(){
			Element.searchClientFormTag.hide();
			Element.searchResultTag.hide();
			Element.addClientFormDivTag.show("fast");
		});
		
		
		// Call [Search clients] function
		
		Element.searchClientBtnTag.click(function(e){
			e.preventDefault();
			
			var clientData = Util.getArrayJsonData( "attribute", Element.searchClientFormTag );
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
		

		Element.seachAddClientFormTag.find("input,select").keyup(function(e){
			if ( e.keyCode === 13 ) {
				e.preventDefault();
				me.runSearchClients();
			}
		});
		
		
		// Validation for fields in [Search Client] form
		
		Element.seachAddClientFormTag.find("input,select").change(function(){
			
			if( $(this).val() != "" )
			{
				MsgManager.msgAreaHide();
			}
		});
		
		
		me.setUp_validationCheck( Element.seachAddClientFormTag.find( 'input,select' ) );
			
		
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
			var attrList = attrGroups[i].trackedEntityAttributes;
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
						
						Element.seachAddClientFormTag.append( fieldTag );
					}
				}
			}
		}
		
		// Remove all of mandatory attribute for all fields
		Element.seachAddClientFormTag.find("input,select").removeAttr("mandatory");
		me.validationObj.setUp_isNumberOnly_OlderBrowserSupport( Element.seachAddClientFormTag );
		
		// set validation for firstName and lastName
		me.getAttributeField( me.attr_FirstName ).attr( "notAllowSpecialChars", true );
		me.getAttributeField( me.attr_LastName ).attr( "notAllowSpecialChars", true );
		
		
		var dobTag = Element.seachAddClientFormTag.find( "input[attribute='" + me.attr_DoB + "']" );
		dobTag.attr( "readonly", true );
	

		// Remove the 'mandatory' SPAN from the Search table
		Element.seachAddClientFormTag.find("span.required").remove();
		
	};	

	
	// ---------------------------------------------------------------------------------------------------------------
	// Search Client
	// ---------------------------------------------------------------------------------------------------------------
	
	me.runSearchClients = function( exeFunc )
	{
		if( me.validationObj.checkFormEntryTagsData( Element.searchClientFormTag ) )
		{
			Commons.checkSession( function( isInSession ) {
				if ( isInSession ) {
					var clientData = Util.getArrayJsonData( "attribute", Element.searchClientFormTag );
					var requestData = {
						"attributes": clientData
					};
					
					if( requestData.attributes.length > 0 && me.validationObj.checkFormEntryTagsData( Element.searchClientFormTag ) )
					{
						var searchResultTbTag = ClientUtil.getSearchResultTag();
						searchResultTbTag.find("tbody").html("");
						
						me.searchClients( requestData, event, function( searchResult ){
							var searchCriteria = me.getSearchCriteria( Element.searchClientFormTag );
							Element.searchMatchResultKeyTag.html( searchCriteria );
							
							var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchResult_msg_add" );
							Element.searchResultKeyTag.html( tranlatedText + " " + searchCriteria );
							
							var clientList = searchResult.listGrid.rows;
							if( clientList.length > 0 )
							{
								me.populateSearchClientData( clientList, searchResultTbTag );
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
	
	me.populateSearchClientData = function( clientList, searchReulstTag )
	{		
		me.resolveSearchResultTbHeader();
		
		var tranlatedText;
		var removedTEIs = []; // If the search result is "relation client" search, then remove exiting relationship client in search result
		if( ClientUtil.isSearchClientStatus() )
		{
			tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_rowTooltip" );
		}
		else
		{
			tranlatedText = me.translationObj.getTranslatedValueByKey( "searchRelationshipClient_result_rowTooltip" );
			
			removedTEIs = Object.keys( me.clientFormManagementObj.relationshipsObj.relationshipTEI_List );
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
			removedTEIs.push( jsonClient.trackedEntityInstance );
		}
		
		
		for( var i in clientList )
		{
			var client = clientList[i];
			var clientId = client[0];
			
			if( !removedTEIs.includes( clientId ) )
			{
				var firstName = client[1].trim();
				var lastName = client[2].trim();
				
				var dob = client[3].trim();
				dob = ( dob != "" ) ? Util.formatDate_LocalDisplayDate( dob ) : "";
				
				var district = client[4].trim();
				if( district != "" ) {
					var optionText = Element.searchClientFormTag.find("[attribute='" + me.attr_DistrictOB + "'] option[value='" + district + "']").text();
					district = ( optionText == "" ) ? district :  optionText;
				}
				
				var birthOrder = client[5].trim();
				if( birthOrder != "" ) {
					var optionText = Element.searchClientFormTag.find("[attribute='" + me.attr_BirthOrder + "'] option[value='" + birthOrder + "']").text();
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
				
				var rowTag = $("<tr title='" + tranlatedText + "' clientId='" + clientId + "' style='pointer:cursor;'></tr>");
				rowTag.append( "<td>" + firstName + "</td>" );
				rowTag.append( "<td>" + lastName + "</td>" );
				rowTag.append( "<td>" + dob + "</td>" );
				rowTag.append( "<td>" + district + "</td>" );
				rowTag.append( "<td>" + birthOrder + "</td>" );
				rowTag.append( "<td>" + adquisition + "</td>" ); // The create date is the enrollement date
				rowTag.append( "<td>" + lastTestNS + "</td>" ); // The latest event date
				
				// -------------------------------------------------------------------
				// Add [Click] event for row OR Add the relationship link 
				// -------------------------------------------------------------------
				if( ClientUtil.isSearchClientStatus() )
				{
					me.addEventForSearchResultRow( rowTag );
				}
				else
				{
					var translationLink = me.translationObj.getTranslatedValueByKey( "searchClient_result_link" );
					var linkColTag = $( "<td><a>" + translationLink + "</a></td>" );
					rowTag.append( linkColTag );
					
					me.showAddRelationshipForm( linkColTag, clientId );
				}
				
				searchReulstTag.find("tbody").append( rowTag );
			}
		}
		
	};
	
	me.resolveSearchResultTbHeader = function()
	{
		if( ClientUtil.isSearchClientStatus() )
		{
			Element.searchResultTbTag.find(".action").hide();
		}
		else
		{
			Element.searchResultTbTag.find(".action").show();
		}
	}
	
	me.showAddRelationshipForm = function( colTag, clientId )
	{
		var loadingMsg = me.translationObj.getTranslatedValueByKey( "relationship_add_loadingClientMsg" );
		
		ClientUtil.getDetails( clientId, loadingMsg, function( jsonData ){
			var titleTranslated = me.translationObj.getTranslatedValueByKey( "relationship_add_relationship" );
			
			colTag.click( function(){
				
				Util.resetForm( Element.addRelationshipFormDivTag );
				Util.disableForm( Element.addRelationshipFormDivTag, false );
				Util.populateDataValues( Element.addRelationshipFormDivTag, jsonData.client.attributes, "attribute" );
				
				var latestEnrollment = ClientUtil.getLatestEnrollment( jsonData.enrollments );
				if( latestEnrollment )
				{
					// Populate dataValue in [Add Relationship] FORM - 
					var testingEvent = ClientUtil.getLatestEvent( latestEnrollment.events, MetaDataID.stage_HIVTesting );
					var hivTestFinalStatus;
					
					if( testingEvent )
					{
						// Util.populateDataValues( Element.addRelationshipFormDivTag, testingEvent.dataValues, "dataElement" );
						var hivTestFinalStatusDV = Util.findItemFromList( testingEvent.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
						if( hivTestFinalStatusDV )
						{
							hivTestFinalStatus = hivTestFinalStatusDV.value;							
						}
					}
					
				}
				
				// Show [Add relationship] form
				me.showAddRelationshipFormDialog( false, clientId, hivTestFinalStatus );
			});
			
		} );
		
	}
	
	me.showAddRelationshipFormDialog = function( isAddNew, clientId, hivTestFinalStatus )
	{
		Element.addRelationshipFormDivTag.find( "[dataElement]" ).closest("tr").show();
		Element.addRelationshipFormDivTag.removeAttr( "clientId" );
		
		Element.addRelationshipFormDivTag.attr( "hivTestFinalStatus", hivTestFinalStatus );
		
		// Add some attributes
		if( clientId )
		{
			Element.addRelationshipFormDivTag.attr( "clientId", clientId );
		}
		
		// Disable some fields if the form is used for editting relationship.
		// Enable all fields if the form is used for adding relationship.
		if( isAddNew )
		{
			Util.resetForm( Element.addRelationshipFormDivTag );
			Util.disableForm( Element.addRelationshipFormDivTag, false );
			
			var hivStatus = Element.addRelationshipFormDivTag.find("[dataElement='" + MetaDataID.de_FinalResult_HIVStatus + "']");
			hivStatus.closest("tr").hide();
		}
		else
		{

			if( hivTestFinalStatus == "Positive" )
			{
				Element.addRelationshipFormDivTag.find( "[dataElement]" ).closest("tr").hide();
				Element.addRelationshipFormDivTag.find( "[dataElement='" + MetaDataID.de_RelationshipType + "']").closest("tr").show();
			}
			else
			{
				var hivStatus = Element.addRelationshipFormDivTag.find("[dataElement='" + MetaDataID.de_FinalResult_HIVStatus + "']");
				hivStatus.closest("tr").show();
			}
			
			for( var i=0; i<Relationships.addRelationShipFormIds.length; i++ )
			{
				var idConfig = Relationships.addRelationShipFormIds[i];
				if( idConfig.id == MetaDataID.de_FinalResult_HIVStatus )
				{
					var hivStatus = Element.addRelationshipFormDivTag.find("[dataElement='" + MetaDataID.de_FinalResult_HIVStatus + "']");
					hivStatus.closest("tr").show();
				}
				
				var inputTag = Element.addRelationshipFormDivTag.find("[" + idConfig.type + "='" + idConfig.id + "']");
				var disabled = ( idConfig.readOnly && inputTag.val() != "" );
				
				Util.disableTag( inputTag, disabled );
			}
		}
		
		
		// Show the form
		
		var titleTranslated = me.translationObj.getTranslatedValueByKey( "relationship_add_relationship" );
		
		Element.addRelationshipFormDivTag.dialog({
			title: titleTranslated
			,maximize: true
			,closable: true
			,modal: true
			,resizable: true
			,width: 700
			,height: 500
		}).show('fast' );
	}
	
	me.highlightSearchMatches = function()
	{
		Element.searchClientFormTag.find("input,select").each( function(){
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
				
				Element.searchResultTbTag.find('td:nth-child(' + colIdx + ')').each( function(){
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
			var clientId = rowTag.attr("clientId");
			
			Element.addClientFormTabTag.removeAttr( "client" );
			Element.backToSearchClientResultBtnTag.show();
			Element.backToCaseListBtnTag.hide();

			Element.headerListTag.attr("clientId", clientId );
			Element.relationshipMsgTag.hide();
			Element.relationshipMsgTag.find("[clientId]").remove();
			
			me.mainPage.clientFormManagement.loadClientDetails( clientId );
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
		return Element.seachAddClientFormTag.find("[attribute='" + attrId + "']");
	};
	

	// ---------------------------------------------------------------------------------------------------------------
	// Show/Hide form
	// ---------------------------------------------------------------------------------------------------------------
	
	me.showSearchClientForm = function()
	{	
		me.storageObj.addItem("page", me.mainPage.settingsManagement.PAGE_SEARCH_PARAM);
		Element.searchResultTag.find("span.labelOpt").css("font-size","");		
		Element.searchClientFormTag.show("fast");
	};

	me.resetSearchClientForm = function()
	{
		Element.searchResultTag.find("span.labelOpt").css("font-size","");
		Element.searchResultTag.find("input:radio:checked").attr("checked", false );
		Element.searchClientFormTag.find("input,select").val("");
	};
	
	
	me.showSearchClientTableResult = function()
	{
		Element.searchClientFormTag.hide();
		
		Element.searchResultTbTag.css( "cursor", "pointer" );
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_optionTitle" );
		Element.searchResultHeaderTag.html( tranlatedText );

		ClientUtil.getSearchResultTag().show();
		Element.searchResultTag.show("fast");
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
		Element.searchClientFormTag.hide();
		Element.searchResultTbTag.hide();
		
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "searchClient_result_noClientFound" );		
		Element.searchResultHeaderTag.html( tranlatedText );
		
		Element.searchResultTag.show("fast");
	};

	
	// ----------------------------------------------------------------------------
	// RUN Init method
	// ----------------------------------------------------------------------------
	
	me.init();
	
}