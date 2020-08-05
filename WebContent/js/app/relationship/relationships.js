
function Relationships( )
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
	
	me.loadAllRelationshipTEIs = function( jsonRelationships, loadingMsg, exeFunc  )
	{
		me.getRelationshipTEI_IDs( jsonRelationships );
		
		var teiIdList = Object.keys( me.relationshipTEI_List );
		me.relationshipTEI_Total = teiIdList.length;
		me.relationshipTEI_Processing = 0;
		
		
		for( var i=0; i<teiIdList.length; i++ )
		{
			var teiId = teiIdList[i];
			ClientUtil.getDetails( teiId, loadingMsg, function( response ){
				me.relationshipTEI_List[response.client.trackedEntityInstance].client = response.client;
				me.relationshipTEI_List[response.client.trackedEntityInstance].events = response.events.events;

				me.relationshipTEI_Processing++;
				if( me.relationshipTEI_Processing == me.relationshipTEI_Total && exeFunc )
				{
					me.relationshipTEI_Total = 0;
					me.relationshipTEI_Processing = 0;
					
					exeFunc( me.relationshipTEI_List );
				}
			} );
		}
	}
	
	me.getRelationshipTEI_IDs = function( jsonRelationships )
	{
		for( var i=0; i<jsonRelationships.length; i++ )
		{
			me.relationshipTEI_List[ jsonRelationships[i].to.trackedEntityInstance.trackedEntityInstance ] = {
				"relationshipType" : jsonRelationships[i].relationshipName
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
	{ "type": "dataElement", "id" : "Ghs7vYIWIpi", "mandatory" : "true" },
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
	{ "type": "dataElement", "id" : "UuKat0HFjWS", "mandatory" : "true", "readOnly" : true }, 
	{ "type": "dataElement", "id" : "bCVRuaX7LwG", "mandatory" : "true" }, 
	{ "type": "dataElement", "id" : "Eis9qerhBFg", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "n8m5JoVrapA", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "QnSYmezcVi0", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "JRV6Z03Cu5H", "mandatory" : "true" }, 
	{ "type": "attribute", "id" : "UTNfpVZjHcF", "mandatory" : "true" }, 
	{ "type": "dataElement", "id" : "HcBFZsCt8Sy", "mandatory" : "true" }
];

