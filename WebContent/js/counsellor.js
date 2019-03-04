
// ---------------------------------------------------------------------------------------- 
// CLEARABLE INPUT
// ----------------------------------------------------------------------------------------

/**
 * @param storageObj
 * @param translationObj
 */

function Counsellor( storageObj, translationObj )
{
	var me = this;
	me.storageObj = storageObj;
	me.translationObj = translationObj;
	me.validationObj;

	me.settingsManagement;
	me.listManagement;
	me.clientFormManagement;
	me.reportManagement;
	me.searchClientManagement;
	me.programSection;
	
	me.dateFormat = "dd M yy";
	me.dateTimeFormat = "YYYY-MM-DD HH:mm";

	// [Menu] links
	me.todayCaseLinkTag = $("#todayCaseLink");
	me.previousCaseLinkTag = $("#previousCaseLink");
	me.positiveCaseLinkTag = $("#positiveCaseLink");
	me.searchClientLinkTag = $("#searchClientLink");
	me.aboutLinkTag = $("#aboutLink");
	me.settingsLinkTag = $("#settingsLink");
	me.consumablesLinkTag = $("#consumablesLink");
	me.reportLinkTag = $("#reportLink");
	
	// [Today] list	
	me.registerClientBtnTag = $("#registerClientBtn");
	
	// [Client Registration] form	
	me.moveToSettingLinkTag = $("#moveToSettingLink");
	
	
	// [Consumables]
	me.consumablesDivTag = $("#consumablesDiv");
	
	me.currentList = "";	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// Init methods
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init = function()
	{
		MsgManager.initialSetup();
		
		me.validationObj = new Validation( me.translationObj );	
		me.setUp_Events();
		
		me.settingsManagement = new SettingsManagement( me, function( metaData ){
			
			var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_loadingData" );
    		MsgManager.appBlock( tranlatedText + " ..." ); 
    		
			me.clientFormManagement = new ClientFormManagement( me, metaData, Commons.APPPAGE_COUNSELLOR );
			me.searchClientManagement = new SearchClientManagement( me, metaData, Commons.APPPAGE_COUNSELLOR );
			me.listManagement = new CounsellorListMaganement( me );
			me.reportManagement = new CounsellorReportManagement( me );
			me.programSection = new ProgramSection( me, metaData, me.translationObj );
			me.checkAndLoadDataAfterInit();
		} );
		
		
		// Init sesstion clock
		var sessionTimeOutPicker = new SessionTimeOutPicker( me );
		sessionTimeOutPicker.checkAndExtendSessionTimeOut();
		
		// Check Internet connectivity if it is loss. 
		// Run every 10 seconds
		setInterval(function() {
			
			Commons.ping( function( online ){
				if( !online )
				{
					var internetConnectivityLoss = me.translationObj.getTranslatedValueByKey( "session_msg_internetConnectivityLoss" );
					alert( internetConnectivityLoss );
				}
			});			
		}, 10000);
		
		
	}
	
	// Set current page
	me.setCurrentPage = function( pageName )
	{
		me.currentList = pageName;
	}
	
	
	// ----------------------------------------------------------------------------
	// Set up Events
	// ----------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{
		me.setup_ButtonsOnBrowser();
		
		me.setUp_Events_Menus();
	};

	// Add Events for [Menu]
	
	me.setUp_Events_Menus = function()
	{
		me.todayCaseLinkTag.click(function(e){
			console.log("todayCaseLinkTag");
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.listManagement.listTodayCases();
			});
		});
		
		me.previousCaseLinkTag.click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.listManagement.listPreviousCases();
			});
		});
		
		me.positiveCaseLinkTag.click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.listManagement.listPositiveCases();
			});
		});
		
		me.searchClientLinkTag.click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				Util.resetPageDisplay();

				me.storageObj.removeItem("clientId");
				me.storageObj.removeItem("eventId");
				
				me.searchClientManagement.resetSearchClientForm();
				me.searchClientManagement.showSearchClientForm();
			});
		});
		
		me.settingsLinkTag.click(function(){
			me.storageObj.addItem("page", me.settingsManagement.PAGE_SETTINGS);
			Util.resetPageDisplay();
			me.settingsManagement.settingsDivTag.show("fast");
			$('.overlay').click();
		});
		
		me.aboutLinkTag.click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.storageObj.addItem("page", me.settingsManagement.PAGE_ABOUT);
				Util.resetPageDisplay();
				me.settingsManagement.aboutDivTag.show("fast");
			});
		});
		
		me.moveToSettingLinkTag.click(function(){
			Util.resetPageDisplay();
			me.settingsManagement.settingsDivTag.show("fast");
			$('.overlay').click();
		});
		
		me.consumablesLinkTag.click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.storageObj.addItem("page", me.settingsManagement.PAGE_COMSUMABLES);
				Util.resetPageDisplay();
				me.consumablesDivTag.show("fast");
			});
		});
		
		me.reportLinkTag .click(function(){
			$('.overlay').click();
			
			me.settingsManagement.checkOrgunitSetting( function(){
				me.storageObj.addItem("page", me.settingsManagement.PAGE_REPORT_PARAM);
				Util.resetPageDisplay();
				me.reportManagement.getReport();
			});
		});
		
	};


	// Not allow user to click on Back buttons of browser
	me.setup_ButtonsOnBrowser = function()
	{
		window.onbeforeunload = function (e) {
		    var e = e || window.event;

		    var msg = me.translationObj.getTranslatedValueByKey( "common_msg_leavePage" );
			
		    // For IE and Firefox
		    if (e) {
		        e.returnValue = msg;
		    }

		    // For Safari / chrome
		    return msg;
		 };
		
		/* window.onload = function () {
		    if (typeof history.pushState === "function") {
		        history.pushState("jibberish", null, null);
		        window.onpopstate = function () {
		            history.pushState('newjibberish', null, null);
		            // Handle the back (or forward) buttons here
		            // Will NOT handle refresh, use onbeforeunload for this.
		        };
		    }
		    else {
		        var ignoreHashChange = true;
		        window.onhashchange = function () {
		            if (!ignoreHashChange) {
		                ignoreHashChange = true;
		                window.location.hash = Math.random();
		                // Detect and redirect change here
		                // Works in older FF and IE9
		                // * it does mess with your hash symbol (anchor?) pound sign
		                // delimiter on the end of the URL
		            }
		            else {
		                ignoreHashChange = false;   
		            }
		        };
		    } 
		} */
	};
	
	// ----------------------------------------------------------------------------
	// Load the working page if the browser is refresh
	// ----------------------------------------------------------------------------
	
	me.loadPageWithParam = function()
	{
		MsgManager.appUnblock();
		
		var page = me.storageObj.getItem( "page" );
		var subPage = me.storageObj.getItem( "subPage" );
		
		if( page == me.settingsManagement.PAGE_TODAY_LIST )
		{
			var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_loadingData" );
    		MsgManager.appBlock( tranlatedText + " ..." ); 
    		
			me.listManagement.listTodayCases( function(){
				me.loadSearchSubPage( me.listManagement.todayCaseTblTag, subPage );
			});
		}
		else if( page == me.settingsManagement.PAGE_PREVIOUS_LIST )
		{
			me.listManagement.listPreviousCases( function(){
				me.loadSearchSubPage( me.listManagement.previousCaseTblTag, subPage );
			});
		}
		else if( page == me.settingsManagement.PAGE_POSITIVE_LIST )
		{
			me.listManagement.listPositiveCases( function(){
				me.loadSearchSubPage( me.listManagement.positiveCaseTblTag, subPage );
			});
		}
		else if( page == me.settingsManagement.PAGE_SEARCH_PARAM )
		{
			me.searchClientManagement.showSearchClientForm();
		}
		else if( page == me.settingsManagement.PAGE_SEARCH_CLIENT_RESULT )
		{
			me.loadSearchSubPage( me.searchResultTbTag, subPage );			
		}
		else if( page == me.settingsManagement.PAGE_COMSUMABLES )
		{
			me.consumablesDivTag.show("fast");
		}
		else if( page == me.settingsManagement.PAGE_REPORT_PARAM )
		{
			me.reportManagement.getReport();
		}
		else if( page == me.settingsManagement.PAGE_SETTINGS )
		{
			me.settingsManagement.settingsDivTag.show("fast");
		}
		else if( page == me.settingsManagement.PAGE_ABOUT )
		{
			me.settingsManagement.aboutDivTag.show("fast");
		}
		else
		{
			me.listManagement.listTodayCases(function(){
				me.loadSearchSubPage( me.todayCaseTblTag, subPage );
			});
		}
		
	};
	
	me.loadSearchSubPage = function( tableTag, subPage )
	{
		if( subPage ==  me.settingsManagement.PAGE_SEARCH_ADD_CLIENT || subPage == me.settingsManagement.PAGE_SEARCH_EDIT_CLIENT )
		{
			// If [Client Form] was called from a list ( Today list, Previous list, Positive list ),
			// look for the row in table list with the clientId and eventId to call [Click] event of the row
			if( me.storageObj.getItem("param" ) == "" )
			{
				var clientId = me.storageObj.getItem( "clientId" );
				var eventId = me.storageObj.getItem( "eventId" );
				
				var rowTag = tableTag.find("tr[clientId='" + clientId + "'][eventId='" + eventId + "']");
				rowTag.click();
			}
			else
			{
				var clientSearch = JSON.parse( me.storageObj.getItem("param" ) ).attributes;
				
				// STEP 1. Populate data in "Search" form
				
				for( var i in clientSearch )
				{
					var attributeId = clientSearch[i].attribute;
					var value = clientSearch[i].value;
					var field = me.searchClientManagement.searchClientFormTag.find("[attribute='" + attributeId + "']");
	
					if( field.attr("isDate") == "true" )
					{
						value = Util.formatDate_LocalDisplayDate( value );
					}
					field.val(value);
				}
				
				// STEP 2. Search clients by criteria
				
				me.searchClientManagement.runSearchClients( function(){
	
					if( subPage == me.settingsManagement.PAGE_SEARCH_EDIT_CLIENT )
					{
						var clientId = me.storageObj.getItem( "clientId" );
						var eventId = me.storageObj.getItem( "eventId" );
						
						// STEP 3.1. Show "Edit Client" form
						me.clientFormManagement.loadClientDetails( clientId, eventId );
						
					}
					else if( subPage == me.settingsManagement.PAGE_SEARCH_ADD_CLIENT )
					{
						// STEP 3.2. Show "Add Client" form
						me.clientFormManagement.showAddClientForm();
					}
					
				});
			}
		}
	};
	

	// Populate data and Setup events for components in HTML page
	
	me.checkAndLoadDataAfterInit = function( metaData )
	{
		var page = me.storageObj.getItem( "page" );
		if( page == "" )
		{
			me.listManagement.listTodayCases();
		}
		else
		{
			me.loadPageWithParam();
		}
	};
	
	
	// ---------------------------------------------------------------------------------------------------------------------------
	// RUN Init methods
	// ---------------------------------------------------------------------------------------------------------------------------
	
	me.init();
	
}

