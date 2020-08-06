 
function Element() { }

// ----------------------------------------------------------------------------------
// Client Form
//----------------------------------------------------------------------------------

// [Client Registration] form	
Element.addNewClientBtnTag = $("#addNewClientBtn");
Element.addClientFormTabTag = $("#addClientFormTab");
Element.addClientFormDivTag = $("#addClientFormDiv");
Element.clientAttributeDivTag = $("#clientAttributeDiv");
Element.addClientFormTag = $("#addClientForm");
Element.saveClientRegBtnTag = $("#saveClientRegBtn");
Element.discardClientRegFormBtnTag = $("#discardClientRegFormBtn");
Element.selectOrgUnitWarningMsgTag = $("#selectOrgUnitWarningMsg");

Element.backToCaseListBtnTag = $("[name='backToCaseListBtn']");


// [Contact Log] data Entry form
Element.addContactLogEventDivTag = $("#addContactLogEventDiv");
Element.addContactLogEventFormTag = $("#addContactLogEventForm");
Element.contactLogFormTag  = $("#contactLogForm");
Element.discardContactLogBtnTag = $("#discardContactLogBtn");
Element.saveContactLogBtnTag = $("#saveContactLogBtn");
Element.attrContactLogEventFormTag = $("#attrContactLogEventForm");

Element.nextContactLogActionTbTag = $("#nextContactLogActionTb");

Element.addContactLogEventBtnTag = $("#addContactLogEventBtn");
Element.discardContactLogEventBtnTag = $("#discardContactLogEventBtn");
Element.saveContactLogEventBtnTag = $("#saveContactLogEventBtn");
Element.contactLogEventFormTag = $("#contactLogEventForm");
Element.contactLogEventHistoryTbTag = $("#contactLogEventHistoryTb");


// [ART Refer. Open] Data entry form

Element.artLinkageStatusLableTag = $("#artLinkageStatus");
Element.artReferOpenFormTag = $("#artReferOpenForm");
Element.discardARTOpenEventBtnTag = $("#discardARTOpenEventBtn");
Element.saveARTOpenEventBtnTag = $("#saveARTOpenEventBtn");

// [ART Refer. Close] Data entry form
Element.artReferCloseFormTag = $("#artReferCloseForm");
Element.discardARTCloseEventBtnTag = $("#discardARTCloseEventBtn");
Element.saveARTCloseEventBtnTag = $("#saveARTCloseEventBtn");
Element.artEventInfoTbTag = $("#artEventInfoTb");
Element.artAttributeFormTag = $("#artAttributeForm");


// -------------------------------------------------------------------------
// [PrEP Refer. Open] Data entry form

Element.prepReferLinkageStatusLableTag = $("#prepReferLinkageStatus");
Element.prepReferEventInfoTbTag = $("#prepReferEventInfoTb");
   
// [PrEP Refer. Open] Data entry form
Element.prepReferOpenFormTag = $("#prepReferOpenForm");
Element.discardPrepReferOpenEventBtnTag = $("#discardPrepReferOpenEventBtn");
Element.savePrepReferOpenEventBtnTag = $("#savePrepReferOpenEventBtn");


// [PrEP Refer. Close] Data entry form
Element.prepReferCloseFormTag = $("#prepReferCloseForm");
Element.discardPrepReferCloseEventBtnTag = $("#discardPrepReferCloseEventBtn");
Element.savePrepReferCloseEventBtnTag = $("#savePrepReferCloseEventBtn");
Element.prepReferAttributeFormTag = $("#prepReferAttributeForm");


// -------------------------------------------------------------------------
// [This Test] form

Element.addEventFormTag = $("#addEventForm");
Element.previousTestsTag = $("#previousTests");
Element.thisTestDivTag = $("#thisTestDiv");
Element.addClientAttrEventFormTag = $("#addClientAttrEventForm");

Element.discardEventFormBtnTag = $("#discardEventFormBtn");
Element.saveEventBtnTag = $("#saveEventBtn");
Element.completedEventBtnTag = $("#completedEventBtn");	
Element.cancelEventBtnTag = $("#cancelEventBtn");
Element.updateClientBtnTag = $("[name='updateClientBtn']");
Element.hideHIVTestLogicActionTag = $("#hideHIVTestLogicAction");

Element.showEventSaveOptionDiaglogBtnTag = $("#showEventSaveOptionDiaglogBtn");
Element.saveEventDialogFormTag = $("#saveEventDialogForm");

// -------------------------------------------------------------------------
// [Indexing] Tab

Element.indexingDivTag = $("#indexingDiv");
Element.indexingListTbTag = $("#indexingListTb");
Element.addRelationshipBtnTag = $("#addRelationship");
Element.addRelationshipFormDivTag = $("#addRelationshipFormDiv");

Element.saveRelationshipBtnTag = $("#saveRelationshipBtn");
Element.cancelRelationshipBtnTag = $("#cancelRelationshipBtn");


// -------------------------------------------------------------------------
// [Settings]
Element.orgUnitListTag =  $("#orgUnitList");


// -------------------------------------------------------------------------
// [About]
Element.userFullNameTag = $("[name='userFullName']");


// -------------------------------------------------------------------------
// [Common]
Element.divSessionExpireMsgTag =  $( "#divSessionExpireMsg" );
Element.menuIcon = $("button.hamburger");
Element.headerRightSideControlsTag = $("div.headerRightSideControls");



//-------------------------------------------------------------------------
//[Common]
//-------------------------------------------------------------------------


// Search Form	
Element.searchClientFormTag = $("#searchClientForm");
Element.searchClientBtnTag = $("#searchClientBtn");
Element.searchResultTag = $("#searchResult");
Element.searchResultTbTag = $("#searchResultTb");
Element.searchResultKeyTag = $("#searchResultKey");
Element.searchMatchResultKeyTag = $("#searchMatchResultKey");
Element.searchResultOptionsTag = $("#searchResultOptions");
Element.seachAddClientFormTag = $("#seachAddClientForm");

Element.clientSearchBtnDivTag = $("#clientSearchBtnDiv");
Element.backToSearchClientResultBtnTag = $("[name=backToSearchClientResultBtn]");
Element.searchResultHeaderTag = $("#searchResultHeader");
Element.showAddNewClientFormTag = $("#showAddNewClientForm");
Element.backToSearchClientFormTag = $("#backToSearchClientForm");
Element.showTodayCaseTag = $("#showTodayCase");


//For relationship

Element.relationshipSearchBtnDivTag = $("#relationshipSearchBtnDiv");
Element.showAddNewRelationClientFormBtnTag = $("#showAddNewRelationClientFormBtn");
Element.backToSearchRelationshipResultBtnTag = $("#backToSearchRelationshipResultBtn");
Element.backToClientFormBtnTag = $("[name='backToClientFormBtn']");

Element.addRelationshipFormDivTag = $("#addRelationshipFormDiv");


// ----------------------------------------------------------------------------
// Setting page
//----------------------------------------------------------------------------

// [APP Header]
Element.headerOrgUnitTag = $("#headerOrgUnit");
Element.headerSettingsLinkTag = $("#headerSettingsLink");

// [Settings]
Element.settingsDivTag = $("#settingsDiv");
Element.districtListTag =  $("#districtList");
Element.orgUnitListTag =  $("#orgUnitList");
Element.loadingOuListImgTag = $("#loadingOuListImg");
Element.updateTransBtnTag = $("#updateTransBtn");
Element.hideHIVTestLogicActionTag = $("#hideHIVTestLogicAction");

// [About]
Element.userFullNameTag = $("[name='userFullName']");
Element.dhisServerTag = $("#dhisServer");
Element.aboutDivTag = $("#aboutDiv");
Element.versionTag = $("#version");
Element.versionTag = $("#version");
Element.versionDateTag = $("#versionDate");

// [Common]
Element.divSessionExpireMsgTag =  $("#divSessionExpireMsg");
Element.menuIcon = $("button.hamburger");
Element.headerRightSideControlsTag = $("div.headerRightSideControls");
Element.mainContentTags = $("div.mainContent");

// [Program Section]
Element.setupProgamSectionBtnTag = $("#setupProgamSectionBtn");

// -----------------------------------------------------------------------------------
// Counselling Main Page
//-----------------------------------------------------------------------------------


// [Menu] links
Element.todayCaseLinkTag = $("#todayCaseLink");
Element.previousCaseLinkTag = $("#previousCaseLink");
Element.positiveCaseLinkTag = $("#positiveCaseLink");
Element.searchClientLinkTag = $("#searchClientLink");
Element.aboutLinkTag = $("#aboutLink");
Element.settingsLinkTag = $("#settingsLink");
Element.consumablesLinkTag = $("#consumablesLink");
Element.reportLinkTag = $("#reportLink");

// [Today] list	
Element.registerClientBtnTag = $("#registerClientBtn");

// [Client Registration] form	
Element.moveToSettingLinkTag = $("#moveToSettingLink");


// [Consumables]
Element.consumablesDivTag = $("#consumablesDiv");



//-----------------------------------------------------------------------------------
// [Report] Page
//-----------------------------------------------------------------------------------

Element.reportParamDivTag = $("#reportParamDiv");
Element.reportTblTag = $("#reportTbl");
Element.analyticTimeTag = $("#analyticTime");
