
function Relationships()
{
	var me = this;
	
	me.relationshipTEI_Total = 0;
	me.relationshipTEI_Processing = 0;
	me.relationshipTEI_List = {};
	
	me.init = function()
	{
		
	}

	
	// -----------------------------------------------------------------------
	// 
	
	me.loadAllRelationshipTEIs = function( loadedClientDataList, clientAId, jsonRelationships, loadingMsg, exeFunc  )
	{
		me.relationshipTEI_Total = 0;
		me.relationshipTEI_Processing = 0;
		me.relationshipTEI_List = {};
		
		me.getRelationshipTEI_IDs( clientAId, jsonRelationships );
		
		var teiIdList = Object.keys( me.relationshipTEI_List );
		me.relationshipTEI_Total = teiIdList.length;
		me.relationshipTEI_Processing = 0;
		
		
		for( var i=0; i<teiIdList.length; i++ )
		{
			var teiId = teiIdList[i];
			
			if( loadedClientDataList[teiId] == undefined )
			{
				ClientUtil.getDetails( teiId, loadingMsg, function( response ){
					me.afterLoadedRelationship( response, exeFunc );
				} );
			}
			else
			{
				me.afterLoadedRelationship( loadedClientDataList[teiId], exeFunc );
			}
			
		}
	}
	
	me.afterLoadedRelationship = function( clientData, exeFunc )
	{
		// I have to assigned one by one properties ( "client", "enrollments" of client because 
		// in "relationshipTEI_List[index]", there are some more properties ( "created", "relationshipType" )
		me.relationshipTEI_List[clientData.client.trackedEntityInstance].client = clientData.client;
		me.relationshipTEI_List[clientData.client.trackedEntityInstance].enrollments = clientData.enrollments;

		me.relationshipTEI_Processing++;
		if( me.relationshipTEI_Processing == me.relationshipTEI_Total && exeFunc )
		{
			me.relationshipTEI_Total = 0;
			me.relationshipTEI_Processing = 0;
			
			exeFunc( me.relationshipTEI_List );
		}
	}
	
	me.getRelationshipTEI_IDs = function( clientAId, jsonRelationships )
	{
		for( var i=0; i<jsonRelationships.length; i++ )
		{
			var teiId = jsonRelationships[i].from.trackedEntityInstance.trackedEntityInstance;
			var from = true;
			if( clientAId == teiId )
			{
				teiId = jsonRelationships[i].to.trackedEntityInstance.trackedEntityInstance;
				from = false;
			}
			me.relationshipTEI_List[ teiId ] = {
				"relationshipId" : jsonRelationships[i].relationship,
				"relationshipTypeName" : jsonRelationships[i].relationshipName,
				"relationshipTypeId" : jsonRelationships[i].relationshipType,
				"isFrom" : from,
				"created": jsonRelationships[i].created
			};
			
		}
		
	}

	me.deleteRelationship = function( relationshipId, loadingMsg, exeFunc  )
	{
		$.ajax( 
			{
				type: "POST"
				,url: "../client/deleteRelationship?relationshipId=" + relationshipId
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
					if( exeFunc !== undefined ) exeFunc( response );
				}
			}).always( function( data ) {
				MsgManager.appUnblock();
			});
	}
	
	// -----------------------------------------------------------------------
	// Run init method
	
	me.init();
}


// -------------------------------------------------------------------------------------------
// Static variables and methods
 

Relationships.addRelationShipFormIds = [
	{ "type": "dataelement", "id" : MetaDataID.de_RelationshipType, "rules" : { "mandatory" : true } },
	{ "type": "relationshipType", "id" : MetaDataID.reType_ParentChild, "rules" : { "mandatory" : true } },
	{ "type": "relationshipType", "id" : MetaDataID.reType_SexParner, "rules" : { "mandatory" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_FirstName, "rules" :{ "mandatory" : true, "readOnly" : true, "notallowspecialchars" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_LastName, "rules" :{ "mandatory" : true, "readOnly" : true, "notallowspecialchars" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_Sex, "rules" :{ "mandatory" : true, "readOnly" : true }  },
	{ "type": "attribute", "id" : MetaDataID.attr_DoB, "rules" :{ "mandatory" : true, "readOnly" : true }  },
	{ "type": "attribute", "id" : MetaDataID.attr_ContactDetails_phoneNumber, "rules" : { "mandatory" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_Address1, "rules" : { "mandatory" : false } },
	{ "type": "attribute", "id" : MetaDataID.attr_Address2, "rules" : { "mandatory" : true, "maxLen" : 200 } },
	{ "type": "attribute", "id" : MetaDataID.attr_Address3, "rules" : { "mandatory" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_Address4, "rules" : { "mandatory" : false } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_Address5, "rules" : { "mandatory" : true } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_VillageChiefName, "rules" : { "mandatory" : false } }, 
	{ "type": "dataelement", "id" : MetaDataID.de_FinalResult_HIVStatus, "rules" : { "readOnly" : true, "mandatory" : true } }, 
	{ "type": "dataelement", "id" : MetaDataID.de_HIV_Status, "rules" : { "mandatory" : true } }, 
	{ "type": "dataelement", "id" : MetaDataID.de_Notification_Method, "rules" : { "mandatory" : true } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_IPV1, "rules" : { "mandatory" : true } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_IPV2, "rules" : { "mandatory" : true } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_IPV3, "rules" : { "mandatory" : true } }, 
	{ "type": "attribute", "id" : MetaDataID.attr_IPVOutcome, "rules" : { "mandatory" : true } }, 
	{ "type": "dataelement", "id" : MetaDataID.de_DueDate, "rules" : { "mandatory" : true } }
];

Relationships.genrateRelationshipJson = function( clientAId, clientBId, relationshipTypeId, relationshipName, relationshipOption, relationshipId )
{
	var clientFrom, clientTo;
	if( relationshipOption == "from" )
	{
		clientFrom = clientBId;
		clientTo = clientAId;
	}
	else
	{
		clientFrom = clientAId;
		clientTo = clientBId;
	}
	
	return {
	  "relationshipType": relationshipTypeId,
	  "relationshipName": relationshipName,
	  "created" : Util.getCurrentDate(),
	  "relationship" : relationshipId,
	  "from": {
	    "trackedEntityInstance": {
	      "trackedEntityInstance": clientFrom
	    }
	  },
	  "to": {
	    "trackedEntityInstance": {
	      "trackedEntityInstance": clientTo
	    }
	  }
	};
	
}
