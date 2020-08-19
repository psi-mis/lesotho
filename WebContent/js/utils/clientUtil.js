
function ClientUtil() {}

ClientUtil.SEARCH_STATUS_CLIENT = "searchClient";
ClientUtil.SEARCH_STATUS_RELATIONSHIP = "searchRelationship";
ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;


ClientUtil.CLIENTDETAILS_MAIN_CLIENT_STATUS = "mainClient";
ClientUtil.CLIENTDETAILS_RELATIONSHIP_CLIENT_STATUS = "relationshipClient";
ClientUtil.clientRelationShip = ClientUtil.CLIENTDETAILS_MAIN_CLIENT_STATUS;

// --------------------------------------------------------------------------------
// For main client
//---------------------------------------------------------------------------------

ClientUtil.setSearchClientStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;

	
//	Element.searchClientBtnTag.show();
	Element.clientSearchBtnDivTag.show();
	Element.searchResultTbTag.show();

	Element.backToClientFormBtnTag.hide();
	Element.relationshipSearchBtnDivTag.hide();
	Element.searchResultRelationshipTbTag.hide();
	
//
//	Element.backToCaseListBtnTag.hide();
	
}

ClientUtil.isSearchClientStatus = function()
{
	return ( ClientUtil.searchStatus == ClientUtil.SEARCH_STATUS_CLIENT );
}


ClientUtil.getSearchResultTag = function()
{
	return ( ClientUtil.isSearchClientStatus() ) ? Element.searchResultTbTag : Element.searchResultRelationshipTbTag ;
}

// For [ClientForm]
ClientUtil.setMainClientFormStatus = function()
{
//	Element.backToMainClientFormBtnTag.hide();
	ClientUtil.clientRelationShip = ClientUtil.CLIENTDETAILS_MAIN_CLIENT_STATUS;
}

ClientUtil.isMainClientFormStatus = function()
{
	return ClientUtil.clientRelationShip == ClientUtil.CLIENTDETAILS_MAIN_CLIENT_STATUS;
}

//--------------------------------------------------------------------------------
//For relationship client
//---------------------------------------------------------------------------------

ClientUtil.setSearchRelationshipStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_RELATIONSHIP;
	
//	Element.backToSearchClientResultBtnTag.hide();
//	Element.searchClientBtnTag.hide();
	Element.clientSearchBtnDivTag.hide();
//	Element.backToCaseListBtnTag.hide();
	Element.searchResultTbTag.hide();

//	Element.searchRelationshipClientBtnTag.show();
	Element.backToClientFormBtnTag.show();
//	Element.backToSearchRelationshipClientResultBtnTag.show();
	Element.relationshipSearchBtnDivTag.show();
	Element.searchResultRelationshipTbTag.show();
//	
//	Element.backToCaseListBtnTag.hide();
}


ClientUtil.isSearchRelationshipStatus = function()
{
	return ( ClientUtil.searchStatus == ClientUtil.CLIENTDETAILS_RELATIONSHIP_CLIENT_STATUS );
}


ClientUtil.setRelationshipClientFormStatus = function()
{
//	Element.backToSearchClientResultBtnTag.hide();
//	Element.backToCaseListBtnTag.hide();
//	
//	Element.backToMainClientFormBtnTag.show();
	ClientUtil.clientRelationShip = ClientUtil.CLIENTDETAILS_RELATIONSHIP_CLIENT_STATUS;
}


ClientUtil.isRelationshipClientFormStatus = function()
{
	return ClientUtil.clientRelationShip == ClientUtil.CLIENTDETAILS_RELATIONSHIP_CLIENT_STATUS;
}



ClientUtil.getDetails = function( clientId, loadingMsg, exeFunc )
{
	$.ajax(
		{
			type: "POST"
			,url: "../client/details?clientId=" + clientId
            ,contentType: "application/json;charset=utf-8"
            ,beforeSend: function( xhr ) 
            {
            	MsgManager.appBlock( loadingMsg + " ..." );
            }
			,success: function( response ) 
			{		
				if( exeFunc !== undefined ) exeFunc( response );
			}
			,error: function(response)
			{
				console.log(response);
			}
		}).always( function( data ) {
			MsgManager.appUnblock();
		});
}


ClientUtil.getLatestEnrollment = function( enrollments  )
{
	if( enrollments != undefined && enrollments.length > 0 )
	{
		var foundItem = Util.findItemFromList( enrollments, "status", "ACTIVE" );
	
		if( foundItem ) return foundItem;
		
		var orderedEnrollments = Util.sortDescByKey( enrollments, "enrollmentDate" );
		return orderedEnrollments[0];
	}
	
	return undefined;
	
}


ClientUtil.getLatestEventByEnrollments = function( enrollments, stageId )
{
	var enrollment = ClientUtil.getLatestEnrollment( enrollments );
	
	if( enrollment )
	{
		// We need to sort events list becasue there are some stages are repeatable
		var orderedEvents = Util.sortDescByKey( enrollment.events, "eventDate" );
		for( var i=0; i<orderedEvents.length; i++ )
		{
			if( orderedEvents[i].programStage == stageId )
			{
				return orderedEvents[i];
			}
		}
	}
	
	return undefined;
	
}


ClientUtil.replaceLatestEventByEnrollments = function( enrollments, stageId, eventJson )
{
	var enrollment = ClientUtil.getLatestEnrollment( enrollments );
	
	if( enrollment )
	{
		// We need to sort events list becasue there are some stages are repeatable
		var orderedEvents = Util.sortDescByKey( enrollment.events, "eventDate" )
		
		for( var i=0; i<orderedEvents.length; i++ )
		{
			if( orderedEvents[i].programStage == stageId )
			{
				enrollment.events.push( eventJson );
				enrollment.events.splice(i, 1);
//				delete orderedEvents[i];	
				
				return;
			}
		}
	}
	
}




ClientUtil.getLatestEvent = function( events, stageId )
{
	var orderedEvents = Util.sortDescByKey( events, "eventDate" );
	for( var i=0; i<orderedEvents.length; i++ )
	{
		if( orderedEvents[i].programStage == stageId )
		{
			return orderedEvents[i];
		}
	}
	
	return undefined;
}


// ---------------------------------------------------------
// Resolve metadata

// { "id1" : {configuration1} }, "id2" : {configuration2} } }
ClientUtil.getDataElementList = function( metaData )
{
	var dataElementList = {};
	
	var stages = metaData.sections.programStages;
	for( var i=0; i<stages.length; i++ )
	{
		var psDeList = stages[i].programStageDataElements;
		for( var j=0; j<psDeList.length; j++ )
		{
			var psDe = psDeList[j];
			dataElementList[psDe.dataElement.id] = psDe;
		}
	}
	
	return dataElementList;
};

//{ "id1" : {configuration1} }, "id2" : {configuration2} } }
ClientUtil.getAttributeList = function( metaData )
{
	var attributeList = {};
	
	var psAttributes = metaData.programAttributes.programTrackedEntityAttributes;
	for( var i=0; i<psAttributes.length; i++ )
	{
		var psAttr = psAttributes[i];
		attributeList[psAttr.trackedEntityAttribute.id] = psAttr;
	}
	
	return attributeList;
};


