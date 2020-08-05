
function ClientUtil() {}

ClientUtil.SEARCH_STATUS_CLIENT = "searchClient";
ClientUtil.SEARCH_STATUS_RELATIONSHIP = "searchRelationship";
ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;

ClientUtil.setSearchClientStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;
}

ClientUtil.setSearchRelationshipStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_RELATIONSHIP;
}


ClientUtil.isSearchClientStatus = function()
{
	return ( ClientUtil.searchStatus == ClientUtil.SEARCH_STATUS_CLIENT );
}

ClientUtil.isSearchRelationshipStatus = function()
{
	return ( ClientUtil.searchStatus == ClientUtil.SEARCH_STATUS_RELATIONSHIP );
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

ClientUtil.getLatestEventByEnrollments = function( enrollments, stageId )
{
	var orderedEnrollments = Util.sortDescByKey( enrollments, "enrollmentDate" );
	for( var i=0; i<orderedEnrollments.length; i++ )
	{
		var orderedEvents = Util.sortDescByKey( orderedEnrollments[i].events, "eventDate" );
		for( var j=0; j<orderedEvents.length; j++ )
		{
			if( orderedEvents[i].programStage == stageId )
			{
				return orderedEvents[i];
			}
		}
	}
	
	return undefined;
	
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


