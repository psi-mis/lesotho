
function SettingsManagement( mainPage, _afterLoadedMetaDataFunc )
{
	var me = this;
	
	me.mainPage = mainPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.afterLoadedMetaDataFunc = _afterLoadedMetaDataFunc;

	// [APP Header]
	me.headerOrgUnitTag = $("#headerOrgUnit");
	me.headerSettingsLinkTag = $("#headerSettingsLink");
	
	// [Settings]
	me.settingsDivTag = $("#settingsDiv");
	me.districtListTag =  $("#districtList");
	me.orgUnitListTag =  $("#orgUnitList");
	me.loadingOuListImgTag = $("#loadingOuListImg");
	me.updateTransBtnTag = $("#updateTransBtn");
	me.hideHIVTestLogicActionTag = $("#hideHIVTestLogicAction");
	
	// [About]
	me.userFullNameTag = $("[name='userFullName']");
	me.dhisServerTag = $("#dhisServer");
	me.aboutDivTag = $("#aboutDiv");
	me.versionTag = $("#version");
	me.versionTag = $("#version");
	me.versionDateTag = $("#versionDate");
	
	// [Common]
	me.divSessionExpireMsgTag =  $("#divSessionExpireMsg");
	me.menuIcon = $("button.hamburger");
	me.headerRightSideControlsTag = $("div.headerRightSideControls");
	me.mainContentTags = $("div.mainContent");
	
	// [Program Section]
	me.setupProgamSectionBtnTag = $("#setupProgamSectionBtn");
	
	me.ARTReferralOpeningStage_Id = "OSpZnLBMVhr";
	me.ARTReferralOpeningStage_Name = "";
	me.attr_District = "qynN2cqRe71";
	me.attr_Council = "NLNTtpbT3c5";
	me.attr_HealthFacilityProvidingART = "LCLiPzJWVAb";
	me.de_ClosureART_Status = "nOK8JcDWT9X";
	

	// [Client Infor] Attributes
	me.attr_ClientCUIC = "rw3W9pDCPb2";
	me.attr_FirstName = "R9Lw1uNtRuj";
	me.attr_LastName = "TBt2a4Bq0Lx";
	me.attr_DoB = "BvsJfkddTgZ";
	me.attr_DistrictOB = "u57uh7lHwF8";
	me.attr_BirthOrder ="vTPYC9BXPNn";
	
	me.attr_HasContactLogFormInfor = "i1NpXcIwfes"; // Set this one mandatory for Contact Log
	
	// [HIV Test Final result EVENT] Attributes
	me.attr_HIVTestFinalResult = "PoTcUsGrIbS";
	me.attr_HIVEventDate = "AcpKX4a2iAx";
	me.attr_HIVEventStatus = "JAMoB6GnGyw";
	me.attr_HIVEventCatOpt = "hkf4GS79Sul";
	me.attr_HIVEventNo = "Y1pdU5TSGrB";
	me.attr_HIVEventOrgUnit = "uXg5tqrRsXJ";
	me.attr_HIVEventParnerOption = "HJQvtlJOmQm";
	me.attr_HIVEventParnerCUIC = "s192aFpfWbW";

	// [Contact Log Event] attributes
	me.attr_ContactLogEvent_LastAction = "jWl3jWdsogC";
	me.attr_ContactLogEvent_LastActionDate = "L5NZ7vuyLe7";
	me.attr_ContactLogEvent_NextAction = "kIREHjvNqNe";
	me.attr_ContactLogEvent_Usernames = "L9SC2lA8eWg";
	
	
	// [ART Opening] attributes
	me.attr_ARTStatus = "mYdfuRItatP";
	me.attr_ARTFacility = "wLGxRN9x0uW";
	me.attr_ARTEventDate = "OqrP3KFlFT1";
	
	// [ART Closure] attributes
	me.attr_ARTClosure_EventDate = "D7CpzDGAPpy";
	me.attr_ARTClosure_Usernames = "YhfhMtu82Pr";


	// [PrEP Refer. Opening] attributes
	me.attr_PrEPReferStatus = "Gt0fW3hxpek";
	me.attr_PrEPReferFacility = "Q57XfdQD146";
	me.attr_PrEPReferEventDate = "xvXK3b9PJRT";
	
	// [PrEP Refer. Closure] attributes
	me.attr_PrEPReferClosure_EventDate = "N0Dry7xDF9P";
	me.attr_PrEPReferClosure_Usernames = "neSEKfn7J76";

	
	me.de_ContactLog_TypeOfContact = "wzM3bUiPowS";
	me.de_ContactLog_nextAction = "mcgzEFh5IV8";
	
	me.metaData;
	me.filterDistricts;
	me.filterCouncils;
	me.closureARTStatus;
	me.contactLogTypeName;
	me.nextActionName;
		
	me.userInfoLoaded = false;
	me.metadataLoaded = false;
	me.orgUnitListLoaded = false;

	me.PAGE_TODAY_LIST = "todayList";
	me.PAGE_PREVIOUS_LIST = "previousList";
	me.PAGE_POSITIVE_LIST = "positiveList";
	me.PAGE_TODAY_FU_LIST = "todayFUList";
	me.PAGE_ALL_FU_LIST = "allFUList";
	me.PAGE_SEARCH_PARAM = "searchParam";
	me.PAGE_SEARCH_CLIENT_RESULT = "searchClientResult";
	me.PAGE_SEARCH_ADD_CLIENT = "searchAddClient";
	me.PAGE_SEARCH_EDIT_CLIENT = "searchEditClient";
	me.PAGE_COMSUMABLES = "Consumables";
	me.PAGE_REPORT_PARAM = "reportParam";
	me.PAGE_SETTINGS = "settings";
	me.PAGE_ABOUT = "about";

	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Init methods
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init = function()
	{
		me.hideHIVTestLogicActionTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_HIDE_HIV_TEST_LOGIC_ACTION_FIELDS ) );	
		me.setupVersion();
		me.setUp_Events();
		me.loadInitData();
	};
	
	me.loadInitData = function()
	{
		Commons.checkSession( function( isInSession ) {
			if ( isInSession ) {
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_initializing" );
				MsgManager.appBlock( tranlatedText + " ... " );
				me.loadCurrentUserInfo();
				me.loadMetadata();
			} else {
				me.showExpireSessionMessage();					
			}
		});	
	};
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Set up Events
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.setupVersion = function()
	{
		me.versionTag.text( Commons.VERSION );
		me.versionDateTag.text( Commons.VERSION_DATE );
	};	
	
	me.setUp_Events = function()
	{	
		// ------------------------------------------------------------------
		// Show [Settings] form from Header
		// ------------------------------------------------------------------
		
		me.headerSettingsLinkTag.click(function(){
			me.storageObj.addItem("page", me.PAGE_SETTINGS);
			Util.resetPageDisplay();
			me.settingsDivTag.show("fast");
		});

		// ------------------------------------------------------------------
		// Settings form
		// ------------------------------------------------------------------
		
		me.districtListTag.change(function(){
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_DISTRICT, me.districtListTag.val() );
			me.storageObj.removeItem( me.storageObj.KEY_STORAGE_ORGUNIT );
			if( me.districtListTag.val() != "" )
			{
				var district = me.districtListTag.val();
				if( district !== "" )
				{
					me.loadOrgUnitList();
				}
			}
			else
			{
				me.orgUnitListTag.find("option").remove();
				me.storageObj.removeItem( me.storageObj.KEY_STORAGE_ORGUNIT );
			}
			
			me.populateOrgUnitNameInHeader();
		});
		
		me.orgUnitListTag.change(function(){
			var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_orgUnitSaved" );
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_ORGUNIT, me.orgUnitListTag.val() );	
			me.populateOrgUnitNameInHeader();
			MsgManager.msgAreaShow( tranlatedText, "SUCCESS");
		});
		
		me.updateTransBtnTag.click( function(){
			var message = me.translationObj.getTranslatedValueByKey( "settings_translation_msg_loading" );
			MsgManager.appBlock( message );
			me.translationObj.loadKeywords( function(){
				me.translationObj.translatePage( function(){
					MsgManager.appUnblock();
				});
			});
		});
		
		// Add Logic for "HIV Test" in entry form
		me.hideHIVTestLogicActionTag.change( function(){
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_HIDE_HIV_TEST_LOGIC_ACTION_FIELDS, me.hideHIVTestLogicActionTag.val() );

			var translatedText = me.translationObj.getTranslatedValueByKey( "common_msg_settingsHideLogicActionFieldsSaved" );
			MsgManager.msgAreaShow( translatedText, "SUCCESS" );
		});
		
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Load data from server
	// ---------------------------------------------------------------------------------------------------------------------------
	
	// Load OrgUnit list
	
	me.loadOrgUnitList = function( exeFunc )
	{
		var district = me.districtListTag.val();
		$.ajax({
			type: "POST"
			,url: "../metaData/ouList?districtId=" + district
			,dataType: "json"
            ,contentType: "application/json;charset=utf-8" 
            ,beforeSend: function( xhr ) 
            {
            	me.orgUnitListTag.find("option").remove();
            	me.loadingOuListImgTag.show();
            }
			,success: function( jsonData ) 
			{
				var orgUnits = Util.sortByKey( jsonData.organisationUnits, "code" );
				
				me.orgUnitListTag.append("<option value=''>[Please select]</option>");
				for( var i in orgUnits )
				{
					var orgUnit = orgUnits[i];
					me.orgUnitListTag.append("<option value='" + orgUnit.id + "'>" + orgUnit.name + "</option>");
				}

				me.orgUnitListTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_ORGUNIT ) );
				me.populateOrgUnitNameInHeader();
				
				if( exeFunc ) exeFunc();
			}
		}).always( function( data ) {
			me.loadingOuListImgTag.hide();
			MsgManager.appUnblock();
		});
		
	};

	
	// Load user information
	
	me.loadCurrentUserInfo = function()
	{
		$.ajax({
			type: "GET"
			,url: "../login"
			,dataType: "json"
            ,contentType: "application/json;charset=utf-8"
			,success: function( jsonData ) 
			{
				me.loginUsername = jsonData.loginUsername;
				me.userFullNameTag.html( jsonData.fullName );
				me.dhisServerTag.html( jsonData.dhisServer );
				me.userInfoLoaded = true;
				me.checkAndLoadDataAfterInit();
			},
			error: function(a,b,c)
			{
				console.log("ERROR");
			}
		});
	}
	
	
	// Load sections of program, program-attributes, attribute-groups and orgUnit List
	
	me.loadMetadata = function()
	{
		$.ajax({
			type: "POST"
			,url: "../metaData/all"
			,dataType: "json"
            ,contentType: "application/json;charset=utf-8"
			,success: function( jsonData ) 
			{
				me.metaData = jsonData;
				
				// Look for option values of Districts/Councils/Health facilities for filtering
				var attrGroups = jsonData.attGroups.programSections;
				for( var i in attrGroups )
				{	
					var attributeList = attrGroups[i].programTrackedEntityAttribute;
					for( var j in attributeList )
					{
						if( attributeList[j].id === me.attr_District )
						{
							me.filterDistricts = attributeList[j].optionSet.options;
							me.filterDistricts = Util.sortByKey( me.filterDistricts, "code" );
						}
						else if( attributeList[j].id === me.attr_Council )
						{
							me.filterCouncils = attributeList[j].optionSet.options;
							me.filterCouncils = Util.sortByKey( me.filterCouncils, "code" );
						}
						else if ( attributeList[j].id === me.attr_HealthFacilityProvidingART )
						{
							me.filterHealthFacilities = attributeList[j].optionSet.options;
							me.filterHealthFacilities = Util.sortByKey( me.filterHealthFacilities, "code" );
						}
						else if( attributeList[j].id === me.attr_ARTStatus )
						{
							me.artStatus = attributeList[j].optionSet.options;
						}
					}
				}
				
				// Get [ART Opening] stage name
				for( var i in jsonData.sections.programStages )
				{
					var stage = jsonData.sections.programStages[i];
					if( stage.id == me.ARTReferralOpeningStage_Id )
					{
						me.ARTReferralOpeningStage_Name = stage.name;
					}
					
					var psDEs = stage.programStageDataElements;					
					for( var j in psDEs )
					{
						if( psDEs[j].dataElement.id === me.de_ClosureART_Status )
						{
							me.closureARTStatus = psDEs[j].dataElement.optionSet.options;
						}
						else if( psDEs[j].dataElement.id === me.de_ContactLog_TypeOfContact )
						{
							me.contactLogTypeName = psDEs[j].dataElement.optionSet.options;
						}
						else if( psDEs[j].dataElement.id === me.de_ContactLog_nextAction )
						{
							me.nextActionName = psDEs[j].dataElement.optionSet.options;
						}
					}
				}
				
				
				// Populate orgunit list in 'Settings'
				var districts = Util.sortByKey( jsonData.districts.organisationUnits, "code" );
				me.districtListTag.append("<option value=''>[Please select]</option>");
				for( var i in districts )
				{
					var orgUnit = districts[i];
					me.districtListTag.append("<option value='" + orgUnit.id + "'>" + orgUnit.name + "</option>");
				}

				me.districtListTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_DISTRICT ) );
				me.populateOrgUnitList();
				
				me.metadataLoaded = true;
				me.checkAndLoadDataAfterInit();
			},
			error: function(a,b,c)
			{
				console.log("ERROR");
			}
		});
	};
	
	
	// ----------------------------------------------------------------------------
	// Populate data
	// ----------------------------------------------------------------------------
	
	me.populateOrgUnitList = function()
	{
		me.loadOrgUnitList( function(){
			me.orgUnitListLoaded = true;
			me.checkAndLoadDataAfterInit();
		});
	};
	
	me.populateOrgUnitNameInHeader = function()
	{
		var ouId = me.orgUnitListTag.val();
		if( ouId == "" || ouId === null )
		{
			var translatedText = me.translationObj.getTranslatedValueByKey( "app_headerNoOrguit" );
			me.headerOrgUnitTag.html( "[" + translatedText + "]" );
			me.headerOrgUnitTag.css( "color", "red" );
		}
		else
		{
			me.headerOrgUnitTag.html( me.orgUnitListTag.find("option:selected").text() );
			me.headerOrgUnitTag.css( "color", "" );
		}
	};
	
	me.checkAndLoadDataAfterInit = function()
	{
		if( me.userInfoLoaded && me.metadataLoaded && me.orgUnitListLoaded )
		{
			me.afterLoadedMetaDataFunc( me.metaData );
		}
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Show expire session message
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.showExpireSessionMessage = function()
	{
		me.menuIcon.hide(); 
		me.headerRightSideControlsTag.hide();
		MsgManager.appUnblock();
		
		var sessionExpiredText = me.translationObj.getTranslatedValueByKey( "session_msg_expired" );
		var loginAgainText = me.translationObj.getTranslatedValueByKey( "session_msg_loginAgain" );
		var hereText = me.translationObj.getTranslatedValueByKey( "session_msg_here" ); 
		var sessionExpiredText = me.divSessionExpireMsgTag.show().html( sessionExpiredText + ". " + loginAgainText + " <a style=\"cursor:pointer;\" onclick='window.location.href=\"../index.html\"'>" + hereText + "</a>.");
	};
	

	// ----------------------------------------------------------------------------
	// Check if any Org Unit is selected. If no any Org Unit is selected, 
	// the show dialog to ask user go to Settings to select an orgunit
	// ----------------------------------------------------------------------------
	
	me.checkOrgunitSetting = function( exeFunc )
	{
		var orgUnit = me.orgUnitListTag.val();
		if( orgUnit == "" || orgUnit === null )
		{
			var translatedText = me.translationObj.getTranslatedValueByKey( "settings_msg_selectOrgUnit" );
			MsgManager.showDialogForm( translatedText );
		}
		else
		{
			exeFunc();
		}
		
	};

	// ===========================================================================================================================
	// RUN Init methods
	// ===========================================================================================================================
	
	me.init();
}