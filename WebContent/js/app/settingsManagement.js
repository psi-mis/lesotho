
function SettingsManagement( mainPage, _afterLoadedMetaDataFunc )
{
	var me = this;
	
	me.mainPage = mainPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	me.afterLoadedMetaDataFunc = _afterLoadedMetaDataFunc;

	me.ARTReferralOpeningStage_Name = "";
	
	
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
		Element.hideHIVTestLogicActionTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_HIDE_HIV_TEST_LOGIC_ACTION_FIELDS ) );	
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
		Element.versionTag.text( Commons.VERSION );
		Element.versionDateTag.text( Commons.VERSION_DATE );
	};	
	
	me.setUp_Events = function()
	{	
		// ------------------------------------------------------------------
		// Show [Settings] form from Header
		// ------------------------------------------------------------------
		
		Element.headerSettingsLinkTag.click(function(){
			me.storageObj.addItem("page", me.PAGE_SETTINGS);
			Util.resetPageDisplay();
			Element.settingsDivTag.show("fast");
		});

		// ------------------------------------------------------------------
		// Settings form
		// ------------------------------------------------------------------
		
		Element.districtListTag.change(function(){
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_DISTRICT, Element.districtListTag.val() );
			me.storageObj.removeItem( me.storageObj.KEY_STORAGE_ORGUNIT );
			if( Element.districtListTag.val() != "" )
			{
				var district = Element.districtListTag.val();
				if( district !== "" )
				{
					me.loadOrgUnitList();
				}
			}
			else
			{
				Element.orgUnitListTag.find("option").remove();
				me.storageObj.removeItem( me.storageObj.KEY_STORAGE_ORGUNIT );
			}
			
			me.populateOrgUnitNameInHeader();
		});
		
		Element.orgUnitListTag.change(function(){
			var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_orgUnitSaved" );
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_ORGUNIT, Element.orgUnitListTag.val() );	
			me.populateOrgUnitNameInHeader();
			MsgManager.msgAreaShow( tranlatedText, "SUCCESS");
		});
		
		Element.updateTransBtnTag.click( function(){
			var message = me.translationObj.getTranslatedValueByKey( "settings_translation_msg_loading" );
			MsgManager.appBlock( message );
			me.translationObj.loadKeywords( function(){
				me.translationObj.translatePage( function(){
					MsgManager.appUnblock();
				});
			});
		});
		
		// Add Logic for "HIV Test" in entry form
		Element.hideHIVTestLogicActionTag.change( function(){
			me.storageObj.addItem( me.storageObj.KEY_STORAGE_HIDE_HIV_TEST_LOGIC_ACTION_FIELDS, Element.hideHIVTestLogicActionTag.val() );

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
		var district = Element.districtListTag.val();
		$.ajax({
			type: "POST"
			,url: "../metaData/ouList?districtId=" + district
			,dataType: "json"
            ,contentType: "application/json;charset=utf-8" 
            ,beforeSend: function( xhr ) 
            {
            	Element.orgUnitListTag.find("option").remove();
            	Element.loadingOuListImgTag.show();
            }
			,success: function( jsonData ) 
			{
				var orgUnits = Util.sortByKey( jsonData.organisationUnits, "code" );
				
				Element.orgUnitListTag.append("<option value=''>[Please select]</option>");
				for( var i in orgUnits )
				{
					var orgUnit = orgUnits[i];
					Element.orgUnitListTag.append("<option value='" + orgUnit.id + "'>" + orgUnit.name + "</option>");
				}

				Element.orgUnitListTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_ORGUNIT ) );
				me.populateOrgUnitNameInHeader();
				
				if( exeFunc ) exeFunc();
			}
		}).always( function( data ) {
			Element.loadingOuListImgTag.hide();
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
				Element.userFullNameTag.html( jsonData.fullName );
				Element.dhisServerTag.html( jsonData.dhisServer );
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
					var attributeList = attrGroups[i].trackedEntityAttributes;
					for( var j in attributeList )
					{
						if( attributeList[j].id === MetaDataID.attr_ContactDetails_District )
						{
							me.filterDistricts = attributeList[j].optionSet.options;
							me.filterDistricts = Util.sortByKey( me.filterDistricts, "code" );
						}
						else if( attributeList[j].id === MetaDataID.attr_ContactDetails_Council )
						{
							me.filterCouncils = attributeList[j].optionSet.options;
							me.filterCouncils = Util.sortByKey( me.filterCouncils, "code" );
						}
						else if ( attributeList[j].id === MetaDataID.attr_ARTClosure_ReferralFacilityName )
						{
							me.filterHealthFacilities = attributeList[j].optionSet.options;
							me.filterHealthFacilities = Util.sortByKey( me.filterHealthFacilities, "code" );
						}
						else if( attributeList[j].id === MetaDataID.attr_ARTStatus )
						{
							me.artStatus = attributeList[j].optionSet.options;
						}
					}
				}
				
				// Get [ART Opening] stage name
				for( var i in jsonData.sections.programStages )
				{
					var stage = jsonData.sections.programStages[i];
					if( stage.id == MetaDataID.stage_ARTReferralOpenning )
					{
						me.ARTReferralOpeningStage_Name = stage.name;
					}
					
					var psDEs = stage.programStageDataElements;					
					for( var j in psDEs )
					{
						if( psDEs[j].dataElement.id === MetaDataID.de_ARTClosureLinkageOutcome )
						{
							me.closureARTStatus = psDEs[j].dataElement.optionSet.options;
						}
						else if( psDEs[j].dataElement.id === MetaDataID.de_TypeOfContact )
						{
							me.contactLogTypeName = psDEs[j].dataElement.optionSet.options;
						}
						else if( psDEs[j].dataElement.id === MetaDataID.de_NextAction )
						{
							me.nextActionName = psDEs[j].dataElement.optionSet.options;
						}
					}
				}
				
				
				// Populate orgunit list in 'Settings'
				var districts = Util.sortByKey( jsonData.districts.organisationUnits, "code" );
				Element.districtListTag.append("<option value=''>[Please select]</option>");
				for( var i in districts )
				{
					var orgUnit = districts[i];
					Element.districtListTag.append("<option value='" + orgUnit.id + "'>" + orgUnit.name + "</option>");
				}

				Element.districtListTag.val( me.storageObj.getItem( me.storageObj.KEY_STORAGE_DISTRICT ) );
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
		var ouId = Element.orgUnitListTag.val();
		if( ouId == "" || ouId === null )
		{
			var translatedText = me.translationObj.getTranslatedValueByKey( "app_headerNoOrguit" );
			Element.headerOrgUnitTag.html( "[" + translatedText + "]" );
			Element.headerOrgUnitTag.css( "color", "red" );
		}
		else
		{
			Element.headerOrgUnitTag.html( Element.orgUnitListTag.find("option:selected").text() );
			Element.headerOrgUnitTag.css( "color", "" );
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
		Element.menuIcon.hide(); 
		Element.headerRightSideControlsTag.hide();
		MsgManager.appUnblock();
		
		var sessionExpiredText = me.translationObj.getTranslatedValueByKey( "session_msg_expired" );
		var loginAgainText = me.translationObj.getTranslatedValueByKey( "session_msg_loginAgain" );
		var hereText = me.translationObj.getTranslatedValueByKey( "session_msg_here" ); 
		var sessionExpiredText = Element.divSessionExpireMsgTag.show().html( sessionExpiredText + ". " + loginAgainText + " <a style=\"cursor:pointer;\" onclick='window.location.href=\"../index.html\"'>" + hereText + "</a>.");
	};
	

	// ----------------------------------------------------------------------------
	// Check if any Org Unit is selected. If no any Org Unit is selected, 
	// the show dialog to ask user go to Settings to select an orgunit
	// ----------------------------------------------------------------------------
	
	me.checkOrgunitSetting = function( exeFunc )
	{
		var orgUnit = Element.orgUnitListTag.val();
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
