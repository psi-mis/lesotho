

function ClientFormManagement( _mainPage, _metaData, _appPage )
{
	var me = this;
	me.mainPage = _mainPage;
	me.metaData = _metaData;
	me.appPage = _appPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.validationObj = me.mainPage.validationObj;
	me.relationshipsObj;
	me.inputTagGeneration;
	
	
	// Data Element Logic fields
	me.resultTest1Tag;
	me.resultTest2Tag;
	me.resultTestParallel1Tag;
	me.resultTestParallel2Tag;
	me.resultTestResultSDBiolineTag;
	me.resultFinalHIVStatusTag;
	

	// [Client Form] Tab name
	me.TAB_NAME_CLIENT_ATTRIBUTE = "clientAttributeDiv";
	me.TAB_NAME_PREVIOUS_TEST = "previousTestDiv";
	me.TAB_NAME_THIS_TEST = "thisTestDiv";
	me.TAB_NAME_CONTACT_LOG = "contactLogDiv";
	me.TAB_NAME_ART_REFER = "artReferDiv";
	me.TAB_NAME_PREP_REFER = "prepReferDiv";
	me.TAB_NAME_INDEXING = "indexingDiv";
	
	
	me.sectionList = [];
	me.attributeGroupList = [];
	me.metadata_dataElements = {};
	me.metadata_Attributes = {};
	
	me.clientDataList = [];
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Init methods - Populate data and Setup events for components in HTML page
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init = function()
	{
		me.metadata_dataElements = ClientUtil.getDataElementList( me.metaData );
		me.metadata_Attributes = ClientUtil.getAttributeList( me.metaData );
		
		me.inputTagGeneration = new InputTagGeneration();
		me.relationshipsObj = new Relationships();
		
		// STEP 1. Save the sectionList in memory
		
		me.sectionList = me.metaData.sections.programStages;
		me.catOptionComboList = me.metaData.catOptions.categoryOptions;	
		
		// Get [Contact Log] data elements configuration
		for( var i in me.sectionList )
		{
			var stage = me.sectionList[i];
			if( stage.id == MetaDataID.stage_ContactLog )
			{
				me.contactLogDeList = stage.programStageDataElements;
			}
		}
		
		
		// STEP 2. Structure attGroups with attributes in memory

		var attrGroups = me.metaData.attGroups.programSections;
		var prgAttributes = me.metaData.programAttributes.programTrackedEntityAttributes;
		me.attributeGroupList = me.generateAttributeGroupList( attrGroups, prgAttributes );
		
		// STEP 3. Generate forms
		
		me.createClientForm();
		
		me.clientDoBTag = Element.addClientFormTag.find("[attribute='" + MetaDataID.attr_DoB + "']");
		me.clientDistrictOBTag = Element.addClientFormTag.find("[attribute='" + MetaDataID.attr_DistrictOB + "']");
		me.clientLastNameTag = Element.addClientFormTag.find("[attribute='" + MetaDataID.attr_LastName + "']");
		me.clientFirstNameTag = Element.addClientFormTag.find("[attribute='" + MetaDataID.attr_FirstName + "']");
		me.clientBirthOrderTag = Element.addClientFormTag.find("[attribute='" + MetaDataID.attr_BirthOrder + "']");
		

		me.resultTest1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest1 );
		me.resultTest2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest2 );
		me.resultTestParallel1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel1 );
		me.resultTestParallel2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel2 );
		me.resultTestResultSDBiolineTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultSDBioline );
		me.resultFinalHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus );
	
		
		me.setUp_Events();		
		Element.addClientFormTabTag.tabs();
	};
	

	// ----------------------------------------------------------------------------
	// Set up Events
	// ----------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{	
		me.setUp_Events_AddClientForm();

		me.setUp_Events_ContactLogTab();	
		
		me.setUp_Events_ARTReferTab();
			
		me.setUp_Events_prepReferTab();
		
		me.setUp_Events_DataEntryForm();
		
		me.setUp_Events_Indexing();
		
		me.setUp_Events_HeaderLink();
		
	};
	
	me.setUp_Events_HeaderLink = function()
	{
		Element.headerListTag.click( function(){
			var clientId = Element.headerListTag.attr("clientId");
			
			Element.relationshipMsgTag.hide();
			Element.relationshipMsgTag.find("[clientId]").remove();
			
			me.showUpdateClientForm( me.clientDataList[clientId] );
			
		});
	}
	
	
	// Add Events for [Add/Edit Client Form]
	
	me.setUp_Events_AddClientForm = function()
	{
		// -----------------------------------------------------------------------------------------
		// [Client Details] tab 		

		// Validation for fields in [Add/Update Form] form
		
		Element.addClientFormTag.find("input,select").change(function(e){
			me.generateClientCUIC();
		});
		
		// Add [District] of [Contact Log] change event
		var districtTag = me.getAttributeField( MetaDataID.attr_Address3 );
		districtTag.change( function(){
			me.filterCouncilsByDistrict();
		});
		
		
		// ---------------------------------------------------------------------
		// Add [Date picker] for date fields if any
		
		Element.addClientFormTag.find("[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.addClientFormTag.find("[isDateTime='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
		
		// ---------------------------------------------------------------------
		// 	Save Client information
		
		Element.saveClientRegBtnTag.click(function(){
			me.saveClient( Element.addClientFormTag, undefined, undefined, true );
		});
		
		Element.discardClientRegFormBtnTag.click(function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_clientRegForm_discardChanges" );
			var result = confirm( translatedText );
			if( result )
			{
				Util.resetForm( Element.addClientFormTag );
				
				if( Element.addClientFormTabTag.attr("client") != undefined )
				{
					var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
					me.populateClientAttrValues( Element.addClientFormTag, jsonClient );	
					me.setUp_ClientRegistrationFormDataLogic();
					me.validationObj.checkFormEntryTagsData( Element.addClientFormTag );
				}
				
				var changesDiscardedMsg = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_clientRegForm_changesDiscarded" );
				MsgManager.msgAreaShow( changesDiscardedMsg, "SUCCESS" );
				
			}
			
			return false;
		});
		
		
		// -----------------------------------------------------------------------------------------
		// Add validation
		me.setUp_validationCheck( Element.addClientFormTag.find( 'input,select' ) );
		
	};
	
	me.setUp_Events_ContactLogTab = function()
	{
		// -----------------------------------------------------------------------------------------
		// [Register Contact Log] button events
		
		Element.discardContactLogBtnTag.click(function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_discardChanges" );
			var result = confirm( translatedText );			
			if( result )
			{
				Util.resetForm( Element.contactLogFormTag );
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				me.populateClientAttrValues( Element.contactLogFormTag, jsonClient );				
				
				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			
			return false;
		});
		
		Element.saveContactLogBtnTag.click(function(){

			var hasContactLogFormInforTag = me.getAttributeField( MetaDataID.attr_HasContactLogFormInfor );
			hasContactLogFormInforTag.val( "true" );
			
			me.saveClient( Element.contactLogFormTag, function(){
				me.showAttrContactLogHistory();

				if( me.showOpeningTag )
				{
					me.setARTLinkageStatusAttrValue();
					me.setPrepReferLinkageStatusAttrValue();
					me.showDateClientReferredARTOn();
				}
			} );
			
			return false;
		});
		
		
		// -----------------------------------------------------------------------------------------
		// [Event Contact Log] button events
		
		Element.addContactLogEventBtnTag.click( function(){
			Util.resetForm( Element.contactLogEventFormTag );
			Element.contactLogEventFormTag.show();
			Util.disableTag( $(this), true );
		});
		
		Element.discardContactLogEventBtnTag.click(function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_discardChanges" );
			var result = confirm( translatedText );			
			if( result )
			{
				Util.resetForm( Element.contactLogEventFormTag );
				Element.contactLogEventFormTag.hide();
				Util.disableTag( Element.addContactLogEventBtnTag, false );
			}
			return false;
		});
		
		Element.saveContactLogEventBtnTag.click(function(){
			
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
			var jsonEvent = Element.contactLogEventFormTag.attr( "event" );
			var eventId;
			
			if( jsonEvent != undefined )
			{
				jsonEvent = JSON.parse( jsonEvent );
				eventId = jsonEvent.event;
			}
			else
			{
				jsonEvent = { 
						"programStage": MetaDataID.stage_ContactLog 
						,"status": "COMPLETED"
					};
			}
			
			jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", Element.contactLogEventFormTag );
			
			me.execSaveEvent( Element.contactLogEventFormTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( jsonData ){
				// In case, users edit an event( not create a new one ), remove it from history
				// We don't want to make double record for one event in history
				if( eventId != undefined ) 
				{
					var headerTag = Element.contactLogEventHistoryTbTag.find("tr[eventId='" + eventId + "']");
					headerTag.closest("tbody").remove(); // Remove history of the edit event
				}
				else
				{
					var firstCommentTd = Element.contactLogEventHistoryTbTag.find("tbody:first");
					firstCommentTd.find("button").closest("th").remove(); // Remove Edit button column
					firstCommentTd.find("th.outcome").attr("colspan", "2");
				}
				
				Element.contactLogEventFormTag.hide();
				me.populateContactLogEventHistory( jsonData, true );
				me.populateNextContactLogActionBar( jsonData );
				Util.disableTag( Element.addContactLogEventBtnTag, false );
				Element.contactLogEventFormTag.removeAttr( "event" );
				
			});
			return false;
		});


		// Validation for INPUT fields
		
		me.setUp_validationCheck( Element.contactLogFormTag.find( 'input,select,textarea' ) );
		
	};
	
	me.setUp_Events_ARTReferTab = function()
	{
		// -----------------------------------------------------------------------------------------
		// [ART Refer Open] button events
		
		Element.discardARTOpenEventBtnTag.click( function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_discardChanges" );
			var result = confirm( translatedText );
			if( result )
			{
				Util.resetForm( Element.artReferOpenFormTag );
				
				if( Element.artReferOpenFormTag.attr("event") != undefined )
				{
					// Reset data
					var jsonEvent = JSON.parse( Element.artReferOpenFormTag.attr("event") );
					me.populateDataValuesInEntryForm( Element.artReferOpenFormTag, jsonEvent );
				}
				
				// Check validation
				me.validationObj.checkFormEntryTagsData( Element.artReferOpenFormTag );
				
				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			
			
			return false;
		});
		
		Element.saveARTOpenEventBtnTag.click( function(){
			
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
			
			var jsonEvent = Element.artReferOpenFormTag.attr("event");
			var eventId;
			if( jsonEvent !== undefined )
			{
				jsonEvent = JSON.parse( jsonEvent );
				eventId = jsonEvent.event;
			}
			else
			{
				jsonEvent = { 
					"programStage": MetaDataID.stage_ARTReferralOpenning
					,"status": "COMPLETED"
				};
			}
						
			jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", Element.artReferOpenFormTag );
			
			me.execSaveEvent( Element.artReferOpenFormTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( response ){
				
				// Set [event] attribute for [ART Refer Opening] Tab
				Element.artReferOpenFormTag.attr( "event", JSON.stringify( response ) );
				
				// Save data
				
				me.setAndSaveARTLinkageStatusAttrValue( Element.artReferOpenFormTag, function(){
					
					var artClosureEvent = Element.artReferCloseFormTag.attr("event");
					if( artClosureEvent !== undefined )
					{
						artClosureEvent = JSON.parse( artClosureEvent );
					}
					
					// Generate [Time Elapsed] attribute value for [ART Closure] form
					me.populateTimeElapsed( response, artClosureEvent, true );
					
					Element.artReferCloseFormTag.show();
				
					me.hideIconInTab( me.TAB_NAME_ART_REFER );
				});
				
			});
		

			return false;
		});
		
		me.setUp_validationCheck( Element.artReferOpenFormTag.find( 'input,select' ) );
		
		
		// -----------------------------------------------------------------------------------------
		// [ART Refer Close] button events
		
		Element.discardARTCloseEventBtnTag.click( function(){
			Util.resetForm( Element.artReferCloseFormTag );
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_discardChanges" );
			var result = confirm( translatedText );
			if( result )
			{
				Util.resetForm( Element.artReferCloseFormTag );
				
				
				// Reset data
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				me.populateClientAttrValues( Element.artReferCloseFormTag, jsonClient );
							
				if( Element.artReferCloseFormTag.attr("event") != undefined )
				{
					var jsonEvent = JSON.parse( Element.artReferCloseFormTag.attr("event") );
					me.populateDataValuesInEntryForm( Element.artReferCloseFormTag, jsonEvent );	
				}
				
				// Populate data for auto completed field
				var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_ReferralFacilityName );
				var facilityName = closeReferFacilityNameTag.find("option:selected").text();
				closeReferFacilityNameTag.closest("td").find( "input" ).val( facilityName );
				
				// Check validation
				me.validationObj.checkFormEntryTagsData( Element.artReferCloseFormTag );
				
				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			
			
			return false;
		});
		
		Element.saveARTCloseEventBtnTag.click( function(){	
			
			if( me.validationObj.checkFormEntryTagsData( Element.artReferCloseFormTag ) )
			{
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				
				var jsonEvent = Element.artReferCloseFormTag.attr("event");
				var eventId;
				if( jsonEvent !== undefined )
				{
					jsonEvent = JSON.parse( jsonEvent );
					eventId = jsonEvent.event;
				}
				else
				{
					jsonEvent = { 
						"programStage": MetaDataID.stage_ARTReferralClosure
						,"status": "COMPLETED"
					};
				}
							
				jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", Element.artReferCloseFormTag );
				
				me.execSaveEvent( Element.artReferCloseFormTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( response ){
					
					// Set [event] attribute for [ART Refer Opening] Tab
					Element.artReferCloseFormTag.attr( "event", JSON.stringify( response ) );
					
					// Save data
					me.setAndSaveARTLinkageStatusAttrValue( Element.artReferCloseFormTag, function(){
						
						var artClosureEvent = Element.artReferCloseFormTag.attr("event");
						artClosureEvent = JSON.parse( artClosureEvent );
						
						// Generate [Time Elapsed] attribute value for [ART Closure] form
						me.populateTimeElapsed( response, artClosureEvent, true );
						
						Element.artReferCloseFormTag.show();
					
						me.hideIconInTab( me.TAB_NAME_ART_REFER );
					});
					
				});
			}
			
			return false;
			
		});
		
		me.setUp_validationCheck( Element.artReferCloseFormTag.find( 'input,select,textarea' ) );
	};
	
	me.setUp_Events_prepReferTab = function()
	{
		// -----------------------------------------------------------------------------------------
		// [ART Refer Open] button events
		
		Element.discardPrepReferOpenEventBtnTag.click( function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_prepReferEventForm_discardChanges" );
			var result = confirm( translatedText );
			if( result )
			{
				Util.resetForm( Element.prepReferOpenFormTag );
				
				if( Element.prepReferOpenFormTag.attr("event") != undefined )
				{
					// Reset data
					var jsonEvent = JSON.parse( Element.prepReferOpenFormTag.attr("event") );
					me.populateDataValuesInEntryForm( Element.prepReferOpenFormTag, jsonEvent );
				}
				
				// Check validation
				me.validationObj.checkFormEntryTagsData( Element.prepReferOpenFormTag );
				
				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_prepReferEventForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			
			
			return false;
		});
		
		Element.savePrepReferOpenEventBtnTag.click( function(){
			
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
			
			var jsonEvent = Element.prepReferOpenFormTag.attr("event");
			var eventId;
			if( jsonEvent !== undefined )
			{
				jsonEvent = JSON.parse( jsonEvent );
				eventId = jsonEvent.event;
			}
			else
			{
				jsonEvent = { 
					"programStage": MetaDataID.stage_prepReferralOpenning
					,"status": "COMPLETED"
				};
			}
						
			jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", Element.prepReferOpenFormTag );
			
			me.execSaveEvent( Element.prepReferOpenFormTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( response ){
				
				// Set [event] attribute for [ART Refer Opening] Tab
				Element.prepReferOpenFormTag.attr( "event", JSON.stringify( response ) );
				
				// Save data
				
				me.setAndSavePrepReferLinkageStatusAttrValue( Element.prepReferOpenFormTag, function(){
					
					var prepReferClosureEvent = Element.prepReferCloseFormTag.attr("event");
					if( prepReferClosureEvent !== undefined )
					{
						prepReferClosureEvent = JSON.parse( prepReferClosureEvent );
					}
					
					// Generate [Time Elapsed] attribute value for [ART Closure] form
					me.populateTimeElapsed( response, prepReferClosureEvent, false );
					
					Element.prepReferCloseFormTag.show();
				
					me.hideIconInTab( me.TAB_NAME_PREP_REFER );
				});
				
			});
		

			return false;
		});
		
		me.setUp_validationCheck( Element.prepReferOpenFormTag.find( 'input,select' ) );
		
		
		// -----------------------------------------------------------------------------------------
		// [ART Refer Close] button events
		
		Element.discardPrepReferCloseEventBtnTag.click( function(){
			Util.resetForm( Element.prepReferCloseFormTag );
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_PrepEventForm_discardChanges" );
			var result = confirm( translatedText );
			if( result )
			{
				Util.resetForm( Element.prepReferCloseFormTag );
				
				
				// Reset data
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				me.populateClientAttrValues( Element.prepReferCloseFormTag, jsonClient );
							
				if( Element.prepReferCloseFormTag.attr("event") != undefined )
				{
					var jsonEvent = JSON.parse( Element.prepReferCloseFormTag.attr("event") );
					me.populateDataValuesInEntryForm( Element.prepReferCloseFormTag, jsonEvent );	
				}
				
				// Populate data for auto completed field
				var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_ReferralFacilityName );
				var facilityName = closeReferFacilityNameTag.find("option:selected").text();
				closeReferFacilityNameTag.closest("td").find( "input" ).val( facilityName );
				
				// Check validation
				me.validationObj.checkFormEntryTagsData( Element.prepReferCloseFormTag );
				
				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			
			
			return false;
		});
		
		Element.savePrepReferCloseEventBtnTag.click( function(){	

			if( me.validationObj.checkFormEntryTagsData( Element.prepReferCloseFormTag ) )
			{
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				
				var jsonEvent = Element.prepReferCloseFormTag.attr("event");
				var eventId;
				if( jsonEvent !== undefined )
				{
					jsonEvent = JSON.parse( jsonEvent );
					eventId = jsonEvent.event;
				}
				else
				{
					jsonEvent = { 
						"programStage": MetaDataID.stage_prepReferralClosure
						,"status": "COMPLETED"
					};
				}
							
				jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", Element.prepReferCloseFormTag );
				
				me.execSaveEvent( Element.prepReferCloseFormTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( response ){
					
					// Set [event] attribute for [ART Refer Opening] Tab
					Element.prepReferCloseFormTag.attr( "event", JSON.stringify( response ) );
					
					// Save data
					me.setAndSavePrepReferLinkageStatusAttrValue( Element.prepReferCloseFormTag.closest("div"), function(){
						
						var prepReferOpenEvent = Element.prepReferOpenFormTag.attr("event");
						prepReferOpenEvent = JSON.parse( prepReferOpenEvent );
						
						// Generate [Time Elapsed] attribute value for [PreRefer Closure] form
						me.populateTimeElapsed( prepReferOpenEvent, response, false );
						
						Element.prepReferCloseFormTag.show();
					
						me.hideIconInTab( me.TAB_NAME_PREP_REFER );
					});
					
				});
				
			}
			
			return false;
			
		});
		
		me.setUp_validationCheck( Element.prepReferCloseFormTag.find( 'input,select' ) );
	};
	
	me.showDateClientReferredARTOn = function()
	{
		var latestEvent = Element.addClientFormTabTag.attr("latestEvent");
		if( latestEvent != undefined )
		{
			latestEvent = JSON.parse( latestEvent );
			var eventDateStr = Util.formatDate_DisplayDate( latestEvent.eventDate );
			Element.artEventInfoTbTag.find("span.dateClientReferredARTOn").html( eventDateStr );
			Element.prepReferEventInfoTbTag.find("span.dateClientReferredPrepReferOn").html( eventDateStr );
		}
	}

	
	me.calulate_ARTClosureTimeElapsed = function()
	{
		var artOpeningEvent = Element.artReferOpenFormTag.attr("event");
		
		var dateOfARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_ART_Enrollment );
		var dateOfARTEnrollmentVal = dateOfARTEnrollmentTag.val();
		if( artOpeningEvent != undefined && dateOfARTEnrollmentVal != "" )
		{
			dateOfARTEnrollmentVal = Util.formatDate_DbDate( dateOfARTEnrollmentVal );
			dateOfARTEnrollmentVal = Util.convertDateStrToObject( dateOfARTEnrollmentVal );
				
			artOpeningEvent = JSON.parse( Element.artReferOpenFormTag.attr("event") );
			var openEventDate = Util.convertDateStrToObject( artOpeningEvent.eventDate.substring(0, 10) );
			
			var timeElapsed = Util.getDaysElapsed( openEventDate, dateOfARTEnrollmentVal );
			me.getAttributeField( MetaDataID.attr_ARTClosure_TimeElapsed ).val( timeElapsed );
		}
		else
		{
			var closureTimeElapsedTag = me.getAttributeField( MetaDataID.attr_ARTClosure_TimeElapsed );
			closureTimeElapsedTag.val( "" );
			dateOfARTEnrollmentTag.change();
		}
	}
	

	me.calulate_PrepReferClosureTimeElapsed = function()
	{
		var openingEvent = Element.prepReferOpenFormTag.attr("event");
		var dateOfEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_prepRefer_Enrollment );
		var dateOfEnrollmentVal = dateOfEnrollmentTag.val();
		if( openingEvent != undefined && dateOfEnrollmentVal != "" )
		{
			dateOfEnrollmentVal = Util.formatDate_DbDate( dateOfEnrollmentVal );
			dateOfEnrollmentVal = Util.convertDateStrToObject( dateOfEnrollmentVal );
				
			openingEvent = JSON.parse( openingEvent );
			var openEventDate = Util.convertDateStrToObject( openingEvent.eventDate.substring(0, 10) );
			
			var timeElapsed = Util.getDaysElapsed( openEventDate, dateOfEnrollmentVal );
			me.getAttributeField( MetaDataID.attr_PrepReferClosure_TimeElapsed ).val( timeElapsed );
		}
		else
		{
			var closureTimeElapsedTag = me.getAttributeField( MetaDataID.attr_PrepReferClosure_TimeElapsed );
			closureTimeElapsedTag.val( "" );
			dateOfEnrollmentTag.change();
		}
	}
	
	// Add Events for [Event Data Entry] form
	
	me.setUp_Events_DataEntryForm = function()
	{
		// -----------------------------------------------------------------------------------------
		// Set up events INPUT tags in [New test] form
		
		// Set up events for HIV Test input tags
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest1 ).change( function(){
			var deId = $(this).attr("dataelement");
			me.setUp_DataEntryHIVTestInputTagEvent( deId );	
		});
		
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest2 ).change( function(){
			var deId = $(this).attr("dataelement");
			me.setUp_DataEntryHIVTestInputTagEvent( deId );	
		});
		
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel1 ).change( function(){
			var deId = $(this).attr("dataelement");
			me.setUp_DataEntryHIVTestInputTagEvent( deId );	
		});
		
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel2 ).change( function(){
			var deId = $(this).attr("dataelement");
			me.setUp_DataEntryHIVTestInputTagEvent( deId );	
		});
		
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultSDBioline ).change( function(){
			var deId = $(this).attr("dataelement");
			me.setUp_DataEntryHIVTestInputTagEvent( deId );	
		});
		
		// Client Type
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType ).change( function(){
			me.setUp_ClientTypeTagLogic();
		});

		// Partner CUIC option
		var partnerCUICOptTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt );
		partnerCUICOptTag.change( function(){
			me.setUp_PartnerCUICOption();
		});
		
		// Partner Knows HIV Status
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerKnowsHIVStatus ).change( function(){
			me.setUp_DataElementPartnerKnowHIVStatusLogic();
		});
		
		// Test results given
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestResultsGiven ).change( function(){
			me.setUp_logicEntryFormWithData();
			me.setUp_ReferralOfferedLogic();
		});
		
		// Referral offered
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Referral_Offered ).change( function(){
			me.setUp_logicEntryFormWithData();
			me.setUp_ReferralOfferedLogic();
		});
		
		// [Index Contact]
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_IndexedContact ).change( function(){
			me.setUp_IndexedContactLogic();
		});
		
		
		// TB Screening Conducted
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TBScreeningConducted ).change( function(){
			me.setUp_DataElementTBScreeningConductedLogic();
		});
		
		
		// Hide other reson fields for INPUT tags
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HIVTestChannel ).change( me.setUp_OtherReasonTagLogic );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhatMotivatedHIVTest ).change( me.setUp_OtherReasonTagLogic );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Layer ).change( me.setUp_OtherReasonTagLogic );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhereLeadIdentified ).change( me.setUp_OtherReasonTagLogic );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HealthFacilityOfLead ).change( me.setUp_OtherReasonTagLogic );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_LeadRelationshipToClient ).change( me.setUp_OtherReasonTagLogic );
		
		// BMI
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Height ).change( me.setUp_DataElementBMI );
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Weight ).change( me.setUp_DataElementBMI );
		
		// Time Since Last Test
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_DateLastHIVTest ).on('dp.change', function(e){ 
			me.setUp_DataElementTimeSinceLastTest();
		});
		
		// ---------------------------------------------------------------------
		// Set up events for buttons
		
		// Discard data
		Element.discardEventFormBtnTag.click( function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_discardChanges" );
			var result = confirm( translatedText );			
			if( result )
			{
				Util.resetForm( Element.addEventFormTag );
				me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId ).val("");
				me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus ).val("");
				me.getDataElementField( Element.addEventFormTag, MetaDataID.de_CoupleStatus ).val("");
				me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EQCPPTPassed ).val("");
				
				var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
				partnerCUICTag.val("");
				partnerCUICTag.removeAttr("title" );
				partnerCUICTag.removeAttr("lastHIVTest" );
				partnerCUICTag.closest( "td" ).find( "span.partnerDetails" ).hide();
				partnerCUICTag.closest( "td" ).find("span.partnerInfo").html("");
				partnerCUICTag.closest( "td" ).find("span.partnerInfo").hide();
				
				if( Element.addEventFormTag.attr("event") != undefined )
				{
					var jsonEvent = JSON.parse( Element.addEventFormTag.attr("event") );
					if( jsonEvent.status == "ACTIVE" )
					{
						me.populateDataValuesInEntryForm( Element.addEventFormTag, jsonEvent );
						
						// Set data values based on client attribute values
						me.setUp_InitDataValues();
						
						me.checkAndShowCheckedIconForPartnerCUICTag();
						var partnerData = Element.addEventFormTag.attr("partnerData");
						if( partnerData != undefined )
						{
							me.setUp_PartnerInfor( JSON.parse( partnerData ) );
						}
					}
				}
				
				var changesDiscardedMsg = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_ARTEventForm_changesDiscarded" );
				MsgManager.msgAreaShow( changesDiscardedMsg, "SUCCESS" );
			}
			
			return false;
		});
		

		// Show Dialog to ask users if they want to save or complete the event
		Element.showEventSaveOptionDiaglogBtnTag.click( function(){
			if( me.validationObj.checkFormEntryTagsData(Element.thisTestDivTag) )
			{
				me.showDialogForSaveEvent();
			}
			else
			{
				Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
				MsgManager.appUnblock();
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "datatEntryForm_validation_checkErrorFields" );
				alert( tranlatedText );
			}
			return false;
		});
		
		
		// Save an event
		Element.saveEventBtnTag.click( function(){
			
			Element.saveEventDialogFormTag.dialog( "close" );
			Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, true );
					
			// Get Json Event data
			
			var client = JSON.parse( Element.addClientFormTabTag.attr("client") );
			var event = Element.addEventFormTag.attr("event");
			
			if( event !== undefined ){
				event = JSON.parse( event );
			}
			else{
				event = { "programStage": MetaDataID.stage_HIVTesting };
			}
			
			event.dataValues = Util.getArrayJsonData( "dataElement", Element.thisTestDivTag );
			
			// Save Event
			me.execSaveEvent( Element.thisTestDivTag, event, client.trackedEntityInstance, event.event, function( eventJson ){

				me.updatePartnerInfo( eventJson );
				
			} );
		});
				
		// Complete an event
		Element.completedEventBtnTag.click(function(){
			Element.saveEventDialogFormTag.dialog( "close" );
			var tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_aksForCompletingEvent" );
			var result = confirm(tranlatedText);
			if(result)
			{
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_completingEvent" );
				MsgManager.appBlock( tranlatedText + " ..." );
				
				
				me.completeEvent(function(){
					Element.addEventFormTag.removeAttr( "eventId" );
					Element.addEventFormTag.removeAttr( "event" );

				});
				
				return false;
			}
			
		});
		
		Element.cancelEventBtnTag.click(function(){
			Element.saveEventDialogFormTag.dialog("close");
		});

		me.setUp_validationCheck( Element.thisTestDivTag.find( 'input,select' ) );
		
		me.activeEventHeaderTag = $("#activeEventHeader");
		me.notAllowToCreateEventHeaderTag = $("#notAllowToCreateEventHeader");
		
	};
	
	
	me.setUp_Events_Indexing = function()
	{
		Element.showSearchClientRelationshipFromBtnTag.click( function(){
			Element.addClientFormDivTag.hide();
			ClientUtil.setSearchRelationshipStatus();
			
			
			me.mainPage.searchClientManagement.resetSearchClientForm();
			me.mainPage.searchClientManagement.showSearchClientForm();
		});
		
	};
	
	me.disableClientDetailsAndCUICAttrGroup = function( disabled )
	{
		Util.disableForm( Element.addClientFormTag.find("tbody[groupid=" + MetaDataID.attrGroup_ClientDetailsAndCUIC + "]" ), disabled );
	};
	
	me.setUp_validationCheck = function( tags )
	{
		tags.change( function() {
			me.validationObj.checkValidations( $(this) );
		});
		
		tags.on('dp.change', function(e){ 
			me.validationObj.checkValidations( $(this) );
		});
		
	};

	
	// ----------------------------------------------------------------------------
	// Add logic for data elements in [This Test] form
	// ----------------------------------------------------------------------------
	
	me.setUp_DataEntryFormInputTagEvent = function()
	{		

		// STEP 1. Hide all tbody and input in [New Test]
		Element.addEventFormTag.find("tbody[sectionid]").show();
		Element.addEventFormTag.find("tbody[sectionid]").find("input,select").each(function(){
			me.setHideLogicTag( $(this), false );
		});
		
		
		// STEP 2. Setup logic fields in form
		me.setUp_ClientTypeTagLogic();
		me.setUp_DataElementPartnerKnowHIVStatusLogic();
		me.setUp_DataElementFinalHIVStatusLogic();
		me.setUp_ReferralOfferedLogic();
		me.setUp_IndexedContactLogic();
		me.setUp_DataElementTBScreeningConductedLogic();
		me.setUp_OtherReasonTagLogic();
		me.setUp_DataElementBMI();
		me.setUp_DataElementTimeSinceLastTest();
		
	}; 
	
	
	me.setUp_DataEntryHIVTestInputTagEvent = function( attrId )
	{
		var clientTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType );
		
		if( attrId != undefined && eval( Element.addClientFormTabTag.attr("addedLogic") )  )
		{
			if(  clientTypeTag.val() !== "LS_SER3" )
			{
					
				// If "Result Test 1" value is "Positive", enable "Result Test 2"
				if( attrId === MetaDataID.de_Testing_ResultTest1 )
				{
					me.setUp_DataElementResultTest1Logic();
				}
				// If "Result Test 2" value is "Positive", enable "Result Parallel 2" 
				else if( attrId === MetaDataID.de_Testing_ResultTest2 )
				{
					me.setUp_DataElementResultTest2Logic();
				}
				// If the value of "Parallel 1" and "Parallel 2" are the same, "FinalResult" has value as "Parallel"
				// If not, enable "SD Bioline" field
				else if( attrId === MetaDataID.de_Testing_ResultParallel1 || attrId === MetaDataID.de_Testing_ResultParallel2 )
				{
					me.setUp_DataElementResultParallelLogic();				
				}
				// Fill "SD Bioline" value for "Final Result"
				else if( attrId === MetaDataID.de_Testing_ResultSDBioline )
				{
					var result = me.resultTestResultSDBiolineTag.val();
					if( me.resultTestResultSDBiolineTag.val() == "Indeterminate out of stock"
						|| me.resultTestResultSDBiolineTag.val() == "Positive" )
					{
						result = "Indeterminate";
					}
					me.resultFinalHIVStatusTag.val( result );
					me.resultFinalHIVStatusTag.closest("td").find("errorMsg").remove();
				}
				
				// Generate [Couple Status] data value
				me.generateCoupleStatusIfAny();
				
				// Show [If positive, did client disclose knowledge of previous HIV+ status] if final HIV test is Positive
				me.setUp_DataElementFinalHIVStatusLogic();
			}
			else
			{
				me.populateEQCPPTPassedVal();
			}
			
			me.setUp_ReferralOfferedLogic();
		}
	};
	
	me.setUp_DataElementResultTest1Logic = function()
	{
		if( me.resultTest1Tag.val() === "Positive" )
		{
			me.resultTest2Tag.val( "" );
			me.resultTestParallel1Tag.val( "" );
			me.resultTestParallel2Tag.val( "" );
			me.resultTestResultSDBiolineTag.val( "" );
			me.resultFinalHIVStatusTag.val( "" );
			
			Util.disableTag( me.resultTest2Tag, false );
			Util.disableTag( me.resultTestParallel1Tag, true );
			Util.disableTag( me.resultTestParallel2Tag, true );
			Util.disableTag( me.resultTestResultSDBiolineTag, true );
			
			me.addMandatoryForField( me.resultTest2Tag );
		}
		else
		{
			me.resultTest2Tag.val( "" );
			me.resultTestParallel1Tag.val( "" );
			me.resultTestParallel2Tag.val( "" );
			me.resultTestResultSDBiolineTag.val( "" );
			me.resultFinalHIVStatusTag.val( me.resultTest1Tag.val() );
			me.resultFinalHIVStatusTag.closest("td").find(".errorMsg").remove();
			
			Util.disableTag( me.resultTest2Tag, true );
			Util.disableTag( me.resultTestParallel1Tag, true );
			Util.disableTag( me.resultTestParallel2Tag, true );
			Util.disableTag( me.resultTestResultSDBiolineTag, true );
			
			me.removeMandatoryForField( me.resultTest2Tag );
			me.removeMandatoryForField( me.resultTestParallel1Tag );
			me.removeMandatoryForField( me.resultTestParallel2Tag );
			me.removeMandatoryForField( me.resultTestResultSDBiolineTag );
		}
	};
	
	me.setUp_DataElementResultTest2Logic = function()
	{
		if( me.resultTest2Tag.val() !== "Positive" )
		{
			me.resultTestParallel1Tag.val( "" );
			me.resultTestParallel2Tag.val( "" );
			me.resultTestResultSDBiolineTag.val( "" );
			me.resultFinalHIVStatusTag.val( "" );
			
			Util.disableTag( me.resultTestParallel1Tag, false );
			Util.disableTag( me.resultTestParallel2Tag, false );
			Util.disableTag( me.resultTestResultSDBiolineTag, true );
			
			me.addMandatoryForField( me.resultTestParallel1Tag );
			me.addMandatoryForField( me.resultTestParallel2Tag );
		}
		else
		{
			me.resultTestParallel1Tag.val( "" );
			me.resultTestParallel2Tag.val( "" );
			me.resultTestResultSDBiolineTag.val( "" );
			me.resultFinalHIVStatusTag.val( me.resultTest2Tag.val() );
			me.resultFinalHIVStatusTag.closest("td").find(".errorMsg").remove();
			
			Util.disableTag( me.resultTestParallel1Tag, true );
			Util.disableTag( me.resultTestParallel2Tag, true );
			Util.disableTag( me.resultTestResultSDBiolineTag, true );
			
			
			me.removeMandatoryForField( me.resultTestParallel1Tag );
			me.removeMandatoryForField( me.resultTestParallel2Tag );
			me.removeMandatoryForField( me.resultTestResultSDBiolineTag );
		}
	};
	
	me.setUp_DataElementResultParallelLogic = function()
	{
		if( me.resultTestParallel1Tag.val() != "" && me.resultTestParallel2Tag.val() != "" )
		{
			if( me.resultTestParallel1Tag.val() != me.resultTestParallel2Tag.val() )
			{
				me.resultFinalHIVStatusTag.val( "" );
				Util.disableTag( me.resultTestResultSDBiolineTag, false );
				me.addMandatoryForField( me.resultTestResultSDBiolineTag );
				
			}
			else
			{
				me.resultTestResultSDBiolineTag.val( "" );
				me.resultFinalHIVStatusTag.val( me.resultTestParallel1Tag.val() );
				me.resultFinalHIVStatusTag.closest("td").find(".errorMsg").remove();
				
				Util.disableTag( me.resultTestResultSDBiolineTag, true );
				me.removeMandatoryForField( me.resultTestResultSDBiolineTag );
			}
		}
		else
		{
			me.resultTestResultSDBiolineTag.val( "" );
			me.resultFinalHIVStatusTag.val( "" );
			Util.disableTag( me.resultTestResultSDBiolineTag, true );
			me.removeMandatoryForField( me.resultTestResultSDBiolineTag );
		}
	};
	
	me.setUp_DataElementPartnerKnowHIVStatusLogic = function()
	{
		var partnerKnowsHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerKnowsHIVStatus );
		var partnerHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerHIVStatus );
		
		if( partnerKnowsHIVStatusTag.val() == "true" )
		{
			me.addMandatoryForField( partnerHIVStatusTag );
			me.setHideLogicTag( partnerHIVStatusTag, false );
		}
		else
		{
			me.removeMandatoryForField( partnerHIVStatusTag );
			partnerHIVStatusTag.val("");
			me.setHideLogicTag( partnerHIVStatusTag.closest("tr"), true );
		}
	};
	
	me.setUp_DataElementFinalHIVStatusLogic = function()
	{
		var resultFinalHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus );
		var testResultsGivenTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestResultsGiven );
		var previousKnowledgeHIVPositiveStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PreviousKnowledgeHIVPositiveStatus );
		
		// Reset field [Previous knowledge of HIV+ status]
		me.setHideLogicTag( previousKnowledgeHIVPositiveStatusTag.closest("tr"), true );
		me.removeMandatoryForField( previousKnowledgeHIVPositiveStatusTag );
		
		// Reset field [testResultsGivenTag]
		Util.disableTag( testResultsGivenTag, false );	
		
		if( resultFinalHIVStatusTag.val() === "Indeterminate" )
		{
			// ASSIGN [No] value for [testResultsGiven]
			testResultsGivenTag.val("false");
			Util.disableTag( testResultsGivenTag, true );
		}
		else if( resultFinalHIVStatusTag.val() === "Positive" )
		{
			// Add mandatory for [Previous knowledge of HIV+ status]
			me.addMandatoryForField( previousKnowledgeHIVPositiveStatusTag );
			me.setHideLogicTag( previousKnowledgeHIVPositiveStatusTag.closest("tr"), false );
		}
		
	};
		
	// Generate [Couple Status] data value
	me.generateCoupleStatusIfAny = function()
	{
		var clientTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType );
		var partnerCUICOptTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt );
		var partnerHIVTest = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC ).attr( "lastHIVTest" );
		var clientHIVTest = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus ).val();
		var coupleStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_CoupleStatus );
		if( clientTypeTag.val() == "LS_SER2" && partnerCUICOptTag.val() == "2" && partnerHIVTest != undefined && clientHIVTest != "" )
		{
			if( clientHIVTest == "Indeterminate" || clientHIVTest == "Indeterminate out of stock" ||
				 partnerHIVTest == "Indeterminate" || partnerHIVTest == "Indeterminate out of stock" )
			{
				coupleStatusTag.val( "IND" );
			}
			else if( partnerHIVTest == clientHIVTest )
			{
				if( clientHIVTest == "Positive" )
				{
					coupleStatusTag.val( "CON" );
				}
				else if( clientHIVTest == "Negative" )
				{
					coupleStatusTag.val( "NEG" );
				}
			}
			else
			{
				coupleStatusTag.val( "DIS" );
			}
		}
		else
		{
			coupleStatusTag.val( "" );
		}
	};
	
	me.setUp_IndexedContactLogic = function()
	{	
		var indexedContactTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_IndexedContact );
 
		var sectionTag = Element.addEventFormTag.find("[sectionid='" + MetaDataID.sectionIndexing + "']");
//		var inputTags = sectionTag.find( "input,select,textarea");
		var deRelationshipTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_RelationshipType );
		var deHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HIV_Status  );
		var deNotificationMethodTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Notification_Method );
		
		
		if( indexedContactTag.val() == "true" )
		{
			sectionTag.show();
			
			me.setHideLogicTag( deRelationshipTypeTag.closest("tr"), false );
			me.setHideLogicTag( deHIVStatusTag.closest("tr"), false );
			me.setHideLogicTag( deNotificationMethodTag.closest("tr"), false );
		}
		else
		{
			sectionTag.hide();
			
			me.setHideLogicTag( deRelationshipTypeTag.closest("tr"), true );
			me.setHideLogicTag( deHIVStatusTag.closest("tr"), true );
			me.setHideLogicTag( deNotificationMethodTag.closest("tr"), true );
			
			deRelationshipTypeTag.val("");
			deHIVStatusTag.val("");
			deNotificationMethodTag.val("");
		}
			
	};

	me.setUp_ReferralOfferedLogic = function()
	{
		var jsonClient = Element.addClientFormTabTag.attr("client");
		var gender = "";
		if( jsonClient != undefined )
		{
			jsonClient = JSON.parse( jsonClient );
			gender = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_Sex );
		}
		
		
		var becomeIndexLeadTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_BecomeIndexLead );
		
		var referralOfferedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Referral_Offered );
		var testResultsGivenTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestResultsGiven );
		var referralGivenSTITag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_STI );
		var referralGivenTBTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_TB );
		var referralGivenFPTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_FP );
		var referralGivenVMMCTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_VMMC );
		var referralGivenARTTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_ART );
		var referralGivenDNAPCRTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_DNAPCR ); 
		var referralGivenPRePNegativeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGivenPRePNegative );
		
		var resultFinalHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus );
		
		// Hidden all [Referral Given xxx]
		me.setHideLogicTag( referralGivenSTITag.closest("tr"), true );
		me.setHideLogicTag( referralGivenTBTag.closest("tr"), true );
		me.setHideLogicTag( referralGivenFPTag.closest("tr"), true );
		me.setHideLogicTag( referralGivenVMMCTag.closest("tr"), true );
		me.setHideLogicTag( referralGivenARTTag.closest("tr"), true );
		me.setHideLogicTag( becomeIndexLeadTag.closest("tr"), true );
		me.setHideLogicTag( referralGivenPRePNegativeTag.closest("tr"), true );
		me.setHideLogicTag( referralGivenDNAPCRTag.closest("tr"), true );
		
		
		if( referralOfferedTag.val() == "true" )
		{
			me.setHideLogicTag( referralGivenSTITag.closest("tr"), false );
			me.setHideLogicTag( referralGivenTBTag.closest("tr"), false );
			me.setHideLogicTag( referralGivenFPTag.closest("tr"), true ); // Only show if TEI is a Female

			if( gender == "M" )
			{
				me.setHideLogicTag( referralGivenVMMCTag.closest("tr"), false );
			}
			else if( gender == "F" )
			{
				me.setHideLogicTag( referralGivenFPTag.closest("tr"), false );
			}
			
			if( resultFinalHIVStatusTag.val() == "Positive" && testResultsGivenTag.val() == "true" )
			{
				me.setHideLogicTag( referralGivenARTTag.closest("tr"), false );
				me.setHideLogicTag( becomeIndexLeadTag.closest("tr"), false );

				referralGivenVMMCTag.prop("checked", false);
				referralGivenPRePNegativeTag.prop("checked", false);
				referralGivenDNAPCRTag.prop("checked", false);
				
			}
			else if( resultFinalHIVStatusTag.val() == "Negative" && testResultsGivenTag.val() == "true" )
			{
				me.setHideLogicTag( referralGivenPRePNegativeTag.closest("tr"), false );

				referralGivenVMMCTag.prop("checked", false);
				referralGivenARTTag.prop("checked", false);
				becomeIndexLeadTag.prop("checked", false);
				referralGivenDNAPCRTag.prop("checked", false);
				
			}
			else if( resultFinalHIVStatusTag.val() == "Indeterminate" )
			{
				me.setHideLogicTag( referralGivenDNAPCRTag.closest("tr"), false );

				referralGivenVMMCTag.prop("checked", false);
				referralGivenARTTag.prop("checked", false);
				becomeIndexLeadTag.prop("checked", false);
				referralGivenPRePNegativeTag.prop("checked", false);
			}
		}
		else
		{
			referralGivenSTITag.prop("checked", false);
			referralGivenTBTag.prop("checked", false);
			referralGivenFPTag.prop("checked", false);
			referralGivenVMMCTag.prop("checked", false);
			referralGivenARTTag.prop("checked", false);
			becomeIndexLeadTag.val( true );
			referralGivenDNAPCRTag.prop("checked", false);
		}
	};
	
	me.setUp_DataElementTBScreeningConductedLogic = function()
	{
		var screeningConductedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TBScreeningConducted );
		var suspectedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TBSuspected );

		if( screeningConductedTag.prop("checked") )
		{
			suspectedTag.prop("checked", true);
			Util.disableTag( suspectedTag, true );
		}
		else
		{
			Util.disableTag( suspectedTag, false );
		}
	};

	me.setUp_OtherReasonTagLogic = function()
	{
		// HIVTestChannel
		var testChannelTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HIVTestChannel );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HIVTestChannel_OtherReason );
		var deIndexLeadCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_IndexLeadCUIC );
		if( testChannelTag.val() == "LS_CHA7" ) // [Other testing channel] Option
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
			
			me.setHideLogicTag( deIndexLeadCUICTag.closest("tr"), true );
			deIndexLeadCUICTag.val("");
		}
		else if( testChannelTag.val() == "LS_CHA4" ) // [Index] option
		{
			me.setHideLogicTag( deIndexLeadCUICTag.closest("tr"), false );
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
			
			me.setHideLogicTag( deIndexLeadCUICTag.closest("tr"), true );
			deIndexLeadCUICTag.val("");
		}
		
		// whatMotivatedHIVTest
		var whatMotivatedHIVTestTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhatMotivatedHIVTest );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhatMotivatedHIVTest_OtherReason );
		if( whatMotivatedHIVTestTag.val() == "OTHER" ) // Other (specifiy)
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}
		
		// Layger
		var layerTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Layer );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Layer_OtherReason );
		if( layerTag.val() == "LAY08" ) // Other (specifiy)
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}
		
		// ---------------------------------------------------------------------
		// Indexing section
		
		// Where was Lead identified?
		var whereLeadIdentifiedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhereLeadIdentified );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhereLeadIdentified_OtherReason );
		if( whereLeadIdentifiedTag.val() == "LS_ID0" ) // Other (specifiy)
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}
		
		// Health Facility of the Lead
		var healthFacilityOfLeadTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HealthFacilityOfLead );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_HealthFacilityOfLead_OtherReason );
		if( healthFacilityOfLeadTag.val() == "Other" ) // Other (specifiy)
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}

		// Lead relationship to client
		var leadRelationshipToClientTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_LeadRelationshipToClient );
		otherReasonTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_LeadRelationshipToClient_OtherReason );
		if( leadRelationshipToClientTag.val() == "LS_REL00" ) // Other (specifiy)
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), false );
		}
		else
		{
			me.setHideLogicTag( otherReasonTag.closest("tr"), true );
			otherReasonTag.val("");
		}
		

	};
		
	me.setUp_ClientTypeTagLogic = function()
	{
		var clientTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType );
		var partnerCUICOptTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt );
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		var coupleStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_CoupleStatus );
		var EQCPPTPassedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EQCPPTPassed );
		var resultTest1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest1 );
		var resultTest2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest2 );
		
		// Hide [Client partner's CUIC - Option] && [Client partner's CUIC] fields
		me.setHideLogicTag( partnerCUICOptTag, true );
		me.setHideLogicTag( partnerCUICTag, true );
		me.setHideLogicTag( coupleStatusTag, true );
		me.setHideLogicTag( EQCPPTPassedTag, true );
		
		
		// Individual
		if( clientTypeTag.val() == "LS_SER1" )
		{
			partnerCUICOptTag.val("");
			partnerCUICTag.val("");
			partnerCUICTag.closest( "td" ).find("span.partnerInfo").html("");
			partnerCUICTag.closest( "td" ).find("span.partnerInfo").hide();
		}
		// Couple test
		else if( clientTypeTag.val() == "LS_SER2" )
		{
			
			me.setHideLogicTag( partnerCUICOptTag, false );
			me.setHideLogicTag( coupleStatusTag, false );
			if( partnerCUICOptTag.val() == "" )
			{
				me.setHideLogicTag( partnerCUICTag, true ); 
				partnerCUICTag.val("");
			}
			else
			{
				me.setHideLogicTag( partnerCUICTag, false ); 
			}
		}
		// EQC / PPT
		else if( clientTypeTag.val() == "LS_SER3" )
		{
			partnerCUICOptTag.val("");
			partnerCUICTag.val("");
		
			Util.disableTag( resultTest1Tag, false ); 
			Util.disableTag( resultTest2Tag, false );
			
			// STEP 1. Hide all tbody and input in [New Test]
			Element.addEventFormTag.find("tbody[sectionid]").hide();
			Element.addEventFormTag.find("tbody[sectionid]").find("input,select").each(function(){
				me.setHideLogicTag( $(this), true );
			});
			
			// Show [Testing Material] section in [New Test]
			Element.addEventFormTag.find("tbody[sectionid='" + MetaDataID.section_TestingMaterial_Id + "']").show();
			Element.addEventFormTag.find("tbody[sectionid='" + MetaDataID.section_TestingMaterial_Id + "']").find("input,select").each(function(){
				me.setHideLogicTag( $(this), false );
			});
						
			
			// STEP 2. Show [Client Type] field
			var clientInfoTb = clientTypeTag.closest("tbody");
			clientInfoTb.show();
			me.setHideLogicTag( clientTypeTag, false );
			
			// STEP 2. Show [EQC / PPT Passed] field
			clientInfoTb = EQCPPTPassedTag.closest("tbody");
			clientInfoTb.show();
			me.setHideLogicTag( EQCPPTPassedTag, false );
			
			// STEP 3. Hide all fields in [Today] section
			var todayTestTb = resultTest1Tag.closest("tbody");
			todayTestTb.show();
			me.setHideLogicTag( resultTest1Tag, false );
			me.setHideLogicTag( resultTest2Tag, false );
			
			Element.addEventFormTag.find("tbody[sectionid].hideHeader").find("tr:not([header])").hide();
			
			Element.addEventFormTag.find("tbody[sectionid]").find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_ClientType 
						&&  $(this).attr("dataelement") != MetaDataID.de_EQCPPTPassed 
						&& $(this).attr("dataelement") != MetaDataID.de_Testing_ResultTest1 
						&& $(this).attr("dataelement") != MetaDataID.de_Testing_ResultTest2 )
				{
					 $(this).val("");
				}
			});
			
			// Reset data of [Testing Material] section in [New Test]
			Element.addEventFormTag.find("tbody[sectionid='" + MetaDataID.section_TestingMaterial_Id + "']").find("input,select").each(function(){
				$(this).val("");
			});
			// Show header [Testing Material]
			Element.addEventFormTag.find("tbody[sectionid='" + MetaDataID.section_TestingMaterial_Id + "']").find("tr[header]").show();
		}
		
	};
	

	// Set value for data element field [EQC/PPT Passed]
	me.populateEQCPPTPassedVal = function()
	{
		var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
		var lastName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_LastName );
		
		var EQCPPTPassedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EQCPPTPassed );
		if( me.resultTest1Tag.val() != "" && me.resultTest2Tag.val() != "" )
		{
			if( ( lastName == "POS" && me.resultTest1Tag.val() == "Positive" && me.resultTest1Tag.val() ==  me.resultTest2Tag.val() )
				 || ( lastName == "NEG" && me.resultTest1Tag.val() == "Negative" && me.resultTest1Tag.val() ==  me.resultTest2Tag.val() ) )
			{
				EQCPPTPassedTag.val("true");
			}
			else
			{
				EQCPPTPassedTag.val("false");
			}
		}
		else
		{
			EQCPPTPassedTag.val("");
		}
	}
	
	me.setUp_DataElementBMI = function()
	{
		var height = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Height ).val();
		var weight = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Weight ).val();
		var bmiTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_BMI );
		var result = "";

		if( height != "" && weight != "" )
		{
			result = weight / ( height * height );
			result = result.toFixed( 2 );
		}
		
		bmiTag.val( result );
	};	
	
	me.setUp_DataElementTimeSinceLastTest = function()
	{
		var timeSinceLastTestTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TimeSinceLastTest );
		var prevHIVTestDate = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_DateLastHIVTest ).val();

		if( prevHIVTestDate != "" )
		{
			prevHIVTestDate = Util.formatDate_DbDate( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_DateLastHIVTest ).val() );
			var noMonth = Util.getMonthsBetweenDates( Util.convertDateStrToObject( prevHIVTestDate ), new Date() );
			timeSinceLastTestTag.val( noMonth );
		}
		else
		{
			timeSinceLastTestTag.val( "" );
		}
	};
	
	me.setUp_PartnerCUICOption = function()
	{
		var partnerCUICOptTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt );
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		
		if( partnerCUICOptTag.val() != "" )
		{
			if( partnerCUICOptTag.val() == "2" )
			{
				// Generate data for [Partner CUIC]
				me.populateParterCUIC();
			}
			else
			{
				me.checkAndShowCheckedIconForPartnerCUICTag();
			}
			me.setHideLogicTag( partnerCUICTag, false );
		}
		else
		{
			me.setHideLogicTag( partnerCUICTag, true );
			partnerCUICTag.val("");
		}
	};
	
	me.setUp_ARTClosureForm = function()
	{
		var closureLinkageOutcomeTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome );
		var droppedReasonTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTLinkageStatusDropReason );
		var closureLinkageOutcomeVal = closureLinkageOutcomeTag.val();
		
		if( closureLinkageOutcomeVal == "" )
		{
			Element.artReferCloseFormTag.find("input,select").each(function(){
				me.setHideLogicTag( $(this), true);
				$(this).val("");
			});
		}
		else if( closureLinkageOutcomeVal == "SUCCESS" )
		{
			Element.artReferCloseFormTag.find("input,select").each(function(){
				me.setHideLogicTag( $(this), false);
			});
			
			
			me.setHideLogicTag( droppedReasonTag, true);
			droppedReasonTag.val("");
			me.removeMandatoryForField( droppedReasonTag );
			
			// Set Date picker for [Date of ART enrollment]
			var openingEventDate = JSON.parse( Element.artReferOpenFormTag.attr("event") );
			var dateARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_ART_Enrollment );		
			var minDate = new Date();
			minDate.setFullYear( minDate.getFullYear() - 100 );
			minDate = Util.convertDateObjToStr( minDate );
			Util.datePicker_SetDateRange( dateARTEnrollmentTag, minDate, Util.convertDateObjToStr( new Date() ) );
			
			dateARTEnrollmentTag.change();
			
			// Show/Hide [Other facility name]
			var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_ReferralFacilityName );
			var specialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_OtherSpecialFacilityName );
			me.setHideLogicTag( specialOtherFacilityNameTag, !( closeReferFacilityNameTag.val() == "Other" ) );
			if( closeReferFacilityNameTag.val() !== "Other" )
			{
				specialOtherFacilityNameTag.val("");
			}
			
			var artClosure_TimeElapsedTag = me.getAttributeField( MetaDataID.attr_ARTClosure_TimeElapsed );
			Util.disableTag( artClosure_TimeElapsedTag, true );
		}
		else if( closureLinkageOutcomeVal == "DROPPED" )
		{
			Element.artReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_ARTClosureLinkageOutcome
					&& $(this).attr("dataelement") != MetaDataID.de_ARTLinkageStatusDropReason )
				{
					me.setHideLogicTag( $(this), true);
					$(this).val("");
				}
			});
			
			me.setHideLogicTag( droppedReasonTag, false);
			me.addMandatoryForField( droppedReasonTag );
		}
		
		me.setHideLogicTag( closureLinkageOutcomeTag, false);
		closureLinkageOutcomeTag.val( closureLinkageOutcomeVal );
	};
	

	me.setUp_PrepReferClosureForm = function()
	{
		var closureLinkageOutcomeTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferClosureLinkageOutcome );
		var droppedReasonTag = me.getDataElementField(  Element.prepReferCloseFormTag, MetaDataID.de_prepReferLinkageStatusDropReason );
		var closureLinkageOutcomeVal = closureLinkageOutcomeTag.val();
		
		if( closureLinkageOutcomeVal == "" )
		{
			Element.prepReferCloseFormTag.find("input,select").each(function(){
				me.setHideLogicTag( $(this), true);
				$(this).val("");
			});
		}
		else if( closureLinkageOutcomeVal == "SUCCESS" )
		{
			Element.prepReferCloseFormTag.find("input,select").each(function(){
				me.setHideLogicTag( $(this), false);
			});
			
			Element.prepReferCloseFormTag.find("[dataelement='" + MetaDataID.de_prepReferLinkageStatusDropReason + "']").val("");
			
			
			me.setHideLogicTag( droppedReasonTag, true);
			me.removeMandatoryForField( droppedReasonTag );
			
			// Set Date picker for [Date of PrEP. Refer enrollment]
			var openingEventDate = JSON.parse( Element.prepReferOpenFormTag.attr("event") );
			var datePrepReferEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_prepRefer_Enrollment );		
			var minDate = new Date();
			minDate.setFullYear( minDate.getFullYear() - 100 );
			minDate = Util.convertDateObjToStr( minDate );
			Util.datePicker_SetDateRange( datePrepReferEnrollmentTag, minDate, Util.convertDateObjToStr( new Date() ) );
			
			datePrepReferEnrollmentTag.change();
			
			// Show/Hide [Other facility name]
			var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_ReferralFacilityName );
			var specialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_OtherSpecialFacilityName );
			me.setHideLogicTag( specialOtherFacilityNameTag, !( closeReferFacilityNameTag.val() == "Other" ) );
			if( closeReferFacilityNameTag.val() !== "Other" )
			{
				specialOtherFacilityNameTag.val("");
			}
			
			var closure_TimeElapsedTag = me.getAttributeField( MetaDataID.attr_PrepReferClosure_TimeElapsed );
			Util.disableTag( closure_TimeElapsedTag, true );
		}
		else if( closureLinkageOutcomeVal == "DROPPED" )
		{
			Element.prepReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_prepReferLinkageStatusDropReason )
				{
					me.setHideLogicTag( $(this), true);
					$(this).val("");
				}
			});
			
			me.setHideLogicTag( droppedReasonTag, false);
			me.addMandatoryForField( droppedReasonTag );
		}
		
		me.setHideLogicTag( closureLinkageOutcomeTag, false);
		closureLinkageOutcomeTag.val( closureLinkageOutcomeVal );
	};
	
	
	me.getDataElementField = function( formTag, deId )
	{
		return formTag.find( "input[dataElement='" + deId + "'],select[dataElement='" + deId + "']" );
	}
	
	me.setHideLogicTag = function( tab, hidden )
	{
		var rowTag = tab.closest("tr");
		if( hidden )
		{
			rowTag.find("input,select,textarea").val("");
			rowTag.addClass("logicHide");
			rowTag.hide();
		}
		else
		{
			rowTag.removeClass("logicHide");
			rowTag.show();
		}
	};
	
	
	// ----------------------------------------------------------------------------
	// Create Search Client form, Registration form and Entry form
	// ----------------------------------------------------------------------------
	
	me.createClientForm = function()
	{
		me.createRegisterClientForm();
		me.createDataEntryForm();
		
		// Remove header of [ART Attribute] form
		Element.artAttributeFormTag.find("tr[header]").remove();
	};
	
	// [ART Opening && Closure] form - Keep only tbodies of program section ( entry form )
	// ,remove all headers of attribute groups and merge input fields into the last program section tbody
	me.mergeARTAttributeFormAndEntryForm = function( formTag )
	{
		var programTb = Element.artReferOpenFormTag.find("tbody[sectionid]:last");
		formTag.find("tbody[groupid]").each(function(){
			$(this).find("tr[header]").remove();
			formTag.append( $(this).html() );
		});
		formTag.find("tbody[groupid]").remove();
	};
	
	me.mergePrepReferAttributeFormAndEntryForm = function( formTag )
	{
		var programTb = Element.prepReferOpenFormTag.find("tbody[sectionid]:last");
		formTag.find("tbody[groupid]").each(function(){
			$(this).find("tr[header]").remove();
			formTag.append( $(this).html() );
		});
		formTag.find("tbody[groupid]").remove();
	};
	
	// Create [Search Client] form with attribute-groups and program-attributes from server
	me.createRegisterClientForm = function()
	{
		me.createAttributeClientForm( Element.addClientFormTag, "LSHTC_Register_", false );
		me.createAttributeClientForm( Element.contactLogFormTag, "LSHTC_LOG_", true );
		
		me.createAttributeClientForm( Element.artAttributeFormTag, "LSHTC_ART_", false );
		me.createAttributeClientForm( Element.artReferCloseFormTag, "LSHTC_ARTClosure_G1", false );
		
		me.createAttributeClientForm( Element.prepReferAttributeFormTag, "LSHTC_PREPREF_G1", false );
		me.createAttributeClientForm( Element.prepReferCloseFormTag, "LSHTC_PrepReferClosure_G1", false );
		
		me.createAddRelationshipForm();
		
		// set validation for firstName and lastName
		me.getAttributeField( MetaDataID.attr_FirstName ).attr( "notAllowSpecialChars", true );
		me.getAttributeField( MetaDataID.attr_LastName ).attr( "notAllowSpecialChars", true );
		
		
		// Set Mandatory for [Consent to contact] field
		me.addMandatoryForField( me.getAttributeField( MetaDataID.attr_ConsentToContact ) );
		me.addMandatoryForField( me.getAttributeField( MetaDataID.attr_ContactDetails_phoneNumber ) );
		me.addMandatoryForField( me.getAttributeField( MetaDataID.attr_ContactDetails_District ) );
		me.addMandatoryForField( me.getAttributeField( MetaDataID.attr_ContactDetails_Council ) );
		me.addMandatoryForField( me.getAttributeField( MetaDataID.attr_NextOfKin_ConsenToContact ) );
		
		
		// Hide Councils list in [Contact Log] attribute form
		me.filterCouncilsByDistrict();
		
		// Add validation[EQC] for [First name]
		me.getAttributeField( MetaDataID.attr_FirstName ).attr( "valueNotAllow", "EQC" );
		
		//Add "DATE" picker for "Date" field
		Element.addClientFormTag.find("input[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.addClientFormTag.find("input[dateTimePicker='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
	};

	me.createAttributeClientForm = function( table, preFixGroupName, addHistoryDiv )
	{
		// STEP 1. Generate fields into the table
				
		for( var i = me.attributeGroupList.length - 1; i >= 0; i-- )
		{
			var group = me.attributeGroupList[i];
			
			if( group.code.indexOf( preFixGroupName ) == 0 )
			{
				var groupName = group.name.split("-")[1];
				
				// STEP 2. Populate attribute-group name
				
				var tbody = $("<tbody groupId='" + group.id + "'></tbody>");
				
				// Create header with group name
				var headerTag = $("<tr header='true'></tr>");
				headerTag.append("<th colspan='4' style='border-right:0px;'><img style='float:left' class='arrowDownImg showHide' src='../images/down.gif'> " + groupName + " <span style='display:none;float:right' class='saveMsg'>Save</span></th>" );
				tbody.append( headerTag );
				
				// Create header with group name
				var translatedDiscardChanges = me.translationObj.getTranslatedValueByKey( "contactLogForm_tab_discardChanges" );
				var translatedSaveChanges = me.translationObj.getTranslatedValueByKey( "contactLogForm_tab_saveChanges" );
				
				
				// Add event for header to collapse the fields inside
				me.setUp_ClientRegistrationFormHeaderEvent( headerTag, table, "groupId" );
				
				
				// STEP 3. Populate attributes in group
				
				var list = me.attributeGroupList[i].list;
				for( var j in list)
				{
					var attribute = list[j];
					var rowTag = $("<tr></tr>");
					
					// STEP 3.1. Populate the name of attribute
					
					if( !attribute.mandatory )
					{
						rowTag.append("<td colspan='2'>" + attribute.shortName + "</td>");
					}
					else
					{						
						rowTag.append("<td colspan='2'>" + attribute.shortName + " <span class='required'>*</span></td>");
					}
					
					// STEP 3.2. Generate the input/select tag based on the valueType of attribute
					
					var inputTag = me.inputTagGeneration.generateInputTag( attribute, "attribute" );
					
					var inputColTag = $("<td colspan='2'></td>");
					inputColTag.append( inputTag );
					rowTag.append( inputColTag );
					tbody.append( rowTag );
					
				} // END Attribute List
				
				if( addHistoryDiv )
				{
					// Add Action bar for each section
					var actionTag = $("<tr class='actionBar' style='display:none;'></tr>");
					actionTag.append("<th style='width:20px;' class='actionCell'><button class='discardBtn imgBtn'><span class='glyphicon glyphicon-ban-circle'></span></button></th>");
					actionTag.append("<th colspan='2'><span style='float:left;'>" + translatedDiscardChanges + "</span><span style='float:right;'>" + translatedSaveChanges + "</span></th>");
					actionTag.append("<th style='width:20px;' class='actionCell'><button class='saveBtn imgBtn'><span class='glyphicon glyphicon-floppy-disk'></span></button></th>");	
					tbody.append( actionTag );
				}
				
				table.prepend( tbody );
				
				
				if( addHistoryDiv )
				{
					var historyGroupTb = $( "<tbody historyGroupId='" + group.id + "' style='display:none;'></tbody>" );
					var historyHeaderTag = $("<tr header='true'></tr>");					
					historyHeaderTag.append("<th colspan='3'><img style='float:left' class='arrowDownImg showHide' src='../images/down.gif'> " + groupName + "<span style='float:right;'>Edit</span></th>" );
					historyHeaderTag.append("<th style='width:20px;'><span style='cursor:pointer;' class='editBtn glyphicon glyphicon-pencil'></th>");
					historyGroupTb.append( historyHeaderTag );		

					historyGroupTb.append( "<tr><td colspan='4' class='historyInfo'></td></tr>" );
					
					// Add event for header to collapse the fields inside
					me.setUp_ClientRegistrationFormHeaderEvent( historyHeaderTag, table, "historyGroupId" );
					
					// Add event for Edit form and Save data
					me.setUp_Events_EditSectionContactLogForm( table, historyHeaderTag );
					
					table.prepend( historyGroupTb );
				}
			}// END Attribute Groups
			
			// Add logic for [Add Client form]
			me.setUp_ClientRegistrationFormValidation();
			
			// Add logic for [Add Client form]
			me.setUp_Events_ClientRegistrationFormDataLogic();
		}
	};
	
	me.createAddRelationshipForm = function()
	{
		var formTag = $("<table class='table table-hover table-striped previousTestTb'></table>");
		var attributeList = me.metaData.programAttributes.programTrackedEntityAttributes;
		
		
		var idConfigList = Relationships.addRelationShipFormIds;
		for( var i=0; i<idConfigList.length; i++ )
		{
			var idConfig = idConfigList[i];
			var detailsConfig;
			
			if( idConfig.type == "dataelement" && me.metadata_dataElements[idConfig.id] )
			{
				detailsConfig = me.metadata_dataElements[idConfig.id].dataElement;
				detailsConfig.displayName = detailsConfig.formName;
			}
			else if( idConfig.type == "attribute" &&  me.metadata_Attributes[idConfig.id] )
			{
				detailsConfig = me.metadata_Attributes[idConfig.id].trackedEntityAttribute;
				detailsConfig.displayName = detailsConfig.name;
			}
		
			
			if( detailsConfig )
			{
				// Override "mandatory" for orginal metadata config
				detailsConfig.mandatory = idConfig.mandatory;
				
				var rowTag = $("<tr></tr>");

				var mandatoryTag = ( detailsConfig.mandatory == "true" ) ? "<span class='required'> *</span>" : "";
				rowTag.append("<td>" + detailsConfig.displayName + mandatoryTag + "</td>");
				
				if( idConfig.id == "JRV6Z03Cu5H" )
				{
					var fadfs = 0;
				}
				var inputTag = me.inputTagGeneration.generateInputTag( detailsConfig, idConfig.type );
				
				var inputColTag = $("<td></td>");
				if( detailsConfig.valueType == "DATE" )
				{
					var dateDivtag = $("<div style='position: relative; display: table; width: 100%'></div>");
					dateDivtag.append( inputTag );

					inputColTag.append( dateDivtag );
				}
				else
				{
					inputColTag.append( inputTag );
				}
				
				
				rowTag.append( inputColTag );
				
				formTag.append( rowTag );
			}
		}
		
		Element.addRelationshipFormDivTag.prepend( formTag );
		
		Element.addRelationshipFormDivTag.find("input[isDate='true']").each(function(){
			if( $(this).attr("dataelement") == MetaDataID.de_DueDate )
			{
				Util.dateFutureOnlyPicker( $(this) );
			}
			else
			{
				Util.datePicker( $(this) );
			}
		});
		

		me.setUp_validationCheck( Element.addRelationshipFormDivTag.find( 'input,select,textarea' ) );
		
		me.setUp_Events_AddRelationshipForm();
	};
	
	
	me.setUp_Events_AddRelationshipForm = function()
	{
		Element.addRelationshipFormDivTag.find("[dataElement='" + MetaDataID.de_RelationshipType + "']").change( function(){
			var IPV1Tag = Element.addRelationshipFormDivTag.find("[attribute='" + MetaDataID.attr_IPV1 + "']");
			var IPV2Tag = Element.addRelationshipFormDivTag.find("[attribute='" + MetaDataID.attr_IPV2 + "']");
			var IPV3Tag = Element.addRelationshipFormDivTag.find("[attribute='" + MetaDataID.attr_IPV3 + "']");
			var IPVOutcomeTag = Element.addRelationshipFormDivTag.find("[attribute='" + MetaDataID.attr_IPVOutcome + "']");
			
			var value = $(this).val();
			
			if( value == "CH") // "Biological Child"
			{
				me.setHideLogicTag( IPV1Tag, true );
				me.setHideLogicTag( IPV2Tag, true );
				me.setHideLogicTag( IPV3Tag, true );
				me.setHideLogicTag( IPVOutcomeTag, true );
			}
			else
			{
				me.setHideLogicTag( IPV1Tag, false );
				me.setHideLogicTag( IPV2Tag, false );
				me.setHideLogicTag( IPV3Tag, false );
				me.setHideLogicTag( IPVOutcomeTag, false );
			}
		});
		
		Element.addRelationshipBtnTag.click( function(){
			
			if( me.validationObj.checkFormEntryTagsData( Element.addRelationshipFormDivTag ) )
			{
				var jsonData = me.createRelationshipJsonData();
				var loadingMsg = me.translationObj.getTranslatedValueByKey( "relationship_addRelationshipForm_msg_saving" );
				
				$.ajax(
					{
						type: "POST"
						,url: "../client/addRelationship"
						,dataType: "json"
						,data: JSON.stringify( jsonData )
			            ,contentType: "application/json;charset=utf-8"
			            ,beforeSend: function( xhr ) 
			            {
			            	MsgManager.appBlock( loadingMsg + " ..." );
			            }
						,success: function( response ) 
						{		
							Element.addRelationshipFormDivTag.dialog( "close" );	
							
							var savedSuccessedMsg = me.translationObj.getTranslatedValueByKey( "relationship_addRelationshipForm_msg_saved" );
							MsgManager.msgAreaShow( savedSuccessedMsg );

							// Update Client B
							
							var clientData = {};
							clientData.client = response;
							clientData.enrollments = response.enrollments;
							var clientBId = clientData.client.trackedEntityInstance;
							
							var latestEnrollment = ClientUtil.getLatestEnrollment( clientData.enrollments );
							if( jsonData[MetaDataID.stage_HIVTesting] != undefined && latestEnrollment != undefined )
							{
								if( latestEnrollment.events == undefined )
								{
									latestEnrollment.events = [];
								}
								
								jsonData[MetaDataID.stage_HIVTesting].eventDate = Util.getCurrentDate();
								jsonData[MetaDataID.stage_HIVTesting].event = response.hivEventId;
								
								latestEnrollment.events.push( jsonData[MetaDataID.stage_HIVTesting] );
								
								jsonData[MetaDataID.stage_ContactLog].eventDate = Util.getCurrentDate();
								jsonData[MetaDataID.stage_ContactLog].event = response.contactLogEventId;
								latestEnrollment.events.push( jsonData[MetaDataID.stage_ContactLog] );
							}
							
							// Add relationship for clientB
							var relationshipName = me.mainPage.settingsManagement.relationshipTypes[jsonData.relationshipType];
							if( clientData.client.relationships == undefined )
							{
								clientData.client.relationships = [];
							}
							var newRelationship = Relationships.genrateRelationshipJson( jsonData.clientAId, clientBId, jsonData.relationshipType, relationshipName );
							clientData.client.relationships.push( newRelationship );
							me.clientDataList[clientBId] = clientData;
							
							
							me.relationshipsObj.relationshipTEI_List[ clientBId ] = {
									"relationshipType" : newRelationship.relationshipName,
									"created": newRelationship.created,
									"client": clientData.client,
									"enrollments": clientData.enrollments
							};
							
							
							// Add relationship for clientA
							var clientAId = jsonData.clientAId;
							var clientAIData = me.clientDataList[clientAId];
							
							if( clientAIData.client.relationships == undefined )
							{
								clientAIData.client.relationships = [];
							}
							newRelationship = Relationships.genrateRelationshipJson( clientBId, clientAId, jsonData.relationshipType, relationshipName );
							clientAIData.client.relationships.push( newRelationship );
							me.clientDataList[clientAId] = clientAIData;
							

							me.relationshipsObj.relationshipTEI_List[ clientAId ] = {
									"relationshipType" : newRelationship.relationshipName,
									"created": newRelationship.created,
									"client": clientAIData.client,
									"enrollments": clientAIData.enrollments
							};
							
							
							// Update list of relationship information
							me.addRelationshipRow( clientData, Util.getCurrentDate(), relationshipName );
							
							
							// Show the "MainClient" form
							Element.searchResultTag.hide();
							Element.addClientFormDivTag.show();
						}
						,error: function(response)
						{
							console.log( response );
						}
					}).always( function( data ) {
						MsgManager.appUnblock();
					});
			}
		});
		
		Element.cancelRelationshipBtnTag.click( function(){
			Element.addRelationshipFormDivTag.dialog( "close" );	
		})
	};
	
	
	me.createRelationshipJsonData = function()
	{
		var jsonData = { };
		
		jsonData.ouId = Element.orgUnitListTag.val();
		jsonData.loginUsername = me.mainPage.settingsManagement.loginUsername;
		
		// Client Ids
		
		jsonData.clientAId = JSON.parse( Element.addClientFormTabTag.attr( "client" ) ).trackedEntityInstance;
		
		var clientBId = Element.addRelationshipFormDivTag.attr("clientId");
		if( clientBId )
		{
			jsonData.clientBId = clientBId; 
		}

		// RelationshipType
		var deRelationshipType =  Element.addRelationshipFormDivTag.find( "[dataElement='" + MetaDataID.de_RelationshipType + "']").val();
		var relationshipTypeId = ( deRelationshipType == "SP" ) ? MetaDataID.reType_SexParner : MetaDataID.reType_ParentChild ;// CH
		jsonData.relationshipType = relationshipTypeId;
		
		// Attributes
		
		// Set value for [LS - Client Info - Client Acquisition(nUTGX5v69V9)] field
		var clientAcquisitionVal = ( deRelationshipType.value == "SP" ) ? "SP" : "CH";
		var attributes = Util.getArrayJsonData( "attribute", Element.addRelationshipFormDivTag, false );
		attributes.push({ "attribute" : MetaDataID.attr_ClientAcquisition, "value" : clientAcquisitionVal });
		
		jsonData.client = {};
		jsonData.client.attributes = attributes;

		if( Element.addRelationshipFormDivTag.attr( "hivTestFinalStatus" ) !== "Positive" )
		{
			// Data elements
			jsonData[MetaDataID.stage_HIVTesting] = {
					"programStage": MetaDataID.stage_HIVTesting,
					"dataValues":[
						{
							"dataElement" : MetaDataID.de_HIV_Status, 
							"value" : Util.getJsonDataValue( Element.addRelationshipFormDivTag.find( "[dataelement='" + MetaDataID.de_HIV_Status + "']"), "dataelement" ).value
						},
						{
							"dataElement" : MetaDataID.de_Notification_Method, 
							"value" : Util.getJsonDataValue( Element.addRelationshipFormDivTag.find( "[dataelement='" + MetaDataID.de_Notification_Method + "']"), "dataelement" ).value
						}
					]
			};
			
			var deFinalResultHIVStatusTag = Element.addRelationshipFormDivTag.find( "[dataelement='" + MetaDataID.de_FinalResult_HIVStatus + "']");
			if( deFinalResultHIVStatusTag.attr("disabled") == undefined && deFinalResultHIVStatusTag.val() != "" )
			{
				jsonData[MetaDataID.stage_HIVTesting].dataValues.push({
					"dataElement" : MetaDataID.de_FinalResult_HIVStatus, 
					"value" : Util.getJsonDataValue( deFinalResultHIVStatusTag, "dataelement" ).value
				});
			}
			
			// [Contact Log] event
			jsonData[MetaDataID.stage_ContactLog] = {
					"programStage": MetaDataID.stage_ContactLog,
					"dataValues":[
						{
							"dataElement" : MetaDataID.de_DueDate, 
							"value" : Util.getJsonDataValue( Element.addRelationshipFormDivTag.find( "[dataelement='" + MetaDataID.de_DueDate + "']"), "dataelement" ).value
						},
						{
							"dataElement" : MetaDataID.de_TypeOfContact,
							"value" : "CLIENT"
						},
						{
							"dataElement" : MetaDataID.de_NextAction,
							"value" : "NONE"
						},
						{
							"dataElement" : MetaDataID.de_Outcome,
							"value" : "TBD"
						}
					]
			};
		}
			
		
		return jsonData;
	}
	
	me.setUp_Events_EditSectionContactLogForm = function( formTag, historyHeaderTag )
	{
		var editBtnTag = historyHeaderTag.find("span.editBtn");
		var historyGroupTbTag = historyHeaderTag.closest("tbody[historyGroupId]");
		var groupId = historyGroupTbTag.attr("historyGroupId");
		
		var editForm= formTag.find("tbody[groupId='" + groupId + "']");
		var headerTag = editForm.find("tr[header='true']");
		var saveBtnTag = editForm.find("button.saveBtn");
		var discardBtnTag = editForm.find("button.discardBtn");
		
		editBtnTag.click( function(){
			historyGroupTbTag.hide();
			editForm.show();
			editForm.find("tr.actionBar").show();
			editForm.addClass("separateTb");
			return false;
		});
		
		saveBtnTag.click( function(){
			
			me.saveClient( Element.contactLogFormTag, function( id ){
				me.showHistoryContactLogDetails( id );
				editForm.removeClass("separateTb");
			}, groupId );
			return false;
		});
		
		discardBtnTag.click( function(){
			var translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_discardChanges" );
			var result = confirm( translatedText );			
			if( result )
			{
				// Reset data
				Util.resetForm( Element.contactLogFormTag );
				var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
				me.populateClientAttrValues( Element.contactLogFormTag, jsonClient );
				
				// Show history form
				editForm.hide();
				historyGroupTbTag.show();
				editForm.removeClass("separateTb");

				translatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_contactLogForm_changesDiscarded" );
				MsgManager.msgAreaShow( translatedText, "SUCCESS" );
			}
			return false;
		});
	};
	
	
	// Create [Data Entry form]
	
	me.createDataEntryForm = function()
	{
		// ---------------------------------------------------------------------
		// STEP 0. Create the [Created by] message for active event
		me.createDataEntryForm_Header();
		
		// STEP 1. Create the [Entry form] tables
		me.generateDataEntryFormTable( Element.addEventFormTag, MetaDataID.stage_HIVTesting );
		
		me.generateDataEntryFormTable( Element.artReferOpenFormTag, MetaDataID.stage_ARTReferralOpenning );
		me.generateDataEntryFormTable( Element.artReferCloseFormTag, MetaDataID.stage_ARTReferralClosure );
		

		me.generateDataEntryFormTable( Element.prepReferOpenFormTag, MetaDataID.stage_prepReferralOpenning );
		me.generateDataEntryFormTable( Element.prepReferCloseFormTag, MetaDataID.stage_prepReferralClosure );
		
		
		// [New Test] Tab
		me.createDataEntryForm_NewTestTab();
		
		// [Contact Log] tab
		me.createDataEntryForm_ContactLogTab();
		
		// [ART Refer.] form
		me.createDataEntryForm_ARTReferTag();
		

		// [PrEP Refer.] form
		me.createDataEntryForm_PrepReferTag();
		
		
		// ---------------------------------------------------------------------
		// LOGIC for Data elements in [New Test] Tab

		var everTestedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EverTested );
		everTestedTag.change( function(){
			me.setUp_ClientRegistrationFormLogic_everTested();
		});
		
		
		var testTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestType );
		testTypeTag.change( function(){
			me.setUp_ClientRegistrationFormLogic_testType();
		});

	};

	me.createDataEntryForm_Header = function()
	{
		var translatedByText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_thisTest_msg_createdBy" );	
		Element.addEventFormTag.closest("form").prepend( "<div id='activeEventHeader' class='testMsg'>" + translatedByText + " '<span>" + Element.userFullNameTag.html() + "</span>'</div>" );
		
		translatedByText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_tab_thisTest_msg_alreadyTodayTest" );	
		Element.addEventFormTag.closest("form").prepend( "<div id='notAllowToCreateEventHeader' class='testMsg' style='display:none;color:red'>" + translatedByText + "</div>" );
		
	};
	
	me.createDataEntryForm_NewTestTab = function()
	{
		// Set readonly for [auto-fill-data] fields
		Util.readonlyTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC ) );
		Util.readonlyTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_CoupleStatus ) );
		Util.readonlyTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Age ) );
		Util.readonlyTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_BMI ) );
		Util.readonlyTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TimeSinceLastTest ) );
		
		
		// Disable some DEs in form. Will add logic for these DE by using 'change' event		
		var resultTest1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest1 );
		var resultTest2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest2 );
		var resultTestParallel1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel1 );
		var resultTestParallel2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel2 );
		var resultTestResultSDBiolineTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultSDBioline );
		var resultFinalHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus );
		
		if( resultTest1Tag.length > 0 && resultTest2Tag.length > 0 && resultTestParallel1Tag.length > 0 
				&& resultTestParallel2Tag.length > 0 && resultTestResultSDBiolineTag.length > 0 
				&& resultFinalHIVStatusTag.length > 0 )
		{
			 Element.addClientFormTabTag.attr( "addedLogic", true );

			 // Add "mandatory" validation for "Test 1" field
			 
			 me.addMandatoryForField( resultTest1Tag );

			 Util.disableTag( resultFinalHIVStatusTag, true ); 
			 me.addMandatoryForField( resultFinalHIVStatusTag );
		}
		else
		{
			Element.addClientFormTabTag.attr("addedLogic", false );
		}
		
		// ---------------------------------------------------------------------
		// Partner information
		
		// Add details icon for Partner CUIC tag
		var imgTag = $( "<span class='glyphicon glyphicon-ok form-control-feedback partnerDetails' style='color:green;padding-top: 8px;padding-right: 10px;'></span>"  );
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		partnerCUICTag.closest( "td" ).append( imgTag );
		partnerCUICTag.closest( "td" ).css( "position", "relative" );
		partnerCUICTag.closest( "td" ).append("<span style='display:none;' class='partnerInfo'></span>");
		
		// Set [Partner Event UID] field hidden
		var partnerEventIdTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId );
		partnerEventIdTag.attr( "type", "hidden" );
		partnerEventIdTag.closest("tr").find("td").hide();
		
	};
	
	me.createDataEntryForm_ContactLogTab = function()
	{
		// Generate data elements for [Contact Log] event form
		for( var i in me.contactLogDeList )
		{
			var psDE = me.contactLogDeList[i];
			var deId = psDE.dataElement.id;
			
			var colTag = Element.contactLogEventFormTag.find("[dataelementtag='" + deId + "']");
			var inputTag = me.inputTagGeneration.generateInputTag( psDE.dataElement, "dataelement" );
			colTag.append( inputTag );
			
			if( psDE.compulsory )
			{
				me.addMandatoryForField( inputTag );
			}
		}
		
		
		// Add "DATE" picker for "Date" field
		Element.addContactLogEventFormTag.find("input[isDate='true']").each(function(){
			if( $(this).attr("dataelement") == MetaDataID.de_DueDate )
			{
				Util.dateFutureOnlyPicker( $(this) );
			}
			else
			{
				Util.datePicker( $(this) );
			}
		});
		
		Element.addContactLogEventFormTag.find("input[isDateTime='true']").each(function(){
			if( $(this).attr("dataelement") == MetaDataID.de_DueDate )
			{
				Util.dateFutureOnlyPicker( $(this) );
			}
			else
			{
				Util.dateTimePicker( $(this) );
			}
		});
		
	};
	
	me.createDataEntryForm_ARTReferTag = function()
	{
		// ---------------------------------------------------------------------
		// [ART Opening] form
		// ---------------------------------------------------------------------
		
		// Set autocompleted for [Referral facility name]
		var referralFacilityNameTag = me.getDataElementField( Element.artReferOpenFormTag, MetaDataID.de_ARTOpen_ReferralFacilityName );
		if( referralFacilityNameTag.length > 0 )
		{
			Util.setAutoCompleteTag( referralFacilityNameTag );
		}
		
		// Add event for [Referral facility name]
		var specialOtherFacilityNameTag = me.getDataElementField( Element.artReferOpenFormTag, MetaDataID.de_ARTOpen_OtherSpecialFacilityName );
		referralFacilityNameTag.change( function(){
			specialOtherFacilityNameTag.val( "" );
			if( referralFacilityNameTag.val() == "Other" )
			{
				me.setHideLogicTag( specialOtherFacilityNameTag, false ); 
				me.addMandatoryForField( specialOtherFacilityNameTag );
			}
			else
			{
				me.setHideLogicTag( specialOtherFacilityNameTag, true ); 
				specialOtherFacilityNameTag.val("");
				me.removeMandatoryForField( specialOtherFacilityNameTag );
			}
		});

		//Add "DATE" picker for "Date" field
		Element.artReferOpenFormTag.find("input[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.artReferOpenFormTag.find("input[isDateTime='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
		
		// Set mandatory for attributes in form
		Element.artReferOpenFormTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			me.addMandatoryForField( $(this) );
		});
		
		
		// ---------------------------------------------------------------------
		// [ART Closure] form
		// ---------------------------------------------------------------------
		
		// Resolve [ART Closure] entry forms
		me.mergeARTAttributeFormAndEntryForm( Element.artReferCloseFormTag );

		//  Set mandatory for attributes in form
		Element.artReferCloseFormTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			me.addMandatoryForField( $(this) );
		});

		// Disable "Time elapse" attribute field
		Util.disableTag( me.getAttributeField( MetaDataID.attr_ARTClosure_TimeElapsed ), true );
		
		//Add "DATE" picker for "Date" field
		Element.artReferCloseFormTag.find("input[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.artReferCloseFormTag.find("input[isDateTime='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
		
		// Set autocompleted for [Referral facility name] in [ART Closure] form
		var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_ReferralFacilityName );
		if( closeReferFacilityNameTag.length > 0 )
		{
			Util.setAutoCompleteTag( closeReferFacilityNameTag );
		}
		
		// Add event for [Referral facility name]
		var closeSpecialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_OtherSpecialFacilityName );
		closeReferFacilityNameTag.change(function(){
			if( closeReferFacilityNameTag.val() == "Other" )
			{
				me.setHideLogicTag( closeSpecialOtherFacilityNameTag, false );
				me.addMandatoryForField( closeSpecialOtherFacilityNameTag );
			}
			else
			{
				me.setHideLogicTag( closeSpecialOtherFacilityNameTag, true ); 
				closeSpecialOtherFacilityNameTag.val("");
				me.removeMandatoryForField( closeSpecialOtherFacilityNameTag );
			}
		});
		
		// Linkage Status event
		var closureLinkageOutcomeTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome );
		closureLinkageOutcomeTag.change( function(){
			me.setUp_ARTClosureForm();
		});
		
		// Set up Event of [Date Of ART Enrollment] field
		var dateOfARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_ART_Enrollment );
		dateOfARTEnrollmentTag.on('dp.change', function(e){ 
			me.calulate_ARTClosureTimeElapsed();
		});
	};

	me.createDataEntryForm_PrepReferTag = function()
	{
		// ---------------------------------------------------------------------
		// [PrEP Refer. Opening] form
		// ---------------------------------------------------------------------
		
		// Set autocompleted for [Referral facility name]
		var referralFacilityNameTag = me.getDataElementField( Element.prepReferOpenFormTag, MetaDataID.de_prepReferOpen_ReferralFacilityName );
		if( referralFacilityNameTag.length > 0 )
		{
			Util.setAutoCompleteTag( referralFacilityNameTag );
		}
		
		// Add event for [Referral facility name]
		var specialOtherFacilityNameTag = me.getDataElementField( Element.prepReferOpenFormTag, MetaDataID.de_prepReferOpen_OtherSpecialFacilityName );
		referralFacilityNameTag.change( function(){
			if( referralFacilityNameTag.val() == "Other" )
			{
				me.setHideLogicTag( specialOtherFacilityNameTag, false ); 
				me.addMandatoryForField( specialOtherFacilityNameTag );
			}
			else
			{
				me.setHideLogicTag( specialOtherFacilityNameTag, true ); 
				specialOtherFacilityNameTag.val("");
				me.removeMandatoryForField( specialOtherFacilityNameTag );
			}
		});

		//Add "DATE" picker for "Date" field
		Element.prepReferOpenFormTag.find("input[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.prepReferOpenFormTag.find("input[isDateTime='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
		
		// Set mandatory for attributes in form
		Element.prepReferOpenFormTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			me.addMandatoryForField( $(this) );
		});
		
		
		// ---------------------------------------------------------------------
		// [PrEP Refer. Closure] form
		// ---------------------------------------------------------------------
		
		// Resolve [PrEP Refer. Closure] entry forms
		me.mergePrepReferAttributeFormAndEntryForm( Element.prepReferCloseFormTag );
		
		
		//  Set mandatory for attributes in form
		Element.prepReferCloseFormTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			me.addMandatoryForField( $(this) );
		});
		

		// Disable "Time elapse" attribute field
		Util.disableTag( me.getAttributeField( MetaDataID.attr_PrepReferClosure_TimeElapsed ), true );

		
		//Add "DATE" picker for "Date" field
		Element.prepReferCloseFormTag.find("input[isDate='true']").each(function(){
			Util.datePicker( $(this) );
		});
		
		Element.prepReferCloseFormTag.find("input[isDateTime='true']").each(function(){
			Util.dateTimePicker( $(this) );
		});
		
		// Set autocompleted for [Referral facility name] in [ART Closure] form
		var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_ReferralFacilityName );
		if( closeReferFacilityNameTag.length > 0 )
		{
			Util.setAutoCompleteTag( closeReferFacilityNameTag );
		}
		
		// Add event for [Referral facility name]
		var closeSpecialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_OtherSpecialFacilityName );
		closeReferFacilityNameTag.change(function(){
			if( closeReferFacilityNameTag.val() == "Other" )
			{
				me.setHideLogicTag( closeSpecialOtherFacilityNameTag, false );
				me.addMandatoryForField( closeSpecialOtherFacilityNameTag );
			}
			else
			{
				me.setHideLogicTag( closeSpecialOtherFacilityNameTag, true ); 
				closeSpecialOtherFacilityNameTag.val("");
				me.removeMandatoryForField( closeSpecialOtherFacilityNameTag );
			}
		});
		
		
		
		// Linkage Status event
		var closureLinkageOutcomeTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferClosureLinkageOutcome );
		closureLinkageOutcomeTag.change( function(){
			me.setUp_PrepReferClosureForm();
		});
		
		// Set up Event of [Date Of ART Enrollment] field
		var dateOfARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_prepRefer_Enrollment );
		dateOfARTEnrollmentTag.on('dp.change', function(e){ 
			me.calulate_PrepReferClosureTimeElapsed();
		});
		
//		me.setUp_PrepReferClosureForm();
	};

	
	// ----------------------------------------------------------------------------
	// Add logic in [Add Client] Form
	// ----------------------------------------------------------------------------
	
	me.setUp_ClientRegistrationFormHeaderEvent = function( headerTag, tableTag, attrName )
	{
		// --------------------------------------------------------------
		// Set up to Show/Hide event data in "Previous" TAB
		// --------------------------------------------------------------

		headerTag.find("th:first").click(function(){

			var imgTag = $(this).find("img.showHide");
			
			// STEP 1. Display table of selected header
			
			var groupId = $(this).closest('tbody[' + attrName + ']').attr( attrName );
			var tbodyTag = tableTag.find("tbody[" + attrName + "='" + groupId + "']");
			var closed = imgTag.hasClass("arrowRightImg");
			tbodyTag.removeClass("separateTb");
			
			// STEP 2. Show the selected event
			
			if( closed )
			{
				imgTag.attr( "src", "../images/down.gif" );
				imgTag.addClass('arrowDownImg');
				imgTag.removeClass('arrowRightImg');
				tbodyTag.find("tr:not([header])").show("fast");
				tbodyTag.removeClass( "hideHeader" );
				
				tbodyTag.find("tr.actionBar").show();
			}
			// Hide the selected event
			else
			{
				imgTag.attr( "src", "../images/tab_right.png" );
				imgTag.removeClass('arrowDownImg');
				imgTag.addClass('arrowRightImg');
				tbodyTag.find("tr:not([header])").hide("fast");
				tbodyTag.addClass( "hideHeader" );
				
				tbodyTag.addClass("separateTb");
				tbodyTag.find("tr.actionBar").hide();
			}

			// Always hide some hidden attributes
			tbodyTag.find("tr[alwaysHide]").hide();
		});

	};
	
	me.setUp_ClientRegistrationFormValidation = function()
	{
		// Disable [Client CUIC] field. The value of this attribute will be generated from another attribute values		
		Util.disableTag( me.getAttributeField( MetaDataID.attr_ClientCUIC ), true );
		
		// Add [Delete] button for [Date Of Birth] field
		var dobTag = me.getAttributeField( MetaDataID.attr_DoB );
		dobTag.attr( "readonly", true );
		
		// Add [Min-Len] for [First name] and [Last name]
		me.getAttributeField( MetaDataID.attr_FirstName ).attr( "minlength", 2 );
		me.getAttributeField( MetaDataID.attr_LastName ).attr( "minlength", 2 );
		
	};
	
	me.setUp_ClientRegistrationFormDataLogic = function()
	{
		// Attribute Logic
		me.setUp_ClientRegistrationFormLogic_sexField();
		me.setUp_ClientRegistrationFormLogic_Age();
		
		// DE Logic
		me.setUp_ClientRegistrationFormLogic_everTested();
		me.setUp_ClientRegistrationFormLogic_testType();
	}
	
	
	me.setUp_Events_ClientRegistrationFormDataLogic = function()
	{
		// ---------------------------------------------------------------------
		// Set up event for [Sex] field
		// ---------------------------------------------------------------------
		
		var sexTag = me.getAttributeField( MetaDataID.attr_Sex );
		sexTag.change( function(){
			var keyPopulationTag = me.getAttributeField( MetaDataID.attr_KeyPopulation );
			keyPopulationTag.val("");
			
			// Only when data of client is saved, the data values of [New Test] get changed
			var jsonClient = Element.addClientFormTabTag.attr("client");
			var gender = "";
			if( jsonClient != undefined )
			{
				jsonClient = JSON.parse( jsonClient );
				var gender = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_Sex  );
				if( gender == sexTag.val() )
				{
					var circumcisedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_circumcisedTag );
					circumcisedTag.val("");
				}
			}
			
			me.setUp_ClientRegistrationFormLogic_sexField();
		});

		
		// ---------------------------------------------------------------------
		// Set up event for [DoB] field
		// ---------------------------------------------------------------------
		
		var dobTag = me.getAttributeField( MetaDataID.attr_DoB );
		dobTag.change( function(){
			var ppocvTag = me.getAttributeField( MetaDataID.attr_PPOVC );
			ppocvTag.val("");
			
			me.setUp_ClientRegistrationFormLogic_Age();
		});
		
	};
	
	
	// Add logic for [keyPopulation] fields
	me.setUp_ClientRegistrationFormLogic_sexField = function()
	{
		var sexTag = me.getAttributeField( MetaDataID.attr_Sex );
		var keyPopulationTag = me.getAttributeField( MetaDataID.attr_KeyPopulation );

		var circumcisedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_circumcisedTag );
		var referralGivenVMMCTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ReferralGiven_VMMC );
		var referralOfferedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Referral_Offered );
		
		// Reset option values for attribute [Key Population]
		keyPopulationTag.find("option").hide();
		keyPopulationTag.find("option[value='']").show();
		
		// Reset data element [Circumcised]
		me.setHideLogicTag( circumcisedTag, false );
		
		// Only when data of client is saved, the data values of [New Test] get changed
		var jsonClient = Element.addClientFormTabTag.attr("client");
		var dataSaved = false;
		if( jsonClient != undefined )
		{
			jsonClient = JSON.parse( jsonClient );
			var gender = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_Sex  );
			if( gender == sexTag.val() )
			{
				dataSaved = true;
			}
		}
		
		if( sexTag.val() == "M" )
		{
			keyPopulationTag.find("option[value='MSMSW']").show();
			keyPopulationTag.find("option[value='MSMNONSW']").show();
			
			if( dataSaved && referralOfferedTag.val() == "true" )
			{
				// Hide [Referral to VMMC]
				me.setHideLogicTag( referralGivenVMMCTag, false );
			}
			
		}
		else if( sexTag.val() == "F" )
		{
			keyPopulationTag.find("option[value='FSW']").show();
			
			if( dataSaved )
			{
				// Hide data element [Circumcised]
				me.setHideLogicTag( circumcisedTag, true );
				circumcisedTag.prop("checked", false);
				
				// Hide [Referral to VMMC]
				me.setHideLogicTag( referralGivenVMMCTag, true );
				referralGivenVMMCTag.prop("checked", false);
			}
		}
		else if( sexTag.val() == "T" ) // If Sex = Male, HIDE "TG SW" and "TG Non SW"
		{
			keyPopulationTag.find("option[value='TGSW']").show();
			keyPopulationTag.find("option[value='TGNONSW']").show();
		}
		else
		{
			keyPopulationTag.find("option").hide();
		}

	}
	
	// Add Logic for DE [EverTestedTag]
	me.setUp_ClientRegistrationFormLogic_everTested = function()
	{
		var everTestedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EverTested );
		var typeOfLastHIVTestTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TypeOfLastHIVTest );
		var lastHIVTestResultTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_LastHIVTestResult );
		var dateLastHIVTestTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_DateLastHIVTest );
		
		if( everTestedTag.val() == "true" )
		{
			me.addMandatoryForField( typeOfLastHIVTestTag );
			me.setHideLogicTag( typeOfLastHIVTestTag, false );
			
			me.addMandatoryForField( lastHIVTestResultTag );
			me.setHideLogicTag( lastHIVTestResultTag, false );
			
			me.addMandatoryForField( dateLastHIVTestTag );
			me.setHideLogicTag( dateLastHIVTestTag, false );
		}
		else
		{
			me.removeMandatoryForField( typeOfLastHIVTestTag );
			typeOfLastHIVTestTag.val("");
			me.setHideLogicTag( typeOfLastHIVTestTag, true );
			
			me.removeMandatoryForField( lastHIVTestResultTag );
			lastHIVTestResultTag.val("");
			me.setHideLogicTag( lastHIVTestResultTag, true );
			
			me.removeMandatoryForField( dateLastHIVTestTag );
			dateLastHIVTestTag.val("");
			me.setHideLogicTag( dateLastHIVTestTag, true );
		}
	};
	
	// Add Logic for DE [EverTestedTag]
	me.setUp_ClientRegistrationFormLogic_testType = function()
	{
		var testTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestType );
		var selfTestSectionTag = Element.addEventFormTag.find("[sectionid='" + MetaDataID.section_SelfTest + "']");
		var whereClientReceiveHIVTestTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_WhereClientReceiveHIVTest );
		var clientHIVSelfTestResultTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientHIVSelfTestResult );
		
		if( testTypeTag.val() == "CNF" )
		{
			selfTestSectionTag.show();
			
			me.addMandatoryForField( whereClientReceiveHIVTestTag );
			me.setHideLogicTag( whereClientReceiveHIVTestTag, false );
			
			me.addMandatoryForField( clientHIVSelfTestResultTag );
			me.setHideLogicTag( clientHIVSelfTestResultTag, false );
		}
		else
		{
			selfTestSectionTag.hide();
			
			me.removeMandatoryForField( whereClientReceiveHIVTestTag );
			whereClientReceiveHIVTestTag.val("");
			me.setHideLogicTag( whereClientReceiveHIVTestTag, true );
			
			me.removeMandatoryForField( clientHIVSelfTestResultTag );
			clientHIVSelfTestResultTag.val("");
			me.setHideLogicTag( clientHIVSelfTestResultTag, true );
		}
	};
	
	// Add Logic for Attribute [Age]
	me.setUp_ClientRegistrationFormLogic_Age = function()
	{
		var dobTag = me.getAttributeField( MetaDataID.attr_DoB );
		var age = "";
		if( dobTag.val() != "" ){
			var birthDateStr = Util.formatDate_DbDate( dobTag.val() );
			age = Util.calculateAge( birthDateStr );
		}
				
		// If [age > 17], HIDE attribute [PP OVC]
		var ppocvTag = me.getAttributeField( MetaDataID.attr_PPOVC );
		if( age > 17 )
		{
			me.setHideLogicTag( ppocvTag, true );
			ppocvTag.val("");
		}
		else
		{
			me.setHideLogicTag( ppocvTag, false );
		}
	};
	
	me.getAttributeField = function( attrId )
	{
		var tags = Element.addClientFormTabTag.find( "input[attribute='" + attrId + "'],select[attribute='" + attrId + "'],textarea[attribute='" + attrId + "']" );
		
		if( tags.length == 1)
		{
			return $(tags[0]);
		}
		
		return tags;
	}
	
	
	// ----------------------------------------------------------------------------
	// Add logic in [Data Entry form]
	
	me.addMandatoryForField = function( tag )
	{
		var inputRowTag = tag.closest("tr");
		
		me.removeMandatoryForField( tag );
		tag.attr( "mandatory", true );
		inputRowTag.find("td:first").append("<span class='required'> *</span>");
		inputRowTag.show();
	};
	
	me.removeMandatoryForField = function( tag )
	{
		var inputRowTag = tag.closest("tr");
		
		tag.removeAttr( "mandatory" );
		inputRowTag.find("td:first").find("span.required").remove();
		tag.closest("td").find("span.errorMsg").remove();
	};
	
	me.hideHIVTestLogicActionFields = function()
	{
		// Show/Hide the logic action field 
		if( eval( Element.hideHIVTestLogicActionTag.val() ) )
		{
			me.resultTest2Tag.hide();
			me.resultTestParallel1Tag.hide();
			me.resultTestParallel2Tag.hide();
			me.resultTestResultSDBiolineTag.hide();
		}
		else
		{
			me.resultTest2Tag.show();
			me.resultTestParallel1Tag.show();
			me.resultTestParallel2Tag.show();
			me.resultTestResultSDBiolineTag.show();
		}
	}
	
	me.setUp_DataEntryFormHeaderEvent = function( headerTag, tableTag )
	{
		// --------------------------------------------------------------
		// Set up to Show/Hide event data in "Previous" TAB
		// --------------------------------------------------------------
		
		headerTag.click(function(){

			var imgTag = $(this).find("img.showHide");
			
			// STEP 1. Display table of selected header
			
			var sectionId = $(this).closest('tbody[sectionId]').attr("sectionId");
			var tbodyTag = tableTag.find("tbody[sectionId='" + sectionId + "']");
			var closed = imgTag.hasClass("arrowRightImg");
			tbodyTag.removeClass("separateTb");
			
			// STEP 2. Show/Hide the selected event
			
			if( closed )
			{
				imgTag.attr( "src", "../images/down.gif" );
				imgTag.addClass('arrowDownImg');
				imgTag.removeClass('arrowRightImg');
				tbodyTag.find("tr:not([header])").show("fast");
				tbodyTag.removeClass( "hideHeader" );
			}
			else
			{
				imgTag.attr( "src", "../images/tab_right.png" );
				imgTag.removeClass('arrowDownImg');
				imgTag.addClass('arrowRightImg');
				tbodyTag.find("tr:not([header])").hide("fast");
				tbodyTag.addClass("separateTb");
				tbodyTag.addClass( "hideHeader" );
			}
			
			// Hide all hideLogic fields
			tbodyTag.find("tr.logicHide").hide();

			// Hide special fields
			tbodyTag.find("tr[alwaysHide]").hide();
		});

	};
	
	
	// ----------------------------------------------------------------------------
	// Generate [Add Client Form] with section
	
	me.generateAttributeGroupList = function( attrGroups, prgAttributes )
	{
		var attributeGroupList = [];
		
		for( var i in attrGroups )
		{
			attributeGroupList[i] = {};
			attributeGroupList[i].name = attrGroups[i].name;
			attributeGroupList[i].id = attrGroups[i].id;
			attributeGroupList[i].code = attrGroups[i].code;
			attributeGroupList[i].list = [];
			
			var attrGroupList = attrGroups[i].trackedEntityAttributes;
			for( var j in attrGroupList )
			{
				for( var k in prgAttributes )
				{
					var prgAttribute = prgAttributes[k];
					
					// STEP 2.1. Check if attribute in the groups exists in program-attribute
					
					if( prgAttribute.trackedEntityAttribute.id === attrGroupList[j].id )
					{
						var attribute = attrGroupList[j];
						attribute.mandatory = prgAttribute.mandatory;
						
						// STEP 2.2. Add the attribute in attribute list of result
						
						attributeGroupList[i].list.push(attribute);
					}
				}
			}
		}
		
		return attributeGroupList;
	};
	
	// ----------------------------------------------------------------------------
	// Generate [Data Entry Form] with section
	
	me.generateDataEntryFormTable = function( table, stageId )
	{
		var stageData = Util.findItemFromList( me.sectionList, "id", stageId )
		var sections = stageData.programStageSections;
		var psDataElements = stageData.programStageDataElements;
		
		for( var i = sections.length - 1; i>=0; i-- )
		{
			// STEP 2. Populate section name
			
			var tbody = $("<tbody sectionId='" + sections[i].id + "' stageId='" + stageId + "'></tbody>");
			
			// Add event for header to collapse the fields inside
			
			var headerTag = $("<tr header='true' style='cursor:pointer;'></tr>");
			headerTag.append("<th colspan='4'><img style='float:left' class='arrowDownImg showHide' src='../images/down.gif'> " + sections[i].displayName + "</th>" );
			tbody.append( headerTag );
			
			me.setUp_DataEntryFormHeaderEvent( headerTag, table );
			
			
			// STEP 3. Populate dataElements in section
			
			var deList = sections[i].dataElements;
			
			for( var l in deList)
			{
				var deId = deList[l].id;
				
				var searchedDe = me.findDataElementInProgramStageDEList( deId, psDataElements );
				var de = searchedDe.dataElement;
				de.mandatory = eval( searchedDe.compulsory );
				
				rowTag = $("<tr></tr>");
				
				// STEP 3.1. Populate the name of attribute
				
				if( !de.mandatory )
				{
					rowTag.append("<td colspan='2'>" + de.formName + "</td>");
				}
				else
				{
					rowTag.append("<td colspan='2'>" + de.formName + " <span class='required'>*</span></td>");
				}
				
				// STEP 3.2. Generate the input/select tag based on the valueType of attribute
				
				inputTag = me.inputTagGeneration.generateInputTag( de, "dataelement" );
				
				var inputColTag = $("<td colspan='2'></td>");
				inputColTag.append( inputTag );
				rowTag.append( inputColTag );
				
				// Add "DATE" picker for "Date" field
				if( de.id == MetaDataID.de_DateLastHIVTest )
				{
					Util.datePicker( rowTag.find("input[isDate='true']") ); // Not allow future DATE
				}
				else
				{
					Util.dateFuturePicker( rowTag.find("input[isDate='true']") );
				}
				
				tbody.append( rowTag );
				
			} // END DE List
			
			table.prepend( tbody );
			
		}// END Sections
		
	};
	
	me.findDataElementInProgramStageDEList = function( searchedDeId, psDataElementList )
	{
		var searched;
		for( var i = 0; i<psDataElementList.length; i++ )
		{
			var de = psDataElementList[i].dataElement;
			if( de.id === searchedDeId )
			{
				searched = psDataElementList[i];
			}
		}
		
		return searched;
	};
	
	me.resetDataEntryForm = function()
	{
		// ---------------------------------------------------------------------
		// [New Test] Tab
		
		me.notAllowToCreateEventHeaderTag.hide();
		me.activeEventHeaderTag.hide();
		me.hideIconInTab( me.TAB_NAME_THIS_TEST );
//		me.setUp_DataEntryFormInputTagEvent();
		
		// Show all tbody and input in [New Test]
		Element.addEventFormTag.closest("tbody[sectionid]").show();
		Element.addEventFormTag.find("tbody[sectionid]").find("input,select").each(function(){
			me.setHideLogicTag( $(this), false );
		});

		me.setUp_DataEntryFormInputTagEvent();
		
		// Enable the form for entering data
		me.disableDataEtryForm( false );
		
		// Add logic for [Data Entry form]
		var resultTest1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest1 );
		var resultTest2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultTest2 );
		var resultTestParallel1Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel1 );
		var resultTestParallel2Tag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultParallel2 );
		var resultTestResultSDBiolineTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Testing_ResultSDBioline );
		var resultFinalHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_FinalResult_HIVStatus );
		
		me.removeMandatoryForField( resultTest2Tag );
		me.removeMandatoryForField( resultTestParallel1Tag );
		me.removeMandatoryForField( resultTestParallel2Tag );
		me.removeMandatoryForField( resultTestResultSDBiolineTag );
		me.hideHIVTestLogicActionFields();
		
		
		// Disable some data element fields which data values are filled from client attribute values
		
		Util.disableTag( resultTest1Tag, false );
		Util.disableTag( resultTest2Tag, true );
		Util.disableTag( resultTestParallel1Tag, true );
		Util.disableTag( resultTestParallel2Tag, true );
		Util.disableTag( resultTestResultSDBiolineTag, true );
		Util.disableTag( resultFinalHIVStatusTag, true );
		
		resultTest1Tag.val("");
		resultTest2Tag.val("");
		resultTestParallel1Tag.val("");
		resultTestParallel2Tag.val("");
		resultTestResultSDBiolineTag.val("");
		resultFinalHIVStatusTag.val("");
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC ).val("");
		me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TimeSinceLastTest ).val("");
		
				
		// Reset values in the form
		
		Util.resetForm( Element.thisTestDivTag );
		
	};
	
	me.resetClientForm = function()
	{
		// ---------------------------------------------------------------------
		// [Client Information] tab
		
		me.disableClientDetailsAndCUICAttrGroup( false );
		
		// Disable [Client CUIC] field. The value of this attribute will be generated from another attribute values		
		Util.disableTag( me.getAttributeField( MetaDataID.attr_ClientCUIC ), true );
		
		Element.addClientFormTabTag.removeAttr( "client" );
//		Element.addClientFormTabTag.removeAttr( "artHIVTestingEvent" );
		Element.addClientFormTabTag.removeAttr( "latestEvent" );
		
		Element.addEventFormTag.removeAttr( "event" );
		Element.addEventFormTag.removeAttr( "partnerData" );

		// ---------------------------------------------------------------------
		// [New Test] Tab
		
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		partnerCUICTag.removeAttr("title" );
		partnerCUICTag.removeAttr("lastHIVTest" );
		partnerCUICTag.closest( "td" ).find( "span.partnerDetails" ).hide();
		partnerCUICTag.closest( "td" ).find("span.partnerInfo").html("");
		partnerCUICTag.closest( "td" ).find("span.partnerInfo").hide();
		
		Element.artReferOpenFormTag.removeAttr( "event" );
		Element.artReferCloseFormTag.removeAttr( "event" );
		
		Element.previousTestsTag.find("table").html("");
		
		// Empty fields from "This Test" tab
		Element.clientAttributeDivTag.find("input[type='text'],select").val("");
		Element.clientAttributeDivTag.find("input[type='checkbox']").prop("checked", false);
		
		
		// ---------------------------------------------------------------------
		// [Contat Log] tab

		me.showIconInTab( me.TAB_NAME_CONTACT_LOG );

		Element.contactLogEventFormTag.removeAttr( "event" );
		
		// -- [Contact Log Attribute] form
		Element.contactLogFormTag.find("input[type='text'],select").val("");
		Element.contactLogFormTag.find("textarea").val("");
		Element.contactLogFormTag.find("input[type='checkbox']").prop("checked", false);
		Element.contactLogFormTag.find( "span.errorMsg" ).remove();
		Element.contactLogFormTag.find("tbody[historyGroupId]").hide();
		Element.contactLogFormTag.find("tbody[historyGroupId]").find("td.historyInfo").html("");
		Element.contactLogFormTag.find("tbody[groupId]").show();
		Element.contactLogFormTag.find("tbody[groupId]").find("tr.action").hide();
		Element.contactLogFormTag.find("tbody:last").show();
		
		// Hide [Next Contact Log] infor
		Element.nextContactLogActionTbTag.hide();
		
		// Show the [Contact Log Event] form 
		Element.contactLogEventFormTag.find("tbody:last").show();
		// Reset [Contact Log] history table
		Element.contactLogEventHistoryTbTag.html("");
		
		// Reset [Contact Log Event] form
		Element.contactLogEventFormTag.find("input[type='text'],select").val("");
		Element.contactLogEventFormTag.find("input[type='checkbox']").prop("checked", false);
		Element.contactLogEventFormTag.find( "span.errorMsg" ).remove();
		
		// Check if there is any orgunit which is set
		me.showOrgUnitWarningMsg();	

		// Hide [Partner HIV Status]
		var partnerHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerHIVStatus );
		me.setHideLogicTag( partnerHIVStatusTag, true );
		partnerHIVStatusTag.val("");
		
		// Set init data values
		me.showOpeningTag = false;
		

		// ---------------------------------------------------------------------
		// [ART Refer] Tab
		
		// [Opening ART Refer] Tab

		me.showIconInTab( me.TAB_NAME_ART_REFER );
		
		var noneStatusStr = me.translationObj.getTranslatedValueByKey( "artRefer_tab_msg_statusNone" );
    	Element.artLinkageStatusLableTag.html( "[" + noneStatusStr + "]" );
		
		// Reset values for fields
		Element.artReferOpenFormTag.find("input,select").each(function(){
			$(this).val("");
		});
		
		// Hide [If other, specify] facility name
		var specialOtherFacilityNameTag = me.getDataElementField( Element.artReferOpenFormTag, MetaDataID.de_ARTOpen_OtherSpecialFacilityName );
		me.setHideLogicTag( specialOtherFacilityNameTag, true );
		specialOtherFacilityNameTag.val("");
		
		
		// [Closure ART Refer] Tab
		
		// Hide fields in [AR Closure] form, except [Linkage outcome] field
		Element.artReferCloseFormTag.find("input,select").each(function(){
			if( $(this).attr("dataelement") != MetaDataID.de_ARTClosureLinkageOutcome )
			{
				me.setHideLogicTag( $(this), true);
			}
			$(this).val("");
		});

		// Hide [If other, specify] facility name
		var closeSpecialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_OtherSpecialFacilityName );
		me.setHideLogicTag( closeSpecialOtherFacilityNameTag, true );
		closeSpecialOtherFacilityNameTag.val("");
		

		// ---------------------------------------------------------------------
		// [PrEP Refer.] Tab
		
		// [Opening PrEP Refer.] Tab

//		me.showDateClientReferredPrepReferOn();
		me.showIconInTab( me.TAB_NAME_PREP_REFER );
		
		var noneStatusStr = me.translationObj.getTranslatedValueByKey( "preRefer_tab_msg_statusNone" );
    	        Element.prepReferLinkageStatusLableTag.html( "[" + noneStatusStr + "]" );
    	   
		// Reset values for fields
		Element.prepReferOpenFormTag.find("input,select").each(function(){
			$(this).val("");
		});
		
		// Hide [If other, specify] facility name
		var specialOtherFacilityNameTag = me.getDataElementField( Element.prepReferOpenFormTag, MetaDataID.de_prepReferOpen_OtherSpecialFacilityName );
		me.setHideLogicTag( specialOtherFacilityNameTag, true );
		specialOtherFacilityNameTag.val("");
		
		
		// ---------------------------------------------------------------------
		// Show [ART] or [PrEP. Refer] information
		me.showDateClientReferredARTOn();
		
		
		// ---------------------------------------------------------------------
		// [Closure PrEP Refer.] Tab
		
		// Hide fields in [AR Closure] form, except [Linkage outcome] field
		Element.prepReferCloseFormTag.find("input,select").each(function(){
			if( $(this).attr("dataelement") != MetaDataID.de_ARTClosureLinkageOutcome )
			{
				me.setHideLogicTag( $(this), true);
			}
			$(this).val("");
		});

	};
	
	
	// Load [Client details] when a row in search result is clicked
	
	me.loadClientDetails = function( clientId, eventId, exeFunc ){
			Commons.checkSession( function( isInSession ) {
				if ( isInSession ) {
					var tranlatedTextMsg = me.translationObj.getTranslatedValueByKey( "searchClient_result_loadingClientDetails" );		
					ClientUtil.getDetails( clientId, tranlatedTextMsg, function( response ){
						
						me.clientDataList[clientId] = response;
						
						Element.indexingListTbTag.html("");
						Element.relationshipMsgTag.attr( "clientId", clientId );
//						me.storageObj.addItem( "clientId", clientId );
//						me.storageObj.addItem( "eventId", eventId );
						me.showUpdateClientForm( response, eventId );
						
						if( exeFunc !== undefined ) exeFunc();
						
						MsgManager.appUnblock();
					} );
				} else {
					me.mainPage.settingsManagement.showExpireSessionMessage();				
				}
			});
		
	};

	
	// ---------------------------------------------------------------------------------------------------------------
	// Client Registration
	// ---------------------------------------------------------------------------------------------------------------
	
	// Get client JSON data from FORM
	
	me.getClientJsonData = function( formTag )
	{
		var attributeData = Util.getArrayJsonData( "attribute", formTag );
		
		var clientData = Element.addClientFormTabTag.attr( "client" );
		if( clientData !== undefined ) 
		{
			clientData = JSON.parse( clientData );
			
			// Remove the old attribute values
			me.getRemoveOldAttrValueFromJson( clientData.attributes, formTag );

			// Add [ART Status] attribute value if any
			var linkageStatusFieldTag = me.getAttributeField( MetaDataID.attr_ARTStatus );
			if( linkageStatusFieldTag.val() != "" )
			{
				// Remove the old attribute value
				var artStatusAttrValue = {
						"attribute" : MetaDataID.attr_ARTStatus
						,"value" : linkageStatusFieldTag.val()
				}
				Util.findAndReplaceItemFromList(attributeData, "attribute", MetaDataID.attr_ARTStatus, artStatusAttrValue );
			}
			
			// Add [PrepRefer Status] attribute value if any
			linkageStatusFieldTag = me.getAttributeField( MetaDataID.attr_PrEPReferStatus );
			if( linkageStatusFieldTag.val() != "" )
			{
				
				// Remove the old attribute value
				var prEPReferStatusAttrValue = {
						"attribute" : MetaDataID.attr_PrEPReferStatus
						,"value" : linkageStatusFieldTag.val()
				}				
				Util.findAndReplaceItemFromList( attributeData, "attribute", MetaDataID.attr_PrEPReferStatus, prEPReferStatusAttrValue );
			}
			
			// Add new attribute values
			clientData.attributes = clientData.attributes.concat( attributeData );
		}
		else
		{
			clientData = { "attributes": attributeData };
		}
		
		return clientData;
	};
	
	me.getRemoveOldAttrValueFromJson = function( jsonData, formTag )
	{
		formTag.find("input,select,textarea").each(function(){
			var attrId = $(this).attr("attribute");
			Util.RemoveFromArray( jsonData, "attribute", attrId );
		});
	};
	
	me.getSaveClientURL = function()
	{
		// STEP 1. Get client & event JSON data from attribute of the tab
		
		var attributeData = Util.getArrayJsonData( "attribute", Element.addClientFormTag );
		var clientId = "";
		
		var clientData = Element.addClientFormTabTag.attr( "client" );
		if( clientData !== undefined ) {
			clientData = JSON.parse( clientData );
			clientData.attributes = attributeData;	
			
			clientId = clientData.trackedEntityInstance;
		}
		else
		{
			clientData = { "attributes": attributeData };
		}
		
		var url ="../client/save?ouId=" + Element.orgUnitListTag.val();
		
		if( clientId !== "" )
		{
			url += "&clientId=" + clientId;
		}
		
		return url;
	};
	
	me.saveClient = function( formTag, exeFunc, groupId, showSuccessMsg )
	{
		// Disable the button as soon as the button is clicked
		Util.disableTag( Element.saveClientRegBtnTag, true );
		
		Commons.checkSession( function( isInSession ) {
			if ( isInSession ) {
				
				var tranlatedMsg = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_checkingData" );
				MsgManager.appBlock( tranlatedMsg );
				
				if( me.validationObj.checkFormEntryTagsData( formTag ) )
				{	
					$.ajax(
						{
							type: "POST"
							,url: me.getSaveClientURL()
							,dataType: "json"
							,data: JSON.stringify( me.getClientJsonData( formTag ) )
				            ,contentType: "application/json;charset=utf-8"
			            	,beforeSend: function( xhr ) {
			            		if( showSuccessMsg )
		            			{
			            			var tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_savingClient" );
									MsgManager.appBlock( tranlatedText + " ..." );
		            			}
				        		
				            }
							,success: function( response ) 
							{
								me.saveClientAfter( response, exeFunc, groupId, showSuccessMsg );							
							}
							,error: function( response )
							{
								if( response.responseJSON == undefined && response.status == 0 )
								{
									if( showSuccessMsg == undefined || showSuccessMsg )
									{
										tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_clientSaved" );
										MsgManager.msgAreaShow( tranlatedText, "SUCCESS" );						
										MsgManager.appUnblock();
										alert( tranlatedText );
									}
								}
								else if( response.responseJSON.trackedEntityInstance != undefined )
								{
									me.saveClientAfter( response, exeFunc, groupId, showSuccessMsg );
								}
								else if( response.responseJSON.response != undefined )
								{	
									var conflicts = response.responseJSON.response.conflicts;
									var errorMsg = "";
									for( var i in conflicts )
									{
										errorMsg += " - " + conflicts[i].value + "\n";
									}
									
									for( var t in conflicts )
									{
										var objectId = conflicts[t].object;
										var msg = conflicts[t].value;
										
										for( var t in conflicts )
										{
											var objectId = conflicts[t].object;
											var msg = conflicts[t].value;
											
											for( var i in me.attributeGroupList )
											{
												var list = me.attributeGroupList[i].list;
												for( var j in list )
												{
													var attribute = list[j];
													var attrId = attribute.id;
													var attrText = attribute.shortName;
													
													if( errorMsg.indexOf( attrId ) >= 0 )
													{
														errorMsg = errorMsg.split( attrId ).join( attrText );
														msg = msg.split( attrId ).join( attrText );
														if( attribute.optionSet != undefined )
														{
															var optionSet = attribute.optionSet;
															errorMsg = errorMsg.split( optionSet.id ).join( optionSet.name );
															msg = msg.split( optionSet.id ).join( optionSet.name );
														}
														
														me.addErrorSpanToField( Element.addClientFormTag.find("[attribute='" + attrId + "']"), msg );
													}
													
												}
											}
										}
									}
									
									// Alert error message
									var tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_validation_checkErrorFields" );
									alert( tranlatedText );
								}
								else
								{
									var errorMsg = response.responseJSON.message;
									alert( errorMsg );
								}
								// Enable the button
								Util.disableTag( Element.saveClientRegBtnTag, false );
								
								// Unblock the form
								MsgManager.appUnblock();
								
								
							}
						}).always( function( data ) {
							// Enable the button
							Util.disableTag( Element.saveClientRegBtnTag, false );
						});
				}
				else
				{
					// Enable the button
					Util.disableTag( Element.saveClientRegBtnTag, false );
					
					MsgManager.appUnblock();
					var tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_validation_checkErrorFields" );
					alert( tranlatedText );
				}
			} else {
				me.mainPage.settingsManagement.showExpireSessionMessage();					
			}
		});
		
	};
	
	me.savePartnerCUIC = function( exeFunc )
	{
		Commons.checkSession( function( isInSession ) 
		{
			if( isInSession )
			{
				var partnerCUIC = me.getAttributeField( MetaDataID.attr_ClientCUIC ).val();
				var clientCUIC = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC ).val();
				var partnerEventId = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId ).val();
				var clientEventId = JSON.parse( Element.addEventFormTag.attr( "event" ) ).event;
				var coupleStatus = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_CoupleStatus ).val();
				
				$.ajax(
					{
						type: "POST"
						,url: "../event/savePartnerCUIC?partnerEventId=" + partnerEventId + "&partnerCUIC=" + partnerCUIC + "&eventId=" + clientEventId + "&coupleStatus=" + coupleStatus + "&clientCUIC=" + clientCUIC
						,dataType: "json"
			            ,contentType: "application/json;charset=utf-8"
			            ,beforeSend: function()
			            {
			            	var translatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_updatingPartnerCUIC" );
			            	MsgManager.appBlock( translatedText );
			            }
						,success: function( response ) 
						{
							if( exeFunc !== undefined ) exeFunc();
							tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_updatedPartnerCUIC" );
							MsgManager.msgAreaShow( tranlatedText, "SUCCESS" );	
						}
						,error: function(response)
						{
							console.log(response);
						}
					}).always( function( data ) {
						MsgManager.appUnblock();
					});
			} 
			else {
				me.mainPage.settingsManagement.showExpireSessionMessage();					
			}
		});	
	}
	
	me.saveClientAndEvent = function( formTag, stageId, exeFunc )
	{
		// Save [ART Referral status] attributes
		me.saveClient( formTag, function(){
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
			
			var jsonEvent = formTag.attr("event");
			var eventId;
			if( jsonEvent !== undefined )
			{
				jsonEvent = JSON.parse( jsonEvent );
				eventId = jsonEvent.event;
			}
			else
			{
				jsonEvent = { 
					"programStage": stageId
					,"status": "COMPLETED"
				};
			}
						
			jsonEvent.dataValues = Util.getArrayJsonData( "dataElement", formTag );
			
			me.execSaveEvent( formTag, jsonEvent, jsonClient.trackedEntityInstance, eventId, function( response ){
				
				// Set [event] attribute for [ART Refer Opening] Tab
				formTag.attr( "event", JSON.stringify( response ) );
				
				if( exeFunc != undefined ) exeFunc( response );
				
			});
		}, undefined, false );
	};
	
	me.setAndSaveARTLinkageStatusAttrValue = function( formTag, exeFunc )
	{
		me.setARTLinkageStatusAttrValue();
		
		me.saveClient( formTag, function(){
			var linkageStatusFieldTag = me.getAttributeField( MetaDataID.attr_ARTStatus );
			Element.artLinkageStatusLableTag.html( linkageStatusFieldTag.find("option:selected").text() );
			
			if( exeFunc != undefined ) exeFunc();
		}, undefined, true );
	};
	
	me.setARTLinkageStatusAttrValue = function()
	{
		var artOpeningEvent = Element.artReferOpenFormTag.attr("event");
		var artClosureEvent = Element.artReferCloseFormTag.attr("event");

		var linkageStatusFieldTag = me.getAttributeField( MetaDataID.attr_ARTStatus );
		
		if( artOpeningEvent != undefined && artClosureEvent == undefined )
		{
			if( artClosureEvent == undefined )
			{
				linkageStatusFieldTag.val( "PENDING" );
			}
		}
		else if( artClosureEvent != undefined )
		{
			var closureLinkageOutcomeTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome );
			linkageStatusFieldTag.val( closureLinkageOutcomeTag.val() );
		}
		
		var value = linkageStatusFieldTag.find("option:selected").val();
		
		var noneStatusStr = me.translationObj.getTranslatedValueByKey( "artRefer_tab_msg_statusNone" );
		value = ( value != "" ) ? linkageStatusFieldTag.find("option:selected").text() : "[" + noneStatusStr + "]";
		Element.artLinkageStatusLableTag.html( value );
	};
	

	me.setAndSavePrepReferLinkageStatusAttrValue = function( formTag, exeFunc )
	{
		me.setPrepReferLinkageStatusAttrValue();
		
		me.saveClient( formTag, function(){
			var linkageStatusFieldTag = me.getAttributeField( MetaDataID.attr_PrEPReferStatus );
			Element.prepReferLinkageStatusLableTag.html( linkageStatusFieldTag.find("option:selected").text() );
			if( exeFunc != undefined ) exeFunc();
		}, undefined, true );
	};
	
	me.setPrepReferLinkageStatusAttrValue = function()
	{
		var openingEvent = Element.prepReferOpenFormTag.attr("event");
		var closureEvent = Element.prepReferCloseFormTag.attr("event");
		

		var linkageStatusFieldTag = me.getAttributeField(  MetaDataID.attr_PrEPReferStatus  );
		var closureLinkageOutcomeTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferClosureLinkageOutcome );
		
		if( openingEvent != undefined && closureEvent == undefined )
		{
			linkageStatusFieldTag.val( "PENDING" );
		}
		else if( closureEvent != undefined )
		{
			linkageStatusFieldTag.val( closureLinkageOutcomeTag.val() );
		}
		
		var value = linkageStatusFieldTag.find("option:selected").val();
		
		var noneStatusStr = me.translationObj.getTranslatedValueByKey( "prepRefer_tab_msg_statusNone" );
		value = ( value != "" ) ? linkageStatusFieldTag.find("option:selected").text() : "[" + noneStatusStr + "]";
		Element.prepReferLinkageStatusLableTag.html( value );
	};
	
	
	me.saveClientAfter = function( response, exeFunc, groupId, showSuccessMsg )
	{
		// STEP 1. Set the client as attribute for the form. 

		var clientId = response.trackedEntityInstance;
		if( Element.addClientFormTabTag.attr( "client" ) == undefined )// For new client
		{
			me.clientDataList[clientId] = {};
			me.clientDataList[clientId].client = response;
			me.clientDataList[clientId].enrollments = [{
				"enrollmentDate" : Util.getCurrentDate(),
				"status" : "ACTIVE"
			}];
			
			Element.headerListTag.attr("clientId", clientId);
		}
		else
		{
			me.clientDataList[clientId].client = response;
		}
		
		
		
		Element.addClientFormTabTag.attr( "client", JSON.stringify( response ) );
		
		// STEP 2. Set the header of the [Client Form] Tab
		
		if( Element.headerListTag.attr("clientId") == undefined 
			|| response.trackedEntityInstance == Element.headerListTag.attr("clientId") )
		{
			me.generateAddClientFormHeader();
		}
		
		// STEP 3. Display [This Test] Tab if the "status" mode is "Add Client"
		
		var firstName = Util.getAttributeValue( response.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
		var surName = Util.getAttributeValue( response.attributes, "attribute", MetaDataID.attr_LastName ).toUpperCase();
		if( Element.saveClientRegBtnTag.attr("status") == "add"  )
		{
			if( firstName != "EQC" && ( surName != "POS" || surName != "NEG" ) )
			{
				me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
				me.showTabInClientForm( me.TAB_NAME_INDEXING );
			}
			else
			{
				// Set client Type as [EQC / PPT]
				me.checkAndSetClientTypeValue( response );
			}
			
			me.showTabInClientForm( me.TAB_NAME_THIS_TEST );
		}
		
		// STEP 4. Set the status "Update" for [Client Form]
		
		Element.saveClientRegBtnTag.attr("status", "update");
		
		
		// STEP 5. Set data values based on client attribute values
		me.setUp_InitDataValues();
		
		
		if( exeFunc !== undefined ) exeFunc(groupId);
		
		// STEP 6. Unblock form
		
		if( showSuccessMsg == undefined || showSuccessMsg )
		{
			tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_clientSaved" );
			MsgManager.msgAreaShow( tranlatedText, "SUCCESS" );						
			MsgManager.appUnblock();
			alert( tranlatedText );
		}
	};
	
	me.checkAndSetClientTypeValue = function( jsonClient )
	{
		var clientTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType );
		var EQCPPTPassedTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_EQCPPTPassed );
		
		
		var firstName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
		var surName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_LastName ).toUpperCase();
		
		if( firstName == "EQC" && ( surName == "POS" || surName == "NEG" ) )
		{
			clientTypeTag.find("option").show()
			clientTypeTag.val("LS_SER3");
			Util.disableTag( clientTypeTag, true );
			Util.disableTag( EQCPPTPassedTag, true );
			
			me.hideTabInClientForm( me.TAB_NAME_CONTACT_LOG );
			me.hideTabInClientForm( me.TAB_NAME_ART_REFER );
			me.hideTabInClientForm( me.TAB_NAME_PREP_REFER );
		}
		else
		{
			clientTypeTag.find("option[value='LS_SER3']").hide();
			
			Util.disableTag( EQCPPTPassedTag, false );
			
			var dob = Util.getAttributeValue( jsonClient.attributes, "attributes", MetaDataID.attr_DoB );
			if( dob != "" ){
				var age = Util.calculateAge( dob );
				if( age < 8 )
				{
					// ASSIGN [Individual Test] value for data element [Client type]
					clientTypeTag.val( "LS_SER1" );
					Util.disableTag( clientTypeTag, true );
				}
				else
				{
					Util.disableTag( clientTypeTag, false );
				}
			}
			else
			{
				Util.disableTag( clientTypeTag, false );
			}
		}
	};
	
	me.getAttributeValue = function( jsonClient, attrId )
	{
		var attributes = jsonClient.attributes;
		var found = Util.findItemFromList( attributes, "attribute", attrId );
		return ( found !== undefined ) ? found.value : "";
	};
	
	
	me.setUp_InitDataValues = function()
	{
		
		// Set [EQC] type
		var jsonClient = Element.addClientFormTabTag.attr( "client" );
		if( jsonClient!= undefined )
		{
			jsonClient = JSON.parse( jsonClient );
			me.checkAndSetClientTypeValue( jsonClient );
		}
		
		var dobTag = me.getAttributeField( MetaDataID.attr_DoB );
		var age = "";
		if( dobTag.val() != "" ){
			var birthDateStr = Util.formatDate_DbDate( dobTag.val() );
			age = Util.calculateAge( birthDateStr );
		}

		// --------------------------------------------------------------------------
		
		me.setUp_DataEntryFormInputTagEvent();
		me.setUp_ClientRegistrationFormDataLogic();
		
		
		// --------------------------------------------------------------------------
		// Add logic for data elements
		
		// Set age value for data element [Age]
		var deAgeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_Age );
		deAgeTag.val( age );
		
		// If Age < 8
		var clientTypeTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_ClientType );
		var partnerKnowsHIVStatusTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerKnowsHIVStatus );
		var numberSexualPartnersLast6MonthTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_NumberSexualPartnersLast6Month );
		if( dobTag.val() != "" && age < 8 )
		{
			// Hide [Client partner's CUIC - Option] && [Client partner's CUIC] fields
			me.setHideLogicTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt ), true );
			me.setHideLogicTag( me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC ), true );
			
			// Hide [Partner knows HIV status]
			me.setHideLogicTag( partnerKnowsHIVStatusTag, true );
			me.removeMandatoryForField( partnerKnowsHIVStatusTag );
			partnerKnowsHIVStatusTag.val("");
			
			// Hide [Number of sexual partners last 6 months]
			me.setHideLogicTag( numberSexualPartnersLast6MonthTag, true );
			numberSexualPartnersLast6MonthTag.val("");
		}
		else
		{
			// Enable data element [Client type]
			if( clientTypeTag.val() == "" )
			{
				Util.disableTag( clientTypeTag, false );
			}
			
			// Show [Partner knows HIV status]
			me.setHideLogicTag( partnerKnowsHIVStatusTag, false );
			me.addMandatoryForField( partnerKnowsHIVStatusTag );
			
			// Show [Number of sexual partners last 6 months]
			me.setHideLogicTag( numberSexualPartnersLast6MonthTag, false );
		}
		
		
	};
	
	me.addErrorSpanToField = function( inputTag, errorMsg )
	{
		inputTag.closest("td").append( "<span class='errorMsg'>" + errorMsg + "</span>" );
	};
	
	me.generateAddClientFormHeader = function()
	{
		var headerText = "";
		
		var firstName = me.clientFirstNameTag.val();
		var lastName = me.clientLastNameTag.val();
		var districtOfBirth = me.clientDistrictOBTag.val();
		var dob = me.clientDoBTag.val();
		
		if( firstName != "" || lastName != "" ) {
			headerText += $.trim( firstName + " " + lastName ) + ", ";
		}
		
		if( districtOfBirth != "" && districtOfBirth !== null ) {
			districtOfBirth = me.clientDistrictOBTag.find("option:selected").text();
			headerText += districtOfBirth + ", ";
		}
		
		if( dob != "" )
		{
			headerText += dob + ", ";
		}
		
		headerText = headerText.substring( 0, headerText.length - 2 );
		
		Element.headerListTag.html( headerText );
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------
	// Actions for event ( Create/Update, Complete events )
	// ---------------------------------------------------------------------------------------------------------------
	
	me.showDialogForSaveEvent = function()
	{
		var titleTranslated = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_saveEventDialogTitle" );
		var cancelTranslated = me.translationObj.getTranslatedValueByKey( "clientEntryForm_btn_cancel" );
		
		Element.saveEventDialogFormTag.dialog({
			title: titleTranslated
			,maximize: true
			,closable: true
			,modal: true
			,resizable: false
			,width: 555
			,height: 170
		}).show('fast' );
	};
	
	me.getSaveEventURL = function( clientId, eventId )
	{
		var url = "../event/save?ouId=" + Element.orgUnitListTag.val();
		
		if( clientId !== undefined )
		{
			url += "&clientId=" + clientId;
		}
		
		if( eventId !== undefined )
		{
			url += "&eventId=" + eventId;
		}
		
		return url;
	};

	me.getGPSCoordinates = function( exeFunc ) 
	{
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function( position ) 
				{
					var lat = position.coords.latitude;
			        var lng = position.coords.longitude;

			        exeFunc( lat, lng );		
				}
				, function( msg ) 
				{
					 exeFunc( "", "" );
				});
			
		} else {
			 exeFunc( "", "" );
		}
		
//		if (navigator.geolocation) {
//		    var location_timeout = setTimeout( 10000 );
//
//		    navigator.geolocation.getCurrentPosition(function(position) {
//		        clearTimeout(location_timeout);
//
//		        var lat = position.coords.latitude;
//		        var lng = position.coords.longitude;
//
//		        exeFunc( lat, lng );
//		    }, function(error) {
//		        clearTimeout(location_timeout);
//		        exeFunc( "", "" );
//		    },{timeout:5000});
//		} else {
//			 exeFunc( "", "" );
//		}
		
	};
	
	me.execSaveEvent = function( formTag, jsonData, clientId, eventId, exeFunc )
	{
		Commons.checkSession( function( isInSession ) {
			if ( isInSession ) {
				var tranlatedMsg = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_checkingData" );
				MsgManager.appBlock( tranlatedMsg );
				
				if( me.validationObj.checkFormEntryTagsData( formTag ) )
				{
					if( eventId == undefined )
					{
						var tranlatedMsg = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_gettingCurrentGPSCoordinates" );
						MsgManager.appBlock( tranlatedMsg );
									
						me.getGPSCoordinates( function( lat, lng ){
							if( lat !== "" && lng != "" )
							{
								jsonData.coordinate = {
									"latitude" :  lat
									,"longitude" : lng
								}
							}
							
							me.saveEvent( jsonData, clientId, eventId, exeFunc );
						} ) 
					}
					else
					{
						me.saveEvent( jsonData, clientId, eventId, exeFunc );	
					}
				}
				else
				{
					Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
					MsgManager.appUnblock();
					var tranlatedText = me.translationObj.getTranslatedValueByKey( "datatEntryForm_validation_checkErrorFields" );
					alert( tranlatedText );
				}
			}
			else {
				me.mainPage.settingsManagement.showExpireSessionMessage();					
			}
		});
		
	};
	
	me.saveEvent = function( jsonData, clientId, eventId, exeFunc )
	{
		var url = me.getSaveEventURL( clientId, eventId );
		
		$.ajax(
			{
				type: "POST"
				,url: url
				,dataType: "json"
				,data: JSON.stringify( jsonData )
	            ,contentType: "application/json;charset=utf-8"
	            ,beforeSend: function()
	            {
	            	var tranlatedText = "";
	            	if( jsonData.status == "COMPLETED" )
            		{
	            		tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_completingEvent" );
            		}
	            	else if( eventId != undefined ) // Update event
            		{
	            		tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_editingEvent" );
            		}
	            	else if( eventId == undefined ) // Add event
            		{
	            		tranlatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_creatingEvent" );
            		}

					MsgManager.appBlock( tranlatedText + " ..." );
	            }
				,success: function( response ) 
				{
					me.activeEventHeaderTag.show();
					
					me.disableClientDetailsAndCUICAttrGroup( true );

					// Update event for client
					var clientId = JSON.parse( Element.addClientFormTabTag.attr("client") ).trackedEntityInstance;
					var clientData = me.clientDataList[clientId];
					
					
					
					if( eventId == undefined )
					{
						var latestErollment = ClientUtil.getLatestEnrollment( clientData.enrollments );
						if( latestErollment.events == undefined )
						{
							latestErollment.events = [];
						}
						latestErollment.events.push( response );
					}
					else
					{
//						var event = ClientUtil.getLatestEventByEnrollments( clientData.enrollments, jsonData.programStage );
//						event = response;
						
						ClientUtil.replaceLatestEventByEnrollments( clientData.enrollments, jsonData.programStage, response );
					}
					
//					if( me.checkIfARTEvent( jsonData ) )
//					{
//						Element.addClientFormTabTag.attr("artHIVTestingEvent", JSON.stringify( jsonData ));
//					}
					
					// STEP 4. Unblock form
					var translateMsg = "";
					if( response.status == "COMPLETED" )
            		{
						translateMsg = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_eventCompleted" );
            		}
					else
					{
						translateMsg = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_eventSaved" );		
					}

					Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
					
					
					// Hide [red] icon on [New Test] if any
					me.hideIconInTab( me.TAB_NAME_THIS_TEST );
					
					// Set [event] attribute for [This test] Tab
					Element.addEventFormTag.attr( "event", JSON.stringify( response ) );
					if( me.checkIfARTEvent( response ) || me.checkIfPrepReferEvent( response ) )
					{
						Element.addClientFormTabTag.attr( "latestEvent", JSON.stringify( response ) );
					}
					var latestHIVEvent = Element.addClientFormTabTag.attr( "latestEvent" );
					if( latestHIVEvent !== undefined )
					{
						latestHIVEvent = JSON.parse( latestHIVEvent );
					}
					
					me.checkAndShowARTReferTab( latestHIVEvent );
					
//					else if( me.checkIfPrepReferEvent( jsonEvent ))
//					{
//						Element.addClientFormTabTag.attr( "prepReferHIVTestingEvent", JSON.stringify( jsonEvent ) );
//					}
					
					// Show/Hide [ART Refer.] Tab and [PrEP Refer.] Tab

//					var artHIVTestingEvent = Element.addClientFormTabTag.attr( "artHIVTestingEvent" );
//					if( artHIVTestingEvent != undefined )
//					{
//						artHIVTestingEvent = JSON.parse( artHIVTestingEvent );
//					}
//					
//					var prepReferHIVTestingEvent = Element.addClientFormTabTag.attr( "prepReferHIVTestingEvent" );
//					if( prepReferHIVTestingEvent != undefined )
//					{
//						prepReferHIVTestingEvent = JSON.parse( prepReferHIVTestingEvent );
//					}

					
					
					if( exeFunc !== undefined ) exeFunc( response );
					
					MsgManager.msgAreaShow( translateMsg, "SUCCESS" );
					MsgManager.appUnblock();
					alert( translateMsg );
				}
				,error: function( response )
				{
					if(  response.responseJSON.response !== undefined )
					{	
						var conflicts = response.responseJSON.response.conflicts;
						
						for( var i in conflicts )
						{
							var objectId = conflicts[i].object;
							var msg = conflicts[i].value;
							me.addErrorSpanToField( Element.addEventFormTag.find("[dataelement='" + objectId + "']"), msg );
						}
						
						var errorMsgText = me.translationObj.getTranslatedValueByKey( "datatEntryForm_validation_checkErrorFields" );
						MsgManager.msgAreaShow( errorMsgText, "ERROR" );
						alert( errorMsgText );
					}
					else
					{
						var errorMsg = response.responseJSON.message;
						MsgManager.msgAreaShow( errorMsg, "ERROR" );
						alert( errorMsg );
					}
					
					MsgManager.appUnblock();

					Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
					
				}
			});
		
	};
	
	me.completeEvent = function( exeFunc )
	{
		var event = Element.addEventFormTag.attr( "event" );
		var client = JSON.parse( Element.addClientFormTabTag.attr("client") );
		var eventId;
		var trackedEntityInstanceId;
		if( event != undefined )
		{
			event = JSON.parse( Element.addEventFormTag.attr( "event" ) );
			eventId = event.event;
		}
		else
		{
			event = { "programStage": MetaDataID.stage_HIVTesting };
			trackedEntityInstanceId = client.trackedEntityInstance;
		}
		
		
		// Update status of event
		
		event.status = "COMPLETED";	
		event.dataValues = Util.getArrayJsonData( "dataElement", Element.thisTestDivTag );
		
		me.execSaveEvent( Element.thisTestDivTag, event, trackedEntityInstanceId, eventId, function( jsonEvent ){

//			me.updatePartnerInfo( jsonEvent );
			
			// Add completed event in [Previous Test] tab
			
			var tbody = me.createAndPopulateDataInEntryForm( jsonEvent, MetaDataID.stage_HIVTesting );
			Element.previousTestsTag.find("table").prepend( tbody );
			
			// Reset data entry form
			me.resetDataEntryForm();

			// Populate data values for [Testing Material] of new event from completed event data
			me.populateTestingMaterialSectionData();
			
			// Show 'Save' event button AND show "This test" form
			var firstName = Util.getAttributeValue( client.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
			
			me.showTabInClientForm( me.TAB_NAME_THIS_TEST );
			if( firstName != "EQC"  )
			{
				me.showTabInClientForm( me.TAB_NAME_PREVIOUS_TEST );
				me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
				me.showTabInClientForm( me.TAB_NAME_INDEXING );
			}
			

			Element.addClientFormTabTag.attr( "latestEvent", JSON.stringify( jsonEvent ) ); 
			
			me.saveClientAfter( JSON.parse( Element.addClientFormTabTag.attr("client") ), exeFunc, undefined, false );

			// Not allow to create a new event if there is one event today
			
			
			var jsonClient = JSON.parse( Element.addClientFormTabTag.attr( "client" ) );
			var firstName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
			var surName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_LastName ).toUpperCase();
			
			if( me.isTodayEvent( jsonEvent ) && !(( firstName == "EQC" && ( surName == "POS" || surName == "NEG" ) )))
			{
				Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, true );
				me.notAllowToCreateEventHeaderTag.show();
			}
			else
			{
				Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
				me.notAllowToCreateEventHeaderTag.hide();
			}
			
		} );
	
	};
	
	me.updatePartnerInfo = function( jsonEvent, exeFunc )
	{
		// Update the partner information
		var partnerCUICOptTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUICOpt );
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		var partnerEventId = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId ).val();
		if( partnerCUICOptTag.val() == "2" && partnerCUICTag.val() != "" && partnerEventId != undefined )
		{
			me.savePartnerCUIC( function(){
				me.updatePartnerInfoAfter( jsonEvent );
				if( exeFunc !== undefined ){
					exeFunc();
				}
			} );
		}
		else
		{
			me.updatePartnerInfoAfter( jsonEvent );
			if( exeFunc !== undefined ){
				exeFunc();
			}
		}
		
	};
	
	me.updatePartnerInfoAfter = function( jsonEvent )
	{
		Element.addEventFormTag.attr("event", JSON.stringify( jsonEvent ));
		me.disableClientDetailsAndCUICAttrGroup( true );
		
		// Show the icon [red] icon on [New Test] if any
		me.showIconInTab( me.TAB_NAME_THIS_TEST );
		
		if( me.checkIfARTEvent( jsonEvent ) )
		{
//			Element.addClientFormTabTag.attr("artHIVTestingEvent", JSON.stringify( jsonEvent ));
			me.showOpeningTag = false;
		}

		var latestEvent = Element.addClientFormTabTag.attr("latestEvent" );
//		var prepReferHIVTestingEvent = Element.addClientFormTabTag.attr("prepReferHIVTestingEvent" );
//		if( artHIVTestingEvent != undefined || prepReferHIVTestingEvent != undefined )
//		{
//			artHIVTestingEvent = JSON.parse( artHIVTestingEvent );
//		}
//		
//		if( prepReferHIVTestingEvent != undefined )
//		{
//			prepReferHIVTestingEvent = JSON.parse( prepReferHIVTestingEvent )
//		}
		
		if( latestEvent !== undefined )
		{
			me.checkAndShowARTReferTab( JSON.parse( latestEvent ) );
		}
	};
	
	// -------------------------------------------------------------------------------------------------
	// Show/Hide modules
	// -------------------------------------------------------------------------------------------------
	
	me.showOrgUnitWarningMsg = function()
	{
		if( Element.orgUnitListTag.val() === "" || Element.orgUnitListTag.val() === null )
		{
			Element.selectOrgUnitWarningMsgTag.show();
			Util.disableTag( Element.saveClientRegBtnTag, true );
			Util.disableTag( Element.updateClientBtnTag, true );
			Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, true );
		}
		else
		{
			Element.selectOrgUnitWarningMsgTag.hide();
			Util.disableTag( Element.saveClientRegBtnTag, false );
			Util.disableTag( Element.updateClientBtnTag, false );
			Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
		}
	};
	
	
	
	// -------------------------------------------------------------------------------------------------
	// Client details form TAB
	// -------------------------------------------------------------------------------------------------
	
	
	// -------------------------------------------------------------------------------------------------
	// Add new [Client details] form TAB
	
	me.showAddClientForm = function()
	{
		me.storageObj.addItem("subPage", me.mainPage.settingsManagement.PAGE_SEARCH_ADD_CLIENT );
		
		Util.resetPageDisplay();
		Element.saveClientRegBtnTag.attr("status", "add" );
		me.resetClientForm();
		me.resetDataEntryForm();
		Util.resetForm( Element.contactLogEventFormTag );
		Util.resetForm( Element.artReferOpenFormTag );
		Util.resetForm( Element.artReferCloseFormTag );
		Util.resetForm( Element.prepReferOpenFormTag );
		Util.resetForm( Element.prepReferCloseFormTag );
		

		Element.relationshipMsgTag.hide();
		Element.relationshipMsgTag.find("[clientId]").remove();
		
		// Change the Header title && 'Save' buton display name
		var tranlatedText = me.translationObj.getTranslatedValueByKey( "dataEntryForm_headerTitle_addClient" );
		Element.headerListTag.html(tranlatedText);
		
		// Populate values from Search form to Add client form
		Element.seachAddClientFormTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			var attrId = $(this).attr("attribute");
			var value = $(this).val();
			var field = Element.addClientFormTag.find("input[attribute='" + attrId + "'],select[attribute='" + attrId + "'],textarea[attribute='" + attrId + "']");
			
			if( field.attr("type") == "radio" || field.attr("type") == "checkbox" )
			{
				field.closest("td").find("[value='" + value + "']").prop("checked", true);
			}
			else
			{
				field.val( value );
			}
		});

		
		// Remove [Drop case] in [ART Closure] form if the loggin user is counsellor
		Util.disableForm( Element.artReferCloseFormTag, false );
		if( me.appPage == Commons.APPPAGE_COUNSELLOR )
		{
			me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome ).find("option[value='DROPPED']").hide();
		}
		
		// Generate Client CUIC if any
		me.generateClientCUIC();
		
		// Select the "Client Attributes" tab
		Element.addClientFormTabTag.tabs("option", "selected", 0);
		
		// Hide "Previous Test" and "This Test" Tabs
		me.hideTabInClientForm( me.TAB_NAME_PREVIOUS_TEST );
		me.hideTabInClientForm( me.TAB_NAME_THIS_TEST );
		me.hideTabInClientForm( me.TAB_NAME_CONTACT_LOG );
		me.hideTabInClientForm( me.TAB_NAME_ART_REFER );
		me.hideTabInClientForm( me.TAB_NAME_PREP_REFER );
		me.hideTabInClientForm( me.TAB_NAME_INDEXING );
		
		// Show "Add Client" form
		Element.addClientFormDivTag.show("fast");

		// Init attribute fields
		me.setUp_ClientRegistrationFormDataLogic();
		

		// Init dataElement fields
		me.setUp_DataEntryFormInputTagEvent();
		
	};
	
	
	// -------------------------------------------------------------------------------------------------
	// Update new [Client details] form TAB
	
	me.showUpdateClientForm = function( data, selectedEventId )
	{
		me.storageObj.addItem( "subPage", me.mainPage.settingsManagement.PAGE_SEARCH_EDIT_CLIENT );

		// STEP 1. Update the status of client ( "add"/ "update" )
		Element.saveClientRegBtnTag.attr("status", "update" );

		// STEP 2. Reset te TAB
		me.resetClientForm();
		me.resetDataEntryForm();
		Util.resetForm( Element.contactLogEventFormTag );
		Util.resetForm( Element.artReferOpenFormTag );
		Util.resetForm( Element.artReferCloseFormTag );
		Util.resetForm( Element.prepReferOpenFormTag );
		Util.resetForm( Element.prepReferCloseFormTag );
		
		Element.searchResultTbTag.hide();
		Element.searchResultTag.hide();
		Element.searchClientFormTag.hide();
		
		
		// ------------------------------------------------------------------------------------------------
		// STEP 3. Get events
		
		var latestEnrollment = ClientUtil.getLatestEnrollment( data.enrollments );
		var events = ( latestEnrollment && latestEnrollment.events ) ? latestEnrollment.events : [];
		events = Util.sortDescByKey( events, "eventDate" );
		
		var todayEvent = false;
		var latestEvent;
		var activeHIVTestingEvent;
		var artHIVTestingEvent;
		var prepReferHIVTestingEvent;
		var completedHIVTestingEvents = [];
		
		var contactLogEvents = [];
		var artOpeningEvent;
		var artClosureEvent;
		var prepReferOpeningEvent;
		var prepReferClosureEvent;
		
		for( var i=0; i<events.length; i++ )
		{
			var event = events[i];
			
			// Get [HIV Testing] events
			if( event.programStage == MetaDataID.stage_HIVTesting )
			{	
				var dataValues = event.dataValues;
				var eventId = event.event;
				
				// Get active event if any
				if( event.status == "ACTIVE" ) // && activeHIVTestingEvent === undefined )
				{
					activeHIVTestingEvent = event;
					artHIVTestingEvent = event;
				}
				// Get completed event list
				else
				{
					completedHIVTestingEvents.push( event );
					if( artHIVTestingEvent == undefined )
					{
						artHIVTestingEvent = event;
					}
				}
				
				// Check event is today event
				if( me.isTodayEvent( event ) && !todayEvent )
				{
					todayEvent = true;
				}
				
			}
			// Get [Contact Log] event
			else if( event.programStage == MetaDataID.stage_ContactLog )
			{
				// Add event in begining of array, I need to convert [Contact Log] event array 
				// so that the latest event will be displayed in the top of history
				contactLogEvents.unshift( event );
			}
			// Get [ART Refer. Opening] event
			else if( event.programStage == MetaDataID.stage_ARTReferralOpenning )
			{
				artOpeningEvent = event;
			}
			// Get [ART Refer. Closure] event
			else if( event.programStage == MetaDataID.stage_ARTReferralClosure )
			{
				artClosureEvent = event;
			}
			// Get [ART Refer. Opening] event
			else if( event.programStage == MetaDataID.stage_prepReferralOpenning )
			{
				prepReferOpeningEvent = event;
			}
			// Get [ART Refer. Closure] event
			else if( event.programStage == MetaDataID.stage_prepReferralClosure )
			{
				prepReferClosureEvent = event;
			}
		}

		// Get Latest HIV Test event
		if( activeHIVTestingEvent != undefined ) // && activeHIVTestingEvent === undefined )
		{
			latestEvent = activeHIVTestingEvent;
		}
		// Get completed event list
		else if( completedHIVTestingEvents.length > 0 )
		{
			latestEvent = completedHIVTestingEvents[ completedHIVTestingEvents.length - 1 ];
		}
		
		Element.addClientFormTabTag.attr( "latestEvent", JSON.stringify( latestEvent ) ); 
		

		// ------------------------------------------------------------------------------------------------
		// [Client Attribute] TAB
		
		// STEP 4. Populate Client Registration data	
//		delete data.client["enrollments"];	
		Element.addClientFormTabTag.attr( "client", JSON.stringify( data.client ) );
		
		// Populate attribute values in form
		me.populateClientAttrValues( Element.addClientFormTabTag, data.client );

		me.filterCouncilsByDistrict();

		
		// STEP 5. Create header for [Update client] form
		if( Element.headerListTag.attr("clientId") == undefined 
			|| Element.headerListTag.attr("clientId") == data.client.trackedEntityInstance )
		{
			me.generateAddClientFormHeader();
		}
		
		// STEP 6. Lock for if there is any HIV Testing event existed
		if( events.length > 0 )
		{
			me.disableClientDetailsAndCUICAttrGroup( true );
		}
		
		
		// ------------------------------------------------------------------------------------------------
		// [Indexing] TAB
		
		var relationships =  data.client.relationships;
		if( relationships && relationships.length > 0 )
		{
			me.populateRelationShips( data.client.trackedEntityInstance, data.client.relationships );
		}
		
		
		// ---------------------------------------------------------------------------------------
		// Set up [HIV Testing] event data
		
		// STEP 7. Set up data in "Previous Test" tab
		me.setUp_DataInPreviousTestTab( completedHIVTestingEvents, selectedEventId );

		// STEP 8. Set up data in "This Test" tab
		me.setUp_DataInThisTestTab( activeHIVTestingEvent, data.partner );
		
		if( activeHIVTestingEvent === undefined )
		{
			// Populate data values for [Testing Material] of new event from completed event data
			me.populateTestingMaterialSectionData();
		}
		
		// STEP 9. Except EQC client, Don't not allow to create a new event if there is one event today.
		var jsonClient = JSON.parse( Element.addClientFormTabTag.attr( "client" ) );
		var firstName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
		var surName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_LastName ).toUpperCase();
		
		if( Element.addEventFormTag.attr( "event") == undefined && todayEvent && !(( firstName == "EQC" && ( surName == "POS" || surName == "NEG" ) )) )
		{
			Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, true );
			me.notAllowToCreateEventHeaderTag.show();
		}
		else
		{
			Util.disableTag( Element.showEventSaveOptionDiaglogBtnTag, false );
			me.notAllowToCreateEventHeaderTag.hide();
		}

		
		// ---------------------------------------------------------------------------------------
		// STEP 10. Set up data in [Contact Log] tab, [ART Refer] tab and [PrEP Refer] tab
		
		// Set up data in "Contact Log" tab and "ART Refer" tab
		me.populateDataValueForContactLogAndARTRefTab( artHIVTestingEvent, contactLogEvents, artOpeningEvent, artClosureEvent, prepReferHIVTestingEvent, prepReferOpeningEvent, prepReferClosureEvent );
//		if( latestEvent != undefined )
//		{
			me.checkAndShowARTReferTab( latestEvent );
//		}
		me.setUp_ARTClosureForm();
		me.setUp_PrepReferClosureForm();
		
		// ---------------------------------------------------------------------------------------
		// STEP 11. Show [This Test] / [Previous Test] tab if there is a "seleted event id"
		
		if( selectedEventId !== undefined )
		{
			if( activeHIVTestingEvent !== undefined && activeHIVTestingEvent.event == selectedEventId )
			{
				Element.addClientFormTabTag.tabs("option", "selected", 2);
			}
			else
			{
				Element.addClientFormTabTag.tabs("option", "selected", 1);
			}
		}
		else
		{
			Element.addClientFormTabTag.tabs("option", "selected", 0);
		}
		
		// ---------------------------------------------------------------------------------------
		// STEP 12. Populate attribute values in form
		// ---------------------------------------------------------------------------------------
		
		me.populateClientAttrValues( Element.addClientFormTabTag, data.client );
		
		// ---------------------------------------------------------------------------------------
		// STEP 13. Show form
		// ---------------------------------------------------------------------------------------
		
		Element.addClientFormDivTag.show("fast");
		

		// STEP 14. Init logic for attribute fields based on attribute values
		me.setUp_ClientRegistrationFormDataLogic();

	};
	

	me.isTodayEvent = function( event )
	{
		var todayStr = Util.convertDateObjToStr( new Date() );
		if( event.eventDate != undefined )
		{
			if( todayStr == event.eventDate.substring(0, 10 ) )
			{
				return true;
			}
		}
		
		return false;
	};
	
	
	me.checkIfARTEvent = function( event )
	{
		var artValue = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_ReferralGiven_ART );
		var hivTestingValue = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
		var becomeIndexLeadVal = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_BecomeIndexLead );
		
		return( ( artValue == "true" || becomeIndexLeadVal == "true" ) && hivTestingValue == "Positive" );
	};
	
	me.checkIfPrepReferEvent = function( event )
	{
		var prepReferValue = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_ReferralGivenPRePNegative );
		var hivTestingValue = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
		var becomeIndexLeadVal = Util.getAttributeValue( event.dataValues, "dataElement", MetaDataID.de_BecomeIndexLead );
		
		return( ( prepReferValue == "true" || becomeIndexLeadVal == "true" ) && hivTestingValue == "Negative" );
	};
	
	me.populateClientAttrValues = function( formTag, client )
	{
		formTag.find("input[attribute],select[attribute],textarea[attribute]").each(function(){
			var attrId = $(this).attr("attribute");
			var value = Util.getAttributeValue( client.attributes, "attribute", attrId );
			me.setValueForInputTag( $(this), value );
		});
		
		// [Closure ART Refer] - Show/Hide [Other facility name]
		var closeReferralFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_ReferralFacilityName );
		var closeSpecialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_OtherSpecialFacilityName );
		me.setHideLogicTag( closeSpecialOtherFacilityNameTag, !( closeReferralFacilityNameTag.val() == "Other" ) );
		
		
		// [Closure PrEP. Refer] - Show/Hide [Other facility name]
		var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_ReferralFacilityName );
		var specialOtherFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_OtherSpecialFacilityName );
		me.setHideLogicTag( specialOtherFacilityNameTag, !( closeReferFacilityNameTag.val() == "Other" ) );
		
		me.setUp_DataEntryFormInputTagEvent();
	};


	// -----------------------------------------------------------------------------------
	// Relationships
	// -----------------------------------------------------------------------------------
	
	me.populateRelationShips = function( clientAId, relationshipData ){
		Element.indexingListTbTag.html( "" );
		var tranlatedTextMsg = me.translationObj.getTranslatedValueByKey( "indexing_loadingRelationships" );
		
		me.relationshipsObj.loadAllRelationshipTEIs( me.clientDataList, clientAId, relationshipData, tranlatedTextMsg, function( teiList ){
			
			for( var i in teiList ) // "i" is teiId
			{
				var relationshipDetails = me.relationshipsObj.relationshipTEI_List[ i ];
				me.addRelationshipRow( teiList[i], relationshipDetails.created, relationshipDetails.relationshipType );
				me.clientDataList[teiList[i].client.trackedEntityInstance] =  teiList[i];
			}
		});
	};
	
	
	me.addRelationshipRow = function( clientData, relationshipCreated, relationshipTypeName )
	{
		var rowTitle = me.translationObj.getTranslatedValueByKey( "indexing_table_clickToSeeDetails" );
		
		var clientId = clientData.client.trackedEntityInstance;
		var created = Util.formatDate_DisplayDate( relationshipCreated );
		var CIC = "";
		var attrCIC =  Util.findItemFromList( clientData.client.attributes, "attribute", MetaDataID.attr_ClientCUIC );
		if( attrCIC )
		{
			CIC = attrCIC.value;
		}
		else
		{
			var firstNameAttrValue = Util.findItemFromList( clientData.client.attributes, "attribute", MetaDataID.attr_FirstName );
			var lastNameAttrValue = Util.findItemFromList( clientData.client.attributes, "attribute", MetaDataID.attr_LastName );
			if( firstNameAttrValue && lastNameAttrValue )
			{
				CIC = firstNameAttrValue.value + " " + lastNameAttrValue.value;
			}
		}	
		
		var hivStatus = "";
		var hivStatusEvent = ClientUtil.getLatestEventByEnrollments( clientData.enrollments, MetaDataID.stage_HIVTesting );
		if( hivStatusEvent != undefined )
		{
			var hivStatusData = Util.findItemFromList( hivStatusEvent.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
			hivStatus = ( hivStatusData != undefined ) ? hivStatusData.value : "";
		}
		
		var rowTag = $("<tr title='" + rowTitle + "' clientId='" + clientId +"'></tr>");
		rowTag.append("<td>" + created + "</td>");
		rowTag.append("<td>" + relationshipTypeName + "</td>");
		rowTag.append("<td>" + CIC + "</td>");
		rowTag.append("<td colspan='2'>" + hivStatus + "</td>");
		
		me.setUp_Event_RelationshipRow( rowTag );
		
		Element.indexingListTbTag.append( rowTag );
	};
	
	me.setUp_Event_RelationshipRow = function( rowTag )
	{
		rowTag.click( function(){

			var clientId = rowTag.attr("clientId");
			var cuic = $(rowTag.find("td")[2] ).html();
			
			var relationshipClientLink = $( "<span clientId='" + clientId + "'> > <a>" + cuic + "</a></span>" );
			relationshipClientLink.click( function(){
				me.showUpdateClientForm( me.clientDataList[clientId] );
				
				var relationshipClientLinkTag = Element.relationshipMsgTag.find("[clientId=" + clientId +"]");
				relationshipClientLinkTag.nextAll().remove(); // Remove all clients after the selected one
			});
			
			Element.relationshipMsgTag.append( relationshipClientLink );
			Element.relationshipMsgTag.show();
			
			if( me.clientDataList[clientId] != undefined )
			{
				me.showUpdateClientForm( me.clientDataList[clientId] );
			}
			else
			{
				me.loadClientDetails( clientId );
			}
		});
	};
	
	// -----------------------------------------------------------------------------------
	// Partner
	// -----------------------------------------------------------------------------------
	
	me.checkAndShowCheckedIconForPartnerCUICTag = function()
	{
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		if( partnerCUICTag.val() != "" ){
			partnerCUICTag.closest( "td" ).find( "span.partnerDetails" ).show();
			
			if( partnerCUICTag.val() == "1" )
			{
				partnerCUICTag.closest( "td" ).find( "span.partnerInfo" ).hide();
				partnerCUICTag.closest( "td" ).find( "span.partnerInfo" ).html("");
			}
		}
		else {
			partnerCUICTag.closest( "td" ).find( "span.partnerDetails" ).hide();
			partnerCUICTag.closest( "td" ).find( "span.partnerInfo" ).hide();
			partnerCUICTag.closest( "td" ).find( "span.partnerInfo" ).html("");
		}
	};
	
	me.setValueForInputTag = function( inputTag, value )
	{
		if( inputTag.attr("type") == "checkbox" )
		{
			inputTag.prop("checked", value );
		}
		else
		{
			var value = me.displayValueInInputTag( value, inputTag );
			inputTag.val( value );
		}
		
		var autocompletedField = inputTag.closest("tr").find("span.ui-combobox").find("input");
		if( autocompletedField.length > 0 )
		{
			autocompletedField.val( inputTag.find("option:selected").text() );
		}
	};
	
	me.displayValueInInputTag = function( value, inputTag )
	{
		var displayValue = value;
		
		if( ( inputTag.attr("isDate") === "true" || inputTag.attr("isDateTime") === "true" ) && value != "" )
		{
			if( inputTag.attr("isMonthYear") === "true" )
			{
				displayValue = Util.formatDate_LocalDisplayMonthYear( value );
			}
			else
			{
				displayValue = Util.formatDate_LocalDisplayDate( value );
			}
		}
		else if( inputTag.attr("type") == "checkbox" )
		{
			displayValue = "Yes";
		}
		
		return displayValue;
	};
	
	// -------------------------------------------------------------------------
	// Setup "Contact Log" TAB
	
	me.populateDataValueForContactLogAndARTRefTab = function( artHIVTestingEvent, contactLogEvents, artOpeningEvent, artClosureEvent, prepReferHIVTestingEvent, prepReferOpeningEvent, prepReferClosureEvent )
	{		
		// ---------------------------------------------------------------------
		// [Contact log]
		
		// History form
		var showHistory = true;
		Element.contactLogFormTag.find("input[mandatory='true'],select[mandatory='true']").each( function(){
			if( $(this).val() == "" )
			{
				showHistory = false;
			}
		});
		
		if( showHistory )
		{
			me.showAttrContactLogHistory();
			me.hideIconInTab( me.TAB_NAME_CONTACT_LOG );
		}
		else
		{
			me.showIconInTab( me.TAB_NAME_CONTACT_LOG );
			me.showTabInClientForm( me.TAB_NAME_INDEXING);
		}
		
	 	// Populate [Contact Log Event] history data
		me.populateContactLogEventListHistory( contactLogEvents );
		
		// Populate [ART Refer.] data
		me.populateDataValueForARTRefTab( artHIVTestingEvent, artOpeningEvent, artClosureEvent );
		
		// Populate [PrEP Refer.] data
		me.populateDataValueForPrepReferTab( prepReferHIVTestingEvent, prepReferOpeningEvent, prepReferClosureEvent )
		
	};
	
	
	me.populateDataValueForARTRefTab = function( artHIVTestingEvent, artOpeningEvent, artClosureEvent )
	{	
		// ---------------------------------------------------------------------
		// [ART Refer] header
		
		// [Client referred to ART]
		if( artHIVTestingEvent != undefined )
		{
			var eventDateStr = Util.formatDate_DisplayDate( artHIVTestingEvent.eventDate );
	 		Element.artEventInfoTbTag.find("span.dateClientReferredARTOn").html( eventDateStr );
		}
 		
 		// Generate [Time elapse] in header of [ART Ref.] form AND in [ART Closure] form
 		me.populateTimeElapsed( artOpeningEvent, artClosureEvent, true );
 		
 		// Set [Linkage Status] info
 		me.setARTLinkageStatusAttrValue();
 		
		
 		// ---------------------------------------------------------------------
		// [Opening ART Refer]
 		
		// Populate data
		if( artOpeningEvent !== undefined )
		{
			Element.artReferOpenFormTag.attr("event", JSON.stringify( artOpeningEvent ) );
			me.populateDataValuesInEntryForm( Element.artReferOpenFormTag, artOpeningEvent );
			me.hideIconInTab( me.TAB_NAME_ART_REFER );
		}
		else
		{
			me.showDateClientReferredARTOn();
			me.showIconInTab( me.TAB_NAME_ART_REFER );
		}
		
		// Populate value for auto complete [Refer facility] field in [ART Opening] FORM
		var referralFacilityNameTag = me.getDataElementField( Element.artReferOpenFormTag, MetaDataID.de_ARTOpen_ReferralFacilityName );
		referralFacilityNameTag.closest( "td" ).find("input").val( referralFacilityNameTag.find("option:selected").text() );
		
		// Show/Hide [Other facility name]
		var specialOtherFacilityNameTag = me.getDataElementField( Element.artReferOpenFormTag,MetaDataID.de_ARTOpen_OtherSpecialFacilityName );
		me.setHideLogicTag( specialOtherFacilityNameTag, !( referralFacilityNameTag.val() == "Other" ) );
		
		
		// ---------------------------------------------------------------------
		// [Closure ART Refer]

		// Populate data
		if( artClosureEvent !== undefined )
		{
			Element.artReferCloseFormTag.attr("event", JSON.stringify( artClosureEvent ) );
			me.populateDataValuesInEntryForm( Element.artReferCloseFormTag, artClosureEvent );
			me.setUp_ARTClosureFormByCaseOption();
			Util.disableForm( Element.artReferOpenFormTag, true );
		}
		else
		{
			Util.disableForm( Element.artReferOpenFormTag, false );
		}
		

		// Remove [Drop case] in [ART Closure] form if the loggin user is counsellor
		var linkageOutcomeTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome );
		if( me.appPage == Commons.APPPAGE_COUNSELLOR )
		{
			if( linkageOutcomeTag.val() != "DROPPED" )
			{
				linkageOutcomeTag.find("option[value='DROPPED']").hide();
				Util.disableForm( Element.artReferCloseFormTag, false );
			}
			else
			{
				linkageOutcomeTag.find("option[value='DROPPED']").show();
				Util.disableForm( Element.artReferCloseFormTag, true );
			}
		}
		else
		{
			Util.disableForm( Element.artReferCloseFormTag, false );
		}
		
	};
	

	me.populateDataValueForPrepReferTab = function( prepReferHIVTestingEvent, prepReferOpeningEvent, prepReferClosureEvent )
	{	
		// [Client referred to PrEP Refer.]
		if( prepReferHIVTestingEvent != undefined )
		{
			var eventDateStr = Util.formatDate_DisplayDate( prepReferHIVTestingEvent.eventDate );
	 		Element.artEventInfoTbTag.find("span.dateClientReferredPrepReferOn").html( eventDateStr );
		}
 		
 		// Generate [Time elapse] in header of [ART Ref.] form AND in [PrEP Refer. Closure] form
 		me.populateTimeElapsed( prepReferOpeningEvent, prepReferClosureEvent, false );
 		
 		// Set [Linkage Status] info
 		me.setPrepReferLinkageStatusAttrValue();
 		
		
 		// ---------------------------------------------------------------------
		// [Opening PrEP Refer.]
 		
		// Populate data
		if( prepReferOpeningEvent !== undefined )
		{
			Element.prepReferOpenFormTag.attr("event", JSON.stringify( prepReferOpeningEvent ) );
			me.populateDataValuesInEntryForm( Element.prepReferOpenFormTag, prepReferOpeningEvent );
			me.hideIconInTab( me.TAB_NAME_PREP_REFER );
		}
		else
		{
			me.showDateClientReferredARTOn();
			me.showIconInTab( me.TAB_NAME_PREP_REFER );
		}
		
		// Set value for autocomple input tag
		var referralFacilityNameTag = me.getDataElementField( Element.prepReferOpenFormTag, MetaDataID.de_prepReferOpen_ReferralFacilityName );
		referralFacilityNameTag.closest( "td" ).find("input").val( referralFacilityNameTag.find("option:selected").text() );
		
		// Show/Hide [Other facility name]
		var specialOtherFacilityNameTag = me.getDataElementField( Element.prepReferOpenFormTag, MetaDataID.de_prepReferOpen_OtherSpecialFacilityName );
		me.setHideLogicTag( specialOtherFacilityNameTag, !( referralFacilityNameTag.val() == "Other" ) );
		
		
		// ---------------------------------------------------------------------
		// [Closure PrEP Refer.]

		// Populate data
		if( prepReferClosureEvent !== undefined )
		{
			Element.prepReferCloseFormTag.attr("event", JSON.stringify( prepReferClosureEvent ) );
			me.populateDataValuesInEntryForm( Element.prepReferCloseFormTag, prepReferClosureEvent );
			me.setUp_PrepReferClosureFormByCaseOption();
			Util.disableForm( Element.prepReferOpenFormTag, true );
		}
		else
		{
			Util.disableForm( Element.prepReferOpenFormTag, false );
		}
		

		// Remove [Drop case] in [ART Closure] form if the loggin user is counsellor
		var linkageOutcomeTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferClosureLinkageOutcome );
		if( me.appPage == Commons.APPPAGE_COUNSELLOR )
		{
			if( linkageOutcomeTag.val() != "DROPPED" )
			{
				linkageOutcomeTag.find("option[value='DROPPED']").hide();
				Util.disableForm( Element.prepReferCloseFormTag, false );
			}
			else
			{
				linkageOutcomeTag.find("option[value='DROPPED']").show();
				Util.disableForm( Element.prepReferCloseFormTag, true );
			}
		}
		else
		{
			Util.disableForm( Element.prepReferCloseFormTag, false );
		}
		
	};
	
	me.setUp_ARTClosureFormByCaseOption = function()
	{
		// Set value for autocomple input tag
		var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_ARTClosure_ReferralFacilityName );
		closeReferFacilityNameTag.closest( "td" ).find("input").val( closeReferFacilityNameTag.find("option:selected").text() );
		

		// Set up [ART Closure] form
		var closureLinkageOutcomeTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTClosureLinkageOutcome );
		var droppedReasonTag = me.getDataElementField( Element.artReferCloseFormTag, MetaDataID.de_ARTLinkageStatusDropReason );
		var closureLinkageOutcomeVal = closureLinkageOutcomeTag.val();
		
		if( closureLinkageOutcomeVal == "SUCCESS" )
		{
			Element.artReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_ARTClosureLinkageOutcome )
				{
					me.setHideLogicTag( $(this), false);
				}
			});
		
			me.setHideLogicTag( droppedReasonTag, true);
			me.removeMandatoryForField( droppedReasonTag );
			
			// Set Date picker for [Date of ART enrollment]
			var openingEventDate = JSON.parse( Element.artReferOpenFormTag.attr("event") );
			var dateARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_ART_Enrollment );		
			
			var minDate = new Date();
			minDate.setFullYear( minDate.getFullYear() - 100 );
			minDate = Util.convertDateObjToStr( minDate );
			Util.datePicker_SetDateRange( dateARTEnrollmentTag, minDate, Util.convertDateObjToStr( new Date() ) );
			dateARTEnrollmentTag.change();
			
			var artClosure_TimeElapsedTag = me.getAttributeField( MetaDataID.attr_ARTClosure_TimeElapsed );
			Util.disableTag( artClosure_TimeElapsedTag, true );
		}
		else if( closureLinkageOutcomeVal == "DROPPED" )
		{
			Element.artReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_ARTClosureLinkageOutcome
					&& $(this).attr("dataelement") != MetaDataID.de_ARTLinkageStatusDropReason )
				{
					me.setHideLogicTag( $(this).closest("tr"), true);
				}
			});
			me.setHideLogicTag( droppedReasonTag, false);
			me.addMandatoryForField( droppedReasonTag );
		}

		me.setHideLogicTag( closureLinkageOutcomeTag, false);
	};
	

	me.setUp_PrepReferClosureFormByCaseOption = function()
	{
		// Set value for autocomple input tag
		var closeReferFacilityNameTag = me.getAttributeField( MetaDataID.attr_prepReferClosure_ReferralFacilityName );
		closeReferFacilityNameTag.closest( "td" ).find("input").val( closeReferFacilityNameTag.find("option:selected").text() );
		

		// Set up [ART Closure] form
		var closureLinkageOutcomeTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferClosureLinkageOutcome );
		var droppedReasonTag = me.getDataElementField( Element.prepReferCloseFormTag, MetaDataID.de_prepReferLinkageStatusDropReason );
		var closureLinkageOutcomeVal = closureLinkageOutcomeTag.val();
		
		if( closureLinkageOutcomeVal == "SUCCESS" )
		{
			Element.prepReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_prepReferClosureLinkageOutcome )
				{
					me.setHideLogicTag( $(this), false);
				}
			});
		
			me.setHideLogicTag( droppedReasonTag, true);
			me.removeMandatoryForField( droppedReasonTag );
			
			// Set Date picker for [Date of PrEP Refer. enrollment]
			var openingEventDate = JSON.parse( Element.prepReferOpenFormTag.attr("event") );
			var dateARTEnrollmentTag = me.getAttributeField( MetaDataID.attr_Date_Of_ART_Enrollment );		
			
			var minDate = new Date();
			minDate.setFullYear( minDate.getFullYear() - 100 );
			minDate = Util.convertDateObjToStr( minDate );
			Util.datePicker_SetDateRange( dateARTEnrollmentTag, minDate, Util.convertDateObjToStr( new Date() ) );
			dateARTEnrollmentTag.change();
			
			var closure_TimeElapsedTag = me.getAttributeField( MetaDataID.attr_PrepReferClosure_TimeElapsed );
			Util.disableTag( closure_TimeElapsedTag, true );
			
		}
		else if( closureLinkageOutcomeVal == "DROPPED" )
		{
			Element.prepReferCloseFormTag.find("input,select").each(function(){
				if( $(this).attr("dataelement") != MetaDataID.de_prepReferClosureLinkageOutcome
						&& $(this).attr("dataelement") != MetaDataID.de_prepReferLinkageStatusDropReason )
				{
					me.setHideLogicTag( $(this), true);
				}
			});
			me.setHideLogicTag( droppedReasonTag, false);
			me.addMandatoryForField( droppedReasonTag );
		}

		me.setHideLogicTag( closureLinkageOutcomeTag, false);
	};
	
	
	me.populateTimeElapsed = function( openingEvent, closureEvent, isArtEvent )
	{
 		if( openingEvent != undefined )
 		{
 			var openingEventDate = Util.convertUTCDateToLocalDate( openingEvent.eventDate );
 			
// 			var closureEventDate = new Date();
// 			if( closureEvent != undefined )
// 			{
// 				closureEvent = Util.convertUTCDateToLocalDate( closureEvent.eventDate );
// 			}

			var daysElapsed = Util.getDaysTimeElapsed( openingEventDate, new Date() );
			
 			// Generate [Time elapse] in header of [ART Ref.] form
 			if( isArtEvent )
 			{
 	 	 		Element.artEventInfoTbTag.find("span.timeClientReferredARTOn").html( daysElapsed );
 			}
 			// Generate [Time elapse] in header of [PrEP Ref.] form
 			else
 			{
 	 	 		Element.prepReferEventInfoTbTag.find("span.timeClientReferredReferredPrepReferOn").html( daysElapsed );
 			}
 	 		
 		}
 		else
 		{
 			if( isArtEvent )
 			{
 				Element.artEventInfoTbTag.find("span.timeClientReferredARTOn").html( "" );
 			}
 			// Generate [Time elapse] in header of [PrEP Ref.] form
 			else
 			{
 	 	 		Element.prepReferEventInfoTbTag.find("span.timeClientReferredReferredPrepReferOn").html( "" );
 			}
 		}
	};
	
	me.checkAndShowARTReferTab = function( latestEvent )
	{
		me.hideTabInClientForm( me.TAB_NAME_ART_REFER );
		me.hideTabInClientForm( me.TAB_NAME_PREP_REFER );
		me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
		me.showTabInClientForm( me.TAB_NAME_INDEXING);
		
		var jsonClient = JSON.parse( Element.addClientFormTabTag.attr( "client" ) );
		var firstName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
		var surName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_LastName ).toUpperCase();
		if( firstName == "EQC" && ( surName == "POS" || surName == "NEG" ) )
		{
			me.hideTabInClientForm( me.TAB_NAME_CONTACT_LOG );
			me.hideTabInClientForm( me.TAB_NAME_INDEXING);
		}
		else if( latestEvent !== undefined )
		{
			var finalHIVTestValue = Util.getAttributeValue( latestEvent.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
		
			if( finalHIVTestValue != undefined )
			{
				var testResultGivenValue = Util.getAttributeValue( latestEvent.dataValues, "dataElement", MetaDataID.de_TestResultsGiven );
				var becomeIndexLeadVal = Util.getAttributeValue( latestEvent.dataValues, "dataElement", MetaDataID.de_BecomeIndexLead );
				var consentToContactTag =  me.getAttributeField( MetaDataID.attr_ConsentToContact );
			
				// STEP 1. Check IF Final status is positive 
				// 		AND results are received 
				//		AND Referral to ART is given, apply the logic the [Contact Log] and [ART Refer] Tabs
				// ( create ART referral opening event,
				//	 move to contact log tab to force user to complete data points 
				// 	 and move to ART referral tab )
				if( finalHIVTestValue == "Positive" )
				{
					var artValue = Util.getAttributeValue( latestEvent.dataValues, "dataElement", MetaDataID.de_ReferralGiven_ART );
		
					if( ( artValue == "true" || becomeIndexLeadVal == "true" ) && testResultGivenValue == "true" )
					{
		
//						me.hideTabInClientForm( me.TAB_NAME_PREP_REFER );
//		//				me.showDateClientReferredARTOn();
						
						// STEP 2. For [Coordinator] 
						if( consentToContactTag.val() != "" )
						{
							me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
							me.showTabInClientForm( me.TAB_NAME_INDEXING );
							me.showTabInClientForm( me.TAB_NAME_ART_REFER );
						}
						else
						{
							me.showTabInClientForm( me.TAB_NAME_ART_REFER );
							me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
							me.showTabInClientForm( me.TAB_NAME_INDEXING );
						}
						
					}
					

					// Show [ART Closure] form only when there is one [ART Opening] event
					if( Element.artReferOpenFormTag.attr("event") != undefined )
					{
						Element.artReferCloseFormTag.show();
					}
					else
					{
						me.showDateClientReferredARTOn();
						me.showIconInTab( me.TAB_NAME_ART_REFER );
						Element.artReferCloseFormTag.hide();
					}
				}
				else if( finalHIVTestValue == "Negative" )
				{
					// STEP 1. Check IF Final status is negative 
					// 		AND results are received 
					//		AND Referral to ART is given, apply the logic the [Contact Log] and [ART Refer] Tabs
					// ( create ART referral opening event,
					//	 move to contact log tab to force user to complete data points 
					// 	 and move to ART referral tab )
					var prepReferValue = Util.getAttributeValue( latestEvent.dataValues, "dataElement", MetaDataID.de_ReferralGivenPRePNegative );
					if( ( prepReferValue == "true" || becomeIndexLeadVal == "true" ) && testResultGivenValue == "true" )
					{
//						me.hideTabInClientForm( me.TAB_NAME_ART_REFER );
						
						// STEP 2. For [Coordinator] 
						if( consentToContactTag.val() != "" )
						{
							me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
							me.showTabInClientForm( me.TAB_NAME_INDEXING );
							me.showTabInClientForm( me.TAB_NAME_PREP_REFER );
						}
						else
						{
							me.showTabInClientForm( me.TAB_NAME_PREP_REFER );
							me.showTabInClientForm( me.TAB_NAME_CONTACT_LOG );
							me.showTabInClientForm( me.TAB_NAME_INDEXING );
						}
						
					}
					
					// Show [PrEP. Refer Closure] form only when there is one [PrEP. Refer Opening] event
					if( Element.prepReferOpenFormTag.attr("event") != undefined )
					{
						Element.prepReferCloseFormTag.show();
					}
					else
					{
						me.showDateClientReferredARTOn();
						me.showIconInTab( me.TAB_NAME_PREP_REFER );
						Element.prepReferCloseFormTag.hide();
					}
				}
				
				// STEP 3. Show [ART Opening] OR [Prep PrEP. Refer opening] tab
				me.showOpeningTag = true;
			}
		}
		
	};
	
	me.showAttrContactLogHistory = function()
	{
		Element.contactLogFormTag.find("tbody:last").hide();
		Element.contactLogFormTag.find("tbody[groupId]").each(function(){
			var groupId = $(this).attr("groupId");
			me.showHistoryContactLogDetails( groupId );
		});
		
	};

	me.hideAttrContactLogHistory = function()
	{
		Element.contactLogFormTag.find("tbody[historyGroupId]").hide();
		Element.contactLogFormTag.find("tbody[groupId]").show();
	}
	
	me.showHistoryContactLogDetails = function( groupId )
	{
		// Hide [Edit Contact Log] form
		Element.contactLogFormTag.find("tbody[groupId='" + groupId + "']").hide();
		
		// Show [History] form
		var historyTable = Element.contactLogFormTag.find( "tbody[historyGroupId='" + groupId + "']" );
		var historyTag = historyTable.find("td.historyInfo");
		historyTag.html("");
		historyTable.show();
		
		if( groupId == "TTTT4Ll5TdV" ) // Attribute Group [LS LOG 2 - Contact Details]
		{
			var contactPhoneNumber = me.getAttributeField( MetaDataID.attr_ContactDetails_phoneNumber ).val();
		
			var restrictionsContacting  = me.getAttributeField( MetaDataID.attr_RestrictionsContacting ).val();
			restrictionsContacting = ( restrictionsContacting != "" ) ? " - Restrictions: " +  restrictionsContacting : "";
			
			var address1 = me.getAttributeField( MetaDataID.attr_Address1 ).val();
			address1 = me.getDisplayNameByAttributeValue( MetaDataID.attr_Address1, address1 );
			
			var address2 = me.getAttributeField( MetaDataID.attr_Address2 ).val();
			address2 = me.getDisplayNameByAttributeValue( MetaDataID.attr_Address2, address2 );
			
			var address3 = me.getAttributeField( MetaDataID.attr_Address3 ).val();
			address3 = me.getDisplayNameByAttributeValue( MetaDataID.attr_Address3, address3 );
			
			var address4 = me.getAttributeField( MetaDataID.attr_Address4 ).val();
			address4 = me.getDisplayNameByAttributeValue( MetaDataID.attr_Address4, address4 );
			
			var address5 = me.getAttributeField( MetaDataID.attr_Address5 ).val();
			address5 = me.getDisplayNameByAttributeValue( MetaDataID.attr_Address5, address5 );
						
			historyTag.append("<p><span class='glyphicon glyphicon-earphone'></span> " + contactPhoneNumber + restrictionsContacting + "</p>");
			historyTag.append("<p><span class='glyphicon glyphicon-list-alt'></span> " + address1 + "<br>Landmark: " + address2 + "<br>" + address3 + ", " + address4 + ", " + address5 + "</p>");
		}
		else if( groupId == "CqBvWGKEKLP" ) // Attribute Group [LS LOG 3 - Next of kin]
		{
			var kinName =  me.getAttributeField( MetaDataID.attr_KinName ).val();
			var kinRelation =  me.getAttributeField( MetaDataID.attr_KinRelation ).val();
			var nextKinPhoneNumberTag = me.getAttributeField( MetaDataID.attr_NextKinPhoneNumber );
			historyTag.append("<p>" + kinName + " - " + kinRelation + "</p>");
			historyTag.append("<p><span class='glyphicon glyphicon-earphone'></span> " + nextKinPhoneNumberTag.val() + "</p>");
		}

	};
	
	me.populateContactLogEventListHistory = function( eventList )
	{
		Element.contactLogEventHistoryTbTag.html( "" );
		
		var idx = 0;
		for( var i in eventList )
		{
			me.populateContactLogEventHistory( eventList[i], ( idx == eventList.length - 1 ) );
			idx ++;
		}
		
		// Populate for [Next action] of [Contact Log]
		if( eventList.length > 0 )
		{
			me.populateNextContactLogActionBar( eventList[eventList.length - 1] );
		}
	};
	 
	me.populateContactLogEventHistory = function( eventJson, canEdit )
	{
		var eventDate = "";
		if( eventJson.eventDate !== undefined ){
			eventDate = Util.formatDate_DisplayDate( eventJson.eventDate );
		}
		var typeOfContact = "";
		var outcome = "";
		var comments = "";
		var nextAction = "";
		var dueDate = "";
		
		var dataValues = eventJson.dataValues;
		for( var i in dataValues )
		{
			var deId = dataValues[i].dataElement;
			var value = dataValues[i].value;
			
			if( deId == MetaDataID.de_TypeOfContact )
			{
				typeOfContact = me.getDisplayNameByDataValue( Element.contactLogFormTag, deId, value );
			}
			else if( deId == MetaDataID.de_Outcome )
			{
				outcome = me.getDisplayNameByDataValue( Element.contactLogFormTag, deId, value );
			}
			else if( deId == MetaDataID.de_NextAction )
			{
				nextAction = me.getDisplayNameByDataValue( Element.contactLogFormTag, deId, value );
			}
			else if( deId == MetaDataID.de_DueDate )
			{
				dueDate = me.getDisplayNameByDataValue( Element.contactLogFormTag, deId, value );
			}
			else if( deId == MetaDataID.de_Comments )
			{
				comments = me.getDisplayNameByDataValue( Element.contactLogFormTag, deId, value );
			}
		}
		
		
		// ---------------------------------------------------------------------
		// Add history
		// ---------------------------------------------------------------------
		
		var tbody = $("<tbody></tbody");
		
		// ---------------------------------------------------------------------
		// Header
		
		var headerTag = $("<tr class='actionBar' event='" + JSON.stringify( eventJson ) + "' eventId='" + eventJson.event + "'></tr>");
		headerTag.append("<th>Date: " + eventDate + "</th>");
		headerTag.append("<th>Type: " + typeOfContact + "</th>");
		
		// [Outcome] Cell
		var outcomeColspan = ( canEdit ) ? "1" : "2";
		headerTag.append("<th colspan='" + outcomeColspan + "' class='outcome'>Outcome: " + outcome + "</th>");
		if( canEdit )
		{
			var editCellTag = $( "<th class='actionCell' style='width:20px;'><button><span class='glyphicon glyphicon-pencil'></span></button></th>" );
			headerTag.append( editCellTag );
			me.setUp_Events_EditContactLogEvent( editCellTag );
		}
		
		
		// ---------------------------------------------------------------------
		// Add event information in history table
		var rowTag = $("<tr></tr>");
		rowTag.append("<td colspan='4'>" + comments + "</td>");
		
		tbody.append( headerTag );
		tbody.append( rowTag );
		Element.contactLogEventHistoryTbTag.prepend( tbody );
	};
	
	
	me.populateNextContactLogActionBar = function( contactLogEvent )
	{
		var eventDate = "";
		if( contactLogEvent.eventDate !== undefined ){
			eventDate = Util.formatDate_DisplayDate( contactLogEvent.eventDate );
		}
		
		var nextAction = "";
		var nextActionCode = "";
		var dueDate = "";
		
		var dataValues = contactLogEvent.dataValues;
		for( var i in dataValues )
		{
			var deId = dataValues[i].dataElement;
			var value = dataValues[i].value;
			
			if( deId == MetaDataID.de_NextAction )
			{
				nextAction = me.getDisplayNameByDataValue( Element.addContactLogEventFormTag, deId, value );
				nextActionCode = value;
			}
			else if( deId == MetaDataID.de_DueDate )
			{
				dueDate = me.getDisplayNameByDataValue( Element.addContactLogEventFormTag, deId, value );
			}
		}
		
		// Add Next contact log
		if( nextAction != "" )
		{
			Element.nextContactLogActionTbTag.find("span.nextAction").html( nextAction );
			
			if( dueDate == "" )
			{
				var notSpecifiedText = me.translationObj.getTranslatedValueByKey( "contactLogEvent_msg_noneDueDate" );
				dueDate = "[" + notSpecifiedText + "]";
			}
			 
			Element.nextContactLogActionTbTag.find("span.dueDate").html( dueDate );
			
			if( nextActionCode == "NONE" )
			{
				Element.nextContactLogActionTbTag.hide();
			}
			else
			{
				Element.nextContactLogActionTbTag.show();
			}
		}
	};
	
	me.setUp_Events_EditContactLogEvent = function( editCellTag )
	{
		editCellTag.click( function(){
			var event = editCellTag.closest("tr").attr("event");
			Element.contactLogEventFormTag.attr( "event", event );
			var eventJson = JSON.parse( event );
			
			var dataValues = eventJson.dataValues;
			for( var i in dataValues )
			{
				var deId = dataValues[i].dataElement;
				var value = dataValues[i].value;
				
				var inputTag = Element.contactLogEventFormTag.find("[dataelement='" + deId + "']");
				value = me.displayValueInInputTag( value, inputTag );
				inputTag.val( value );
			}

			Element.contactLogEventFormTag.show();
		});
	};
	
	me.getDisplayNameByDataValue = function( formTag, deId, value )
	{
		var tag = me.getDataElementField( formTag, deId );
		if( tag.prop( "tagName" ) == 'SELECT'  )
		{
			value = tag.find("option[value='" + value + "']").text();
		}
		
		return value;
	}

	me.getDisplayNameByAttributeValue = function( attrId, value )
	{
		var tag = me.getAttributeField( attrId );
		if( tag.prop( "tagName" ) == 'SELECT'  )
		{
			value = tag.find("option[value='" + value + "']").text();
		}
		
		return value;
	}
	
	// ---------------------------------------------------------------------------------------
	// Setup data in "This Test" TAB
	// ---------------------------------------------------------------------------------------
	
	me.setUp_DataInPreviousTestTab = function( events, selectedEventId )
	{
		var jsonClient = JSON.parse( Element.addClientFormTabTag.attr("client") );
		var firstName = Util.getAttributeValue( jsonClient.attributes, "attribute", MetaDataID.attr_FirstName ).toUpperCase();
		if( firstName != "EQC" )
		{
			for( var i=0; i<events.length; i++ )
			{
				var event = events[i];
				
				// STEP 2.2. Create tbody for the event and populate data values of an event				
				var tbody = me.createAndPopulateDataInEntryForm( event, MetaDataID.stage_HIVTesting );
				Element.previousTestsTag.find("table").append( tbody );
			}
			
			me.checkAndDisplayPreviousTestTab( selectedEventId );
		}
		else
		{
			me.hideTabInClientForm( me.TAB_NAME_PREVIOUS_TEST );
		}
	};
	
	
	me.populateHistoryEventData = function( dataValues, tag )
	{
		for( var j in dataValues )
		{
			var dataValue = dataValues[j];
			var deId = dataValue.dataElement;
			var value = dataValue.value;
			
			var inputTag = Element.thisTestDivTag.find("input[dataElement='" + deId + "'],select[dataElement='" + deId + "']");
			if( inputTag.prop("tagName") == "SELECT" )
			{
				value = inputTag.find("option[value='" + value + "']").text();
			}
			else if( ( inputTag.attr("isDate") === "true" || inputTag.attr("isDateTime") === "true" ) && value != "" )
			{
				value = Util.formatDate_LocalDisplayDate( value );
			}
			else if( inputTag.attr("type") == "checkbox" )
			{
				value = "Yes";
			}
			
			tag.find("td[dataElement='" + deId + "']").html( value );
		}
	};

	
	me.checkAndDisplayPreviousTestTab = function( selectedEventId )
	{
		report = Element.previousTestsTag.find("table");
		if( report.find("tbody").length > 0 )
		{
			// Show selectedEvent in PreviousTest if any
			if( selectedEventId !== undefined )
			{
				report.find('tbody tr[eventId="' + selectedEventId + '"]').find("img.showHide").click();
			}
			else
			{
				report.find('tbody:first tr[eventId]').find("img.showHide").click();
			}
			
			me.showTabInClientForm( me.TAB_NAME_PREVIOUS_TEST );
		}
		else
		{
			me.hideTabInClientForm( me.TAB_NAME_PREVIOUS_TEST );
		}
	}
	

	// ---------------------------------------------------------------------------------------
	// Setup data in "This Test" TAB
	// ---------------------------------------------------------------------------------------
	
	me.setUp_DataInThisTestTab = function( activeEvent, partnerData )
	{	
		Element.addEventFormTag.attr( "event", JSON.stringify( activeEvent ) );
		if( partnerData!= undefined )
		{
			Element.addEventFormTag.attr( "partnerData", JSON.stringify( partnerData ) );
		}
		
		me.showTabInClientForm( me.TAB_NAME_THIS_TEST );
		
		if( activeEvent !== undefined )
		{	
			me.activeEventHeaderTag.show();
			
			// Populate event data
			me.populateDataValuesInEntryForm( Element.addClientFormTabTag, activeEvent );
			
			// Show red icon which means the event is not COMPLETED
			me.showIconInTab( me.TAB_NAME_THIS_TEST );
		}
		else
		{			
			me.activeEventHeaderTag.hide();
			// Show red icon which means the event is not COMPLETED
			me.hideIconInTab( me.TAB_NAME_THIS_TEST );
		}
		
		// Set up if Data Entry Form can be editable
		me.setUp_IfDataEntryFormEditable( activeEvent );
		
		// Set data values based on client attribute values
		me.setUp_InitDataValues();
		
		
		me.checkAndShowCheckedIconForPartnerCUICTag();
		me.populatePartnerInfor( partnerData );

	};
	
	me.setUp_PartnerInfor = function( response )
	{
		if( response !== undefined )
		{
			var rows = response.listGrid.rows;
			if( rows.length == 1 )
			{
				var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
				
				var partnerCUICVal = rows[0][3];
				partnerCUICTag.val( partnerCUICVal );
				partnerCUICTag.attr("lastHIVTest", rows[0][6] );
				
				var partnerEventId = rows[0][0];
				me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId ).val( partnerEventId );

				var partnerDetails = rows[0][4] + " " + rows[0][5] + " (" + rows[0][6] + ")";
				partnerCUICTag.attr( "title", partnerDetails );
				partnerCUICTag.closest( "td" ).find("span.partnerInfo").html( partnerDetails );
				partnerCUICTag.closest( "td" ).find("span.partnerInfo").show();
			}
		}
	}
	
	me.populatePartnerInfor = function( partnerData )
	{
		if( partnerData != undefined && partnerData.clientDetails !== undefined )
		{
			var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
			var eventData = partnerData.eventDetails;
			var clientDetails = partnerData.clientDetails;
			var arrValues =  clientDetails.attributes;
			
			var partnerCUICVal = Util.getAttributeValue( arrValues, "attribute", MetaDataID.attr_ClientCUIC );
			var lastHIVTest = Util.getAttributeValue( eventData.dataValues, "dataElement", MetaDataID.de_FinalResult_HIVStatus );
			var firstName = Util.getAttributeValue( arrValues, "attribute", MetaDataID.attr_FirstName );
			var lastName = Util.getAttributeValue( arrValues, "attribute", MetaDataID.attr_LastName );
			
			partnerCUICTag.val( partnerCUICVal );
			partnerCUICTag.attr("lastHIVTest", lastHIVTest );

			var partnerEventId = eventData.event;
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_PartnerEventId ).val( partnerEventId );
			
			var partnerDetails = firstName + " " + lastName + " (" + lastHIVTest + ")";
			partnerCUICTag.attr( "title", partnerDetails );
			partnerCUICTag.closest( "td" ).find("span.partnerInfo").html( partnerDetails );
			partnerCUICTag.closest( "td" ).find("span.partnerInfo").show();
		}
	}
	
	// Check if the logged counsellor if this counsellor is the person who created the active event
	// If logged counsellor is a person who create the active event, then allow to edit data event
	
	me.setUp_IfDataEntryFormEditable = function( activeEvent )
	{
		var catOptionName = Element.userFullNameTag.html();
		
		if( activeEvent !== undefined )
		{
			me.activeEventHeaderTag.show();
			var attributeOptionCombo = activeEvent.attributeCategoryOptions;
			
			var searchLoggedCounsellor = Util.findItemFromList( me.catOptionComboList, "id", attributeOptionCombo );
								
			if( searchLoggedCounsellor !== undefined )
			{
				catOptionName = searchLoggedCounsellor.name;
				
				if( me.mainPage.settingsManagement.loginUsername === searchLoggedCounsellor.code )
				{
					me.disableDataEtryForm( false );
					me.activeEventHeaderTag.css( "color","gray" );
				}
				else
				{
					me.disableDataEtryForm( true );
					
					me.activeEventHeaderTag.css( "color","tomato" );
				}
			}
			else
			{
				catOptionName = attributeOptionCombo;
			}
			
			me.setUp_logicEntryFormWithData();
		}
		else
		{
			me.activeEventHeaderTag.hide();
		}
		
		me.activeEventHeaderTag.find("span").html( catOptionName );
	}

	me.populateDataValuesInEntryForm = function( tabTag, event )
	{
		tabTag.attr( "event", JSON.stringify( event ) );
		
		var dataValues = event.dataValues;
		for( var i in dataValues )
		{
			var dataValue = dataValues[i];
			var value = dataValue.value;
			
			var inputTag = me.getDataElementField( tabTag, dataValue.dataElement );
			me.setValueForInputTag( inputTag, value );
		}
	};
	
	me.populateTestingMaterialSectionData = function()
	{
		var prevEventTag = Element.previousTestsTag.find("table").find("tbody:first");

		if( prevEventTag.length == 1 )
		{
			var determineLotNo = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_DetermineLotNo + "']").html();
			var determineLotNo_ExpiryDate = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_DetermineLotNo_ExpiryDate + "']").html();
			var unigoldLotNo = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_UnigoldLotNo + "']").html();
			var unigoldLotNo_ExpiryDate = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_UnigoldLotNo_ExpiryDate + "']").html();
			var sdBiolineLotNo = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_SDBiolineLotNo + "']").html();
			var sdBiolineLotNo_ExpiryDate = prevEventTag.find("td[dataElement='" + MetaDataID.de_TestingMateria_SDBiolineLotNo_ExpiryDate + "']").html();
			
			
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_DetermineLotNo ).val( determineLotNo );
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_DetermineLotNo_ExpiryDate ).val( determineLotNo_ExpiryDate );
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_UnigoldLotNo ).val( unigoldLotNo );
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_UnigoldLotNo_ExpiryDate ).val( unigoldLotNo_ExpiryDate );
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_SDBiolineLotNo ).val( sdBiolineLotNo );
			me.getDataElementField( Element.addEventFormTag, MetaDataID.de_TestingMateria_SDBiolineLotNo_ExpiryDate ).val( sdBiolineLotNo_ExpiryDate );
		}
	};
	
	me.disableDataEtryForm = function( disabled )
	{
		Element.addEventFormTag.find("input,select").each( function(){
			var deId = $(this).attr("dataelement");
			
			if( deId != MetaDataID.de_Testing_ResultTest1 &&
				deId != MetaDataID.de_Testing_ResultTest2 && 
				deId != MetaDataID.de_Testing_ResultParallel1 && 
				deId != MetaDataID.de_Testing_ResultParallel2 && 
				deId != MetaDataID.de_Testing_ResultSDBioline &&
				deId != MetaDataID.de_FinalResult_HIVStatus &&
				$(this).attr( 'isReadOnly' ) == undefined )
			{
				Util.disableTag( $(this), disabled );
			}
		});
	};
	
	me.setUp_logicEntryFormWithData = function()
	{
		if( eval( Element.addClientFormTabTag.attr("addedLogic") ) )
		{
			if( me.resultTestResultSDBiolineTag.val() != "" )
			{
				var result = me.resultTestResultSDBiolineTag.val();
				if( me.resultTestResultSDBiolineTag.val() == "Indeterminate out of stock"
					|| me.resultTestResultSDBiolineTag.val() == "Positive" )
				{
					result = "Indeterminate";
				}
				me.resultFinalHIVStatusTag.val( result );
				me.resultFinalHIVStatusTag.closest("td").find("errorMsg").remove();
				
				Util.disableTag( me.resultTest2Tag, false );
				Util.disableTag( me.resultTestParallel1Tag, false );
				Util.disableTag( me.resultTestParallel2Tag, false );
				Util.disableTag( me.resultTestResultSDBiolineTag, false );
			}
			else if( me.resultTestParallel1Tag.val() != "" && me.resultTestParallel2Tag.val() != "" )
			{
				Util.disableTag( me.resultTest2Tag, false );
				Util.disableTag( me.resultTestParallel1Tag, false );
				Util.disableTag( me.resultTestParallel2Tag, false );
				me.setUp_DataElementResultParallelLogic();
			}
			else if( me.resultTest2Tag.val() != "" )
			{
				Util.disableTag( me.resultTest2Tag, false );
				me.setUp_DataElementResultTest2Logic();
			}
			else
			{
				me.setUp_DataElementResultTest1Logic();
			}
			
		}
	};
	
	// Create a tbody with sections of programs. This one is used for generating history of events of a client
		
	me.createAndPopulateDataInEntryForm = function( event, stageId )
	{
		var eventId = event.event;
		var eventDate = event.eventDate;
		var counsellor = me.findCounsellorByEventCatOptComboId( event.attributeCategoryOptions );
		var testResult = me.getEventResult( event );
		
		var tbody = $("<tbody eventId='" + eventId + "' class='separateTb'></tbody>");
		
		// STEP 1. Create header
		
		var headerTag = $("<tr header='true' eventId='" + eventId + "' style='cursor:pointer;' eventDate='" + eventDate + "'></tr>");

		var orgUnitName = event.orgUnitName;
		if( orgUnitName == undefined )
		{
			orgUnitName = Element.orgUnitListTag.find("option:selected").text();
		}
		
		var url = 'event.html?eventid=' + eventId;
		var onclickEvent="window.open(\"" + url + "\",\"Event Report\",\"width=400,height=500\");"
		headerTag.append("<th colspan='2'>"
				+ "<span class='headerInfor'> <img style='float:left' class='arrowRightImg showHide' src='../images/tab_right.png'> " 
				+ Util.formatDate_DisplayDateTime( eventDate, false ) 
				+ "<font class='saperate'> | </font>" + orgUnitName 
				+ "<font class='saperate'> | </font>" + counsellor 
				+ "<font class='saperate'> | </font>" + testResult + "</span>"
				+ " <span style='float:right;'><a onclick='" + onclickEvent + "' href='#' > <img src='../images/print.png'></a></span></th>");
		
		tbody.append( headerTag );
		
		// STEP 2. Create row data
		
		var stageData = Util.findItemFromList( me.sectionList, "id", stageId );
		var sections = stageData.programStageSections;
		var psDataElements = stageData.programStageDataElements;
		
		for( var i in sections )
		{
			rowTag = $("<tr style='display:none;'></tr>");
			rowTag.append("<td colspan='2' style='font-weight:bold;background-color:#dde2e6;'>" + sections[i].displayName + "</td>");
			tbody.append( rowTag );
			
			
			var deList = sections[i].dataElements;
			for( var l in deList)
			{
				var de = deList[l].dataElement;
				var deId = deList[l].id;
				var de = me.findDataElementInProgramStageDEList( deId, psDataElements );
//				de.mandatory = eval( de.compulsory );
				de = de.dataElement;
				
				rowTag = $("<tr style='display:none;'></tr>");
				rowTag.append("<td>" + de.formName + "</td>");
				rowTag.append("<td dataElement='" + de.id +"'></td>");
				tbody.append( rowTag );
				
			} // END DE List
			
		}// END Sections
		

		// STEP 3. Add event for Header row
		
		me.setUp_PreviousTestHeaderEvent( headerTag, Element.previousTestsTag.find("table") );
		
		// STEP 4. Populate event data
		me.populateHistoryEventData( event.dataValues, tbody );
		
		return tbody;
	}
	
	me.getEventResult = function( event )
	{
		var result = "";
		for( var i in event.dataValues )
		{
			var dataValue = event.dataValues[i];
			if( dataValue.dataElement == MetaDataID.de_FinalResult_HIVStatus )
			{
				result = dataValue.value;
			}
		}
		
		return result;
	};
	
	me.findCounsellorByEventCatOptComboId = function( eventCatOptComboId )
	{
		var catOptionName = eventCatOptComboId;
		
		var searchCounsellor = Util.findItemFromList( me.catOptionComboList, "id", eventCatOptComboId );
		if( searchCounsellor !== undefined )
		{
			catOptionName = searchCounsellor.name;
		}
		
		return catOptionName;
	};
	
	// Show / Hide an event in history of a client
	
	me.setUp_PreviousTestHeaderEvent = function( headerTag, report )
	{
		// --------------------------------------------------------------
		// Set up to Show/Hide event data in "Previous" TAB
		// --------------------------------------------------------------
		
		var imgTag = headerTag.find("img.showHide");
		
		headerTag.find("span.headerInfor").click(function(){
			
			// STEP 1. Display table of selected header
			
			var eventId = headerTag.attr("eventId");
			var tbodyTag = report.find("tbody[eventId='" + eventId + "']");
			var closed = imgTag.hasClass("arrowRightImg");
			tbodyTag.removeClass("separateTb");
			
			// STEP 2. Hide all event data, not hide headers
			
			report.find("tr:not([header])").hide();
			
			var allHeaderTags = report.find("tbody tr[header]");
			allHeaderTags.find("img.showHide").attr( "src", "../images/tab_right.png" );
			allHeaderTags.find("img.showHide").addClass('arrowRightImg');
			allHeaderTags.find("img.showHide").removeClass('arrowDownImg');
			
			// STEP 3. Open the selected event
			
			if( closed )
			{
				imgTag.attr( "src", "../images/down.gif" );
				imgTag.addClass('arrowDownImg');
				imgTag.removeClass('arrowRightImg');
				tbodyTag.find("tr").show("fast");
			}
			else
			{
				tbodyTag.find("tr:not([header])").hide("fast");
				tbodyTag.addClass("separateTb");
			}
			
		});

	};
	
	
	// Generate 'Client CUIC' value
	
	me.generateClientCUIC = function()
	{
		var clientCUIC = "";
		
		// Year(YY) Month(MM) DistrictOfBirth(DB) FirstName(2 Chars) LastName(2 Chars) BirthOrder(2 Chars)
		
		var dateOfBirth = Element.addClientFormTabTag.find("[attribute='" + MetaDataID.attr_DoB + "']").val();
		var districtOfBirth = Element.addClientFormTabTag.find("[attribute='" + MetaDataID.attr_DistrictOB + "']").val();
		var firstName = Element.addClientFormTabTag.find("[attribute='" + MetaDataID.attr_FirstName + "']").val().toUpperCase();
		var lastName = Element.addClientFormTabTag.find("[attribute='" + MetaDataID.attr_LastName + "']").val().toUpperCase();
		var birthOrder = Element.addClientFormTabTag.find("[attribute='" + MetaDataID.attr_BirthOrder + "']").val();
		
		// Remove white space and ' from firstName and lastName
		
		firstName = firstName.split(" ").join("");
		firstName = firstName.split("'").join("");
		var firstCharsFirstName = ( firstName.length >= 2 ) ? firstName.substring(0, 2) : firstName;
		
		lastName = lastName.split(" ").join("");
		lastName = lastName.split("'").join("");
		var firstCharsLastName = ( lastName.length >= 2 ) ? lastName.substring(0, 2) : lastName;
		
		
		if( dateOfBirth != "" && districtOfBirth != "" &&  firstName != "" && lastName != "" && birthOrder != "" )
		{
			clientCUIC = dateOfBirth.substring(9, 12) + Util.MONTH_INDEXES[dateOfBirth.substring(3, 6)] + districtOfBirth.substring(0, 2).toUpperCase() + firstCharsFirstName + firstCharsLastName + birthOrder;
		}
		
		Element.addClientFormTag.find("input[attribute='" + MetaDataID.attr_ClientCUIC + "']").val( clientCUIC );
	};
	
	me.populateParterCUIC = function()
	{
		var partnerCUICTag = me.getDataElementField( Element.addEventFormTag, MetaDataID.de_partnerCUIC );
		if( partnerCUICTag.val() == "" )
		{
			Commons.checkSession( function( isInSession ) 
					{
						if( isInSession ) 
						{
							$.ajax(
								{
									type: "POST"
									,url: "../event/findPartner?ouId=" + Element.orgUnitListTag.val()
									,dataType: "json"
						            ,contentType: "application/json;charset=utf-8"
						            ,beforeSend: function()
						            {
						            	var translatedText = me.translationObj.getTranslatedValueByKey( "clientEntryForm_msg_findingPartnerCUIC" );
						            	MsgManager.appBlock( translatedText );
						            }
									,success: function( response ) 
									{
										me.setUp_PartnerInfor( response );
										me.checkAndShowCheckedIconForPartnerCUICTag();
									}
									,error: function(response)
									{
										console.log(response);
									}
								}).always( function( data ) {
									MsgManager.appUnblock();
								});
						} 
						else {
							me.mainPage.settingsManagement.showExpireSessionMessage();					
						}
					});	
		}
		
		
	}
	
	// Filter councils by selected district
	me.filterCouncilsByDistrict = function()
	{
		var districtTag = me.getAttributeField( MetaDataID.attr_Address3 );
		var councilTag = me.getAttributeField( MetaDataID.attr_Address4 );
		var councilOptionsTag = councilTag.find("option");
		councilOptionsTag.hide();
		
		if( districtTag.val() != "" )
		{
			if( districtTag.val() == "11" || districtTag.val() == "12" )
			{
				councilTag.find("option[value='NA']").show();
			}
			else
			{
				councilOptionsTag.each( function(){
					var optionTag = $(this);
					var key = "LS" + districtTag.val();
					if( optionTag.val().indexOf( key ) == 0 )
					{
						optionTag.show();
					}
				});
			}
		}
	};


	// Show/Hide a tab in Add/Update Client form
	
	me.hideTabInClientForm = function( tabName )
	{
		Element.addClientFormTabTag.find("a[href='#" + tabName + "']").closest("li").hide();
		Element.addClientFormTabTag.find('#' + tabName).hide();
	};
	
	me.showTabInClientForm = function( tabName )
	{
		var tabHeader = Element.addClientFormTabTag.find("a[href='#" + tabName + "']").closest("li");
		tabHeader.show();
		Element.addClientFormTabTag.find('#' + tabName).show();
		
		var index = tabHeader.index();
		Element.addClientFormTabTag.tabs('select', index);
		
		// Move to the top of form
		window.scrollTo(0, 0);
	};
	
	me.showIconInTab = function( tabName )
	{
		var tabHeader = Element.addClientFormTabTag.find("a[href='#" + tabName + "']").closest("li");
		tabHeader.find("span.tabIcon" ).show();
	};
	
	me.hideIconInTab = function( tabName )
	{
		var tabHeader = Element.addClientFormTabTag.find("a[href='#" + tabName + "']").closest("li");
		tabHeader.find("span.tabIcon" ).hide();
	};

	me.showExpireSessionMessage = function()
	{
		Element.menuIcon.hide(); 
		Element.headerRightSideControlsTag.hide();
		MsgManager.appUnblock();
		
		var sessionExpiredText = me.translationObj.getTranslatedValueByKey( "session_msg_expired" );
		var loginAgainText = me.translationObj.getTranslatedValueByKey( "session_msg_loginAgain" );
		var hereText = me.translationObj.getTranslatedValueByKey( "session_msg_here" ); 
		var sessionExpiredText = Element.divSessionExpireMsgTag.show().html( sessionExpiredText + ". " + loginAgainText + " <a style=\"cursor:pointer;\" onclick='window.location.href=\"../index.html\"'>" + hereText + "</a>.");
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// RUN Init methods
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init();
}

