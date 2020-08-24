
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
			if( clientAId == teiId )
			{
				teiId = jsonRelationships[i].to.trackedEntityInstance.trackedEntityInstance;
			}
			me.relationshipTEI_List[ teiId ] = {
				"relationshipType" : jsonRelationships[i].relationshipName,
				"created": jsonRelationships[i].created
			};
			
		}
		
	}

	
	
	// -----------------------------------------------------------------------
	// Run init method
	
	me.init();
}


// -------------------------------------------------------------------------------------------
// Static variables and methods
 
Relationships.addRelationShipFormIds = [
	{ "type": "dataelement", "id" : MetaDataID.de_RelationshipType, "rules" : { "mandatory" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_FirstName, "rules" :{ "mandatory" : true, "readOnly" : true, "notallowspecialchars" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_LastName, "rules" :{ "mandatory" : true, "readOnly" : true, "notallowspecialchars" : true } },
	{ "type": "attribute", "id" : MetaDataID.attr_Sex, "rules" :{ "mandatory" : true, "readOnly" : true }  },
	{ "type": "attribute", "id" : MetaDataID.attr_Age, "rules" :{ "mandatory" : true, "readOnly" : true }  },
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

Relationships.genrateRelationshipJson = function( clientAId, clientBId, relationshipTypeId, relationshipName )
{
	return {
	  "relationshipType": relationshipTypeId,
	  "relationshipName": relationshipName,
	  "created" : Util.getCurrentDate(),
	  "from": {
	    "trackedEntityInstance": {
	      "trackedEntityInstance": clientAId
	    }
	  },
	  "to": {
	    "trackedEntityInstance": {
	      "trackedEntityInstance": clientBId
	    }
	  }
	}
	
}
