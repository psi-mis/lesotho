
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
	{ "type": "dataelement", "id" : "Ghs7vYIWIpi", "mandatory" : "true" },
	{ "type": "attribute", "id" : "R9Lw1uNtRuj", "mandatory" : "true", "readOnly" : true },
	{ "type": "attribute", "id" : "TBt2a4Bq0Lx", "mandatory" : "true", "readOnly" : true },
	{ "type": "attribute", "id" : "JcGai6pHG1M", "mandatory" : "true", "readOnly" : true },
	{ "type": "attribute", "id" : "eOZJ5fonziS", "mandatory" : "true", "readOnly" : true },
	{ "type": "attribute", "id" : "Rl2hRelrfur", "mandatory" : "true" },
	{ "type": "attribute", "id" : "gY1FrhX5UTn", "mandatory" : "false" },
	{ "type": "attribute", "id" : "gn35714pj4p", "mandatory" : "true", "rules" : { "maxLen" : 200 } },
	{ "type": "attribute", "id" : "qynN2cqRe71", "mandatory" : "true" },
	{ "type": "attribute", "id" : "NLNTtpbT3c5", "mandatory" : "false" }, 
	{ "type": "attribute", "id" : "jQilj6Wjweq", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "Wea8fAtYVwx", "mandatory" : "false" }, 
	{ "type": "dataelement", "id" : "UuKat0HFjWS", "mandatory" : "true", "readOnly" : true }, 
	{ "type": "dataelement", "id" : "bCVRuaX7LwG", "mandatory" : "true" }, 
	{ "type": "dataelement", "id" : "Eis9qerhBFg", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "n8m5JoVrapA", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "QnSYmezcVi0", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "JRV6Z03Cu5H", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "UTNfpVZjHcF", "mandatory" : "true" }, 
	{ "type": "dataelement", "id" : "HcBFZsCt8Sy", "mandatory" : "true" }
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
