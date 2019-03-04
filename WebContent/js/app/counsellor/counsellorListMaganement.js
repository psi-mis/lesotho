

function CounsellorListMaganement( _mainPage  )
{
	var me = this;
	me.mainPage = _mainPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.clientFormManagement = me.mainPage.clientFormManagement;
	me.settingsManagement = me.mainPage.settingsManagement;
	
	
	// Today cases
	me.todayCaseListTag = $("#todayCaseList");
	me.todayCaseTblTag = $("#todayCaseTbl");
	me.listDateTag = $("#listDate");
	me.todayCaseFooterTag = $("#todayCaseFooter");
	me.todayCaseNumberTag = $("#todayCaseNumber");
	me.registerClientBtnTag = $("#registerClientBtn");
	
	
	// Previous cases
	me.previousCaseListTag = $("#previousCaseList");
	me.previousCaseTblTag = $("#previousCaseTbl");
	me.previousCaseFooterTag = $("#previousCaseFooter");
	me.previousCaseNumberTag = $("#previousCaseNumber");
	
	
	// Positive cases
	me.positiveCaseListTag = $("#positiveCaseList");
	me.positiveCaseTblTag = $("#positiveCaseTbl");
	me.positiveCaseFooterTag = $("#positiveCaseFooter");
	me.positiveCaseNumberTag = $("#positiveCaseNumber");
	
	me.backToCaseListBtnTag = $("[name='backToCaseListBtn']");
	

	// ---------------------------------------------------------------------------------------------------------------------------
	// Init method
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init = function()
	{
		me.setUp_Events();
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Set up events
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{
		me.setUp_FloatButton();
		window.addEventListener( "resize", me.setUp_FloatButton );
		
		// Back to [Current Cases]
		
		me.backToCaseListBtnTag.click(function(){
			if( me.mainPage.currentList == me.mainPage.settingsManagement.PAGE_TODAY_LIST )
			{
				me.registerClientBtnTag.show();
				me.listTodayCases();
			}
			else if( me.mainPage.currentList == me.mainPage.settingsManagement.PAGE_PREVIOUS_LIST )
			{
				me.registerClientBtnTag.hide();
				me.listPreviousCases();
			}
			else if( me.mainPage.currentList == me.mainPage.settingsManagement.PAGE_POSITIVE_LIST )
			{
				me.registerClientBtnTag.hide();
				me.listPositiveCases();
			}
		});
		

		// Open "Search/Add client" form from "Today Cases" list
		
		me.registerClientBtnTag.click(function(){
			Util.resetPageDisplay();

			me.storageObj.removeItem("clientId");
			me.storageObj.removeItem("eventId");
			
			me.mainPage.searchClientManagement.resetSearchClientForm();
			me.mainPage.searchClientManagement.showSearchClientForm();
		});
	};

	me.setUp_FloatButton = function()
	{
		var width = $(window).width() - 80;
		var height = $(window).height() - 120;
		
		me.registerClientBtnTag.css({top: height, left: width, position:'fixed'});
	};
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Load cases
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.listTodayCases = function( exeFunc )
	{
		me.mainPage.registerClientBtnTag.show();
		
		me.mainPage.setCurrentPage( me.mainPage.settingsManagement.PAGE_TODAY_LIST );
		me.storageObj.addItem( "page", me.mainPage.settingsManagement.PAGE_TODAY_LIST );
		me.storageObj.removeItem( "subPage" );		
		
		me.listDateTag.html( Util.formatDate_LastNDate(0) );
		me.listCases( "../event/todayCases", function( list )
		{
			me.populateTodayCaseData( list );
			me.todayCaseTblTag.show();
			me.todayCaseListTag.show("fast");
			
			if( exeFunc !== undefined ) exeFunc();
			
			// Show table			
			MsgManager.appUnblock();
		} );
	}
		
	me.listPreviousCases = function( exeFunc )
	{
		me.registerClientBtnTag.hide();
	
		me.mainPage.setCurrentPage( me.mainPage.settingsManagement.PAGE_PREVIOUS_LIST );
		me.storageObj.addItem( "page", me.mainPage.settingsManagement.PAGE_PREVIOUS_LIST );
		me.storageObj.removeItem( "subPage" );
		
		me.listCases( "../event/previousCases", function( list ){
			me.populatePreviousCaseData( list );
			me.previousCaseTblTag.show();
			me.previousCaseListTag.show("fast");
			
			if( exeFunc !== undefined ) exeFunc();
			
			// Show table	
			MsgManager.appUnblock();
		} );
	}
	
	me.listPositiveCases = function( exeFunc )
	{
		me.registerClientBtnTag.hide();
		
		me.mainPage.setCurrentPage( me.mainPage.settingsManagement.PAGE_POSITIVE_LIST );
		me.storageObj.addItem( "page", me.mainPage.settingsManagement.PAGE_POSITIVE_LIST );
		me.storageObj.removeItem( "subPage" );
		
		me.listCases( "../event/positiveCases", function( list ){
			me.populatePositiveCaseData( list );
			me.positiveCaseTblTag.show();
			me.positiveCaseListTag.show("fast");
			
			if( exeFunc !== undefined ) exeFunc();
						
			// Show table	
			MsgManager.appUnblock();
		} );
	}

	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Load data from server
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.listCases = function( url, exeFunc )
	{
		me.storageObj.removeItem("param" );
		Util.resetPageDisplay();
		
		
		
		Commons.checkSession( function( isInSession ) 
		{
			if( isInSession ) 
			{
				$.ajax(
					{
						type: "POST"
						,url: url
						,dataType: "json"
			            ,contentType: "application/json;charset=utf-8"
		            	,beforeSend: function()
		 	            {
		            		var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_loadingData" );
		            		MsgManager.appBlock( tranlatedText + " ..." ); 
		 	            }
						,success: function( response ) 
						{
							exeFunc( response.trackedEntityInstances );
						}
						,error: function(response)
						{
							console.log(response);
						}
					});
			} 
			else {
				me.mainPage.settingsManagement.showExpireSessionMessage();					
			}
		});	
		
	};

	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Populate data to tables
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.populateTodayCaseData = function( list )
	{		
		var tbodyTag = me.todayCaseTblTag.find("tbody");
		tbodyTag.find("tr").remove();
		
		if( list.length > 0 )
		{
			for( var i in list )
			{
				var clientData = list[i];
				var attrValues = clientData.attributes;
				
				var clientId = clientData.trackedEntityInstance;
				var eventDate = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventDate );
				var hivTestResult = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVTestFinalResult );
				var eventStatus = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventStatus );
				var cuic = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ClientCUIC );
				var hasContactData = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HasContactLogFormInfor );
				
				var hasOpenEvent = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ARTFacility );
				if( hasOpenEvent !== "" )
				{
					var hasOpenEvent = true;
				}
				
				var hasOpenPrepReferEvent = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ARTFacility );
				if( hasOpenPrepReferEvent !== "" )
				{
					var hasOpenPrepReferEvent = true;
				}
					
				var ouName = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventOrgUnit );
				if( ouName != undefined && ouName.split("$").length > 1 )
				{
					ouName = ouName.split("$")[1];
				}
				
				// -------------------------------------------------------------
				// Set status icon
				// -------------------------------------------------------------

				var testResultTag = $( "<td>" + hivTestResult + "</td>" );
				
				
				//For both Negative and Positive, in red if the test has not been completed, in green if it has been completed
				var statusColor = ( eventStatus == "COMPLETED" ) ? "green" : "red"; 
				testResultTag.append("<span class='glyphicon glyphicon-lock' style='color:" + statusColor + ";padding-left:5px;'></span>");
			
				if(  hivTestResult == "Positive" || hivTestResult == "Negative" )
				{	
					// Show [Contact Log] icon
					resultColor = ( hasContactData ) ? "green" : "red"; 
					testResultTag.append("<span class='glyphicon glyphicon-user' style='color:" + resultColor + ";padding-left:5px;'></span>");
					
					//For Positives only, in red if the mandatory fields in Contact Log - LS LOG 1 and LS LOG 2 have not been completed, if it has been: green
					if( hivTestResult == "Positive" )
					{
						//For Positives only, in red if the Referral Opening event does not exist, green if it does
						resultColor = ( hasOpenEvent ) ? "green" : "red"; 
						testResultTag.append("<span class='glyphicon glyphicon-plus' style='color:" + resultColor + ";padding-left:5px;'></span>");
					}
					else if( hivTestResult == "Negative" )
					{
						// For Negative only, in red if the PrEP Referral Opening event does not exist, green if it does
						// resultColor = ( artValue && hasOpenARTEvent ) ? "green" : "red"; 
						resultColor = ( hasOpenPrepReferEvent ) ? "green" : "red"; 
						testResultTag.append("<span class='glyphicon glyphicon-minus' style='color:" + resultColor + ";padding-left:5px;'></span>");
					}
										
					
				}
				
				
				// -------------------------------------------------------------
				// Event date
				// -------------------------------------------------------------
							
				eventDate = ( eventDate !== undefined ) ? eventDate : "";
				var eventDateStr = eventDate;
				if( eventDate !== "" )
				{
					eventDateStr = Util.formatTimeInDateTime( eventDate );
				}
				var eventKey = eventDate.substring(11, 19).split(":").join("");
				
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "allCaseList_msg_clickToOpenEditForm" );
				var rowTag = $("<tr clientId='" + clientId + "' title='" + tranlatedText + "' ></tr>");							
				rowTag.append( "<td><span style='display:none;'>" + eventKey + "</span><span>" + eventDateStr + "</span></td>" );
				rowTag.append( "<td>" + cuic + "</td>" );
				rowTag.append( "<td>" + ouName + "</td>" );
				rowTag.append( testResultTag );
				
				me.addEventForRowInList(rowTag);
				
				tbodyTag.append( rowTag );
			}
			
		}
		
		// Sortable		
		me.sortTable( me.todayCaseTblTag );
		
		me.todayCaseNumberTag.html( me.todayCaseTblTag.find("tbody tr").length );
	}

	me.populatePreviousCaseData = function( list )
	{	
		var tbodyTag = me.previousCaseTblTag.find("tbody");
		tbodyTag.find("tr").remove();
		
		if( list.length > 0 )
		{
			for( var i in list )
			{
				var clientData = list[i];
				var attrValues = clientData.attributes;
				
				var clientId = clientData.trackedEntityInstance;
				var hivTestResult = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVTestFinalResult );
				var eventStatus = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventStatus );
				var cuic = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ClientCUIC );
				var noTest = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventNo );
				var ouName = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventOrgUnit );
				if( ouName != undefined && ouName.split("$").length > 1 )
				{
					ouName = ouName.split("$")[1];
				}
				
				var eventDate = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventDate );
				var eventDateStr = eventDate;
				if( eventDate !== "" )
				{
					eventDateStr = Util.formatDate_DisplayDate( eventDate );
				}
				
				var eventKey = eventDate.substring(0, 10).split("-").join("");
			
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "allCaseList_msg_clickToOpenEditForm" );
				var rowTag = $("<tr clientId='" + clientId + "' title='" + tranlatedText + "' ></tr>");							
				rowTag.append( "<td><span style='display:none;'>" + eventKey + "</span><span>" + eventDateStr + "</span></td>" );
				rowTag.append( "<td>" + cuic + "</td>" );
				rowTag.append( "<td>" + ouName + "</td>" );
				rowTag.append( "<td>" + noTest + "</td>" );
				rowTag.append( "<td>" + hivTestResult + "</td>" );
				
				me.addEventForRowInList(rowTag);
				
				tbodyTag.append( rowTag );
			}
			
		}
		
		// Sortable
		me.sortTable( me.previousCaseTblTag );
		
		me.previousCaseNumberTag.html( me.previousCaseTblTag.find("tbody tr").length );
	}
	
	me.populatePositiveCaseData = function( list )
	{
		var tbodyTag = me.positiveCaseTblTag.find("tbody");
		tbodyTag.find("tr").remove();
		
		if( list.length > 0 )
		{
			for( var i in list )
			{
				var clientData = list[i];
				var attrValues = clientData.attributes;
				
				var clientId = clientData.trackedEntityInstance;
				var hivTestResult = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVTestFinalResult );
				var eventStatus = Util.getAttributeValue( attrValues,"attribute",  me.mainPage.settingsManagement.attr_HIVEventStatus );
				var cuic = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ClientCUIC );
				var numberOfTest = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventNo );
				var artStatus = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ARTStatus );
				var openingFacility = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_ARTFacility );
				var ouName = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventOrgUnit );
				if( ouName != undefined && ouName.split("$").length > 1 )
				{
					ouName = ouName.split("$")[1];
				}
				
				var eventDate = Util.getAttributeValue( attrValues, "attribute", me.mainPage.settingsManagement.attr_HIVEventDate );
				var eventDateStr = eventDate;
				if( eventDate !== "" )
				{
					eventDateStr = Util.formatDate_DisplayDate( eventDate );
				}
				
				var eventKey = eventDate.substring(0, 10).split("-").join("");
				
				
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "positiveCaseList_msg_clickToOpenEditForm" );
				var rowTag = $("<tr clientId='" + clientId + "' title='" + tranlatedText + "'></tr>");										
				rowTag.append( "<td><span style='display:none;'>" + eventKey + "</span><span>" + eventDateStr + "</span></td>" );
				rowTag.append( "<td>" + cuic + "</td>" );
				rowTag.append( "<td>" + ouName + "</td>" );
				rowTag.append( "<td>" + artStatus + "</td>" );
				rowTag.append( "<td>" + openingFacility + "</td>" );

				me.addEventForRowInList(rowTag);
				
				tbodyTag.append( rowTag );
			}
			
		}
		
		// Sortable

		me.sortTable( me.positiveCaseTblTag );
		
		me.positiveCaseNumberTag.html( me.positiveCaseTblTag.find("tbody tr").length );
	};

	// Sort table
	me.sortTable = function( tableTag )
	{
		// Sortable
		var sorted = eval( tableTag.attr("sorted") );
		if( tableTag.find("tbody tr").length > 0  )
		{
			var sortingList = { 'sortList': [[0,1]] };
				
			( sorted ) ? tableTag.trigger( "updateAll", [ sortingList, function() {} ] ) : tableTag.tablesorter( sortingList );

			tableTag.attr( "sorted", "true" );
		}
	};
	
	// Set up event for rows in table - Show Client Details when a row is clicked
	me.addEventForRowInList = function( rowTag )
	{
		rowTag.css("cursor", "pointer");
		rowTag.click( function(){
			me.mainPage.searchClientManagement.backToSearchClientResultBtnTag.hide();
			me.backToCaseListBtnTag.show();
			var clientId = rowTag.attr("clientId");
			var eventId = rowTag.attr("eventId");
			
			Util.resetPageDisplay();
			me.clientFormManagement.loadClientDetails( clientId, eventId, function(){
				me.clientFormManagement.addClientFormDivTag.show();
			} );
		});
	};
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// RUN init method
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init();
	
}