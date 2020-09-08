
function ClientUtil() {}

ClientUtil.SEARCH_STATUS_CLIENT = "searchClient";
ClientUtil.SEARCH_STATUS_RELATIONSHIP = "searchRelationship";
ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;


// --------------------------------------------------------------------------------
// For main client
//---------------------------------------------------------------------------------

ClientUtil.setSearchClientStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_CLIENT;

	Element.clientSearchBtnDivTag.show();
	Element.searchResultTbTag.show();

	Element.backToClientFormBtnTag.hide();
	Element.relationshipSearchBtnDivTag.hide();
	Element.searchResultRelationshipTbTag.hide();
	
}

ClientUtil.isSearchClientStatus = function()
{
	return ( ClientUtil.searchStatus == ClientUtil.SEARCH_STATUS_CLIENT );
}


ClientUtil.getSearchResultTag = function()
{
	return ( ClientUtil.isSearchClientStatus() ) ? Element.searchResultTbTag : Element.searchResultRelationshipTbTag ;
}

//--------------------------------------------------------------------------------
// For relationship client
//---------------------------------------------------------------------------------

ClientUtil.setSearchRelationshipStatus = function()
{
	ClientUtil.searchStatus = ClientUtil.SEARCH_STATUS_RELATIONSHIP;
	
	Element.clientSearchBtnDivTag.hide();
	Element.searchResultTbTag.hide();

	Element.backToClientFormBtnTag.show();
	Element.relationshipSearchBtnDivTag.show();
	Element.searchResultRelationshipTbTag.show();
}


//--------------------------------------------------------------------------------
// Get client details
//---------------------------------------------------------------------------------

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


//---------------------------------------------------------------------------------
// Retrieve ACTIVE enrollment, Latest enrollent, latest event
//---------------------------------------------------------------------------------

ClientUtil.getActiveEnrollment = function( enrollments  )
{
	if( enrollments != undefined && enrollments.length > 0 )
	{
		return Util.findItemFromList( enrollments, "status", "ACTIVE" );
	
	}
	
	return undefined;
	
}


ClientUtil.getLatestEnrollment = function( enrollments  )
{
	if( enrollments != undefined && enrollments.length > 0 )
	{
		var foundItem = Util.findItemFromList( enrollments );
	
		if( foundItem ) return foundItem;
		
		var orderedEnrollments = Util.sortDescByKey( enrollments, "enrollmentDate" );
		return orderedEnrollments[0];
	}
	
	return undefined;
	
}


ClientUtil.getLatestEventByEnrollments = function( enrollments, stageId )
{
	var enrollment = ClientUtil.getLatestEnrollment( enrollments );
	
	if( enrollment && enrollment.events )
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
				return;
			}
		}
	}
	
}




//---------------------------------------------------------------------------------
// Resolve metadata
//---------------------------------------------------------------------------------

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


ClientUtil.getRelationshipTypeList = function( metaData )
{
	var relationshipTypeList = {};
	
	var relationshipTypes = metaData.relationshipTypes;
	for( var i=0; i<relationshipTypes.length; i++ )
	{
		var relationshipType = relationshipTypes[i];
		relationshipTypeList[relationshipType.id] = relationshipType;
	}
	
	return relationshipTypeList;
};



