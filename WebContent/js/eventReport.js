
function EventReport()
{
	var me = this;
	
	me.eventReportTag = $("#eventReport");
	
	me.attr_CUIC = "rw3W9pDCPb2";
	me.attr_firstName = "R9Lw1uNtRuj";
	me.attr_lastName = "TBt2a4Bq0Lx";
	me.attr_dateOfBirth = "BvsJfkddTgZ";
	me.attr_districtOfBirth = "u57uh7lHwF8";
	me.attr_ClientCUIC = "rw3W9pDCPb2";
	me.attr_birthOrder ="vTPYC9BXPNn";
	me.attr_dateMostRecentHIVTest = "PyfoYtwNGrI";
	
	me.de_indexLeadUIC = "nSr0NMql5FW";
	

	me.metaData = {};
	
	
	me.init = function()
	{
		me.eventReportTag.find("[attribute]").html("-");
		me.eventReportTag.find("[dataelement]").html("-");
		me.eventReportTag.find("[eventDate]").html("-");
		me.eventId = Util.getURLParameterByName( location.href, "eventid" );
		me.loadAndPopulateEventData();
	};
	
	// -------------------------------------------------------------------------
	// Load client list by cuic
	// -------------------------------------------------------------------------
	
	me.loadAndPopulateEventData = function()
	{		
		$.ajax(
		{
			type: "POST"
			,url: "../event/details?eventId=" + me.eventId  
			,beforeSend: function( xhr ) {
				MsgManager.appBlock("Loading ..." );
            }
			,success: function( response ) 
			{
				// Attribute OptionSet
				var psAttributes = response.metaData.programTrackedEntityAttributes;					
				for( var i in psAttributes )
				{
					var attribute = psAttributes[i].trackedEntityAttribute;
					
					me.metaData[attribute.id] = {};
					me.metaData[attribute.id].shortName = attribute.shortName;
					if( attribute.optionSet !== undefined )
					{
						var options = attribute.optionSet.options;
						for( var i in options )
						{
							var option = options[i];
							me.metaData[attribute.id][option.code] = option.name;
						}
					}
				}
					
				// Data Element OptionSet
					
				var psDEs = response.metaData.programStages[0].programStageDataElements;					
				for( var i in psDEs )
				{
					var dataElement = psDEs[i].dataElement;
					
					me.metaData[dataElement.id] = {};
					me.metaData[dataElement.id].shortName = dataElement.formName;
					if( dataElement.optionSet !== undefined )
					{
						var options = dataElement.optionSet.options;
						for( var i in options )
						{
							var option = options[i];
							me.metaData[dataElement.id][option.code] = option.name;
						}
					}
				}
				
				
				// Populate OrgUnit Information
				var ouData = response.ouInfo;
				me.eventReportTag.find("[attribute='districtName']").html( ouData.parent.name );
				me.eventReportTag.find("[attribute='councilName']").html( ouData.name );
				
				// Populate Category Option Code
				var catOptCode = response.catOptCode;
				for( var i in catOptCode )
				{
					me.eventReportTag.find("[attribute='catOptCode'][idx='" + i + "']").html( catOptCode.charAt(i) );
				}
				
				

				// Populate event data
				var dataValues = response.eventDetails.dataValues;
				
				
				// Populate [Index Lead UIC]
				var indexLeadUIC = me.getIndexLeadUIC( dataValues );
				for( var i=0; i<indexLeadUIC.length; i++ )
				{
					me.eventReportTag.find("[dataelement='" + me.de_indexLeadUIC + "'][idx='" + i + "']").html( indexLeadUIC.charAt(i) );
				}
				
				// Populate event date
				var exceptions = {
			            "UYyCL2xz8Wz": { },
			            "Ml9lBSv0iCC": { },
			            "za8zgXEjUHp": { },
			            "tUIkmIFMEDS": { },
			            "ZKWK5UIO9wp": { },
			            "sTmbmjnUhrA": { },
			            "a9x8qqtTs0J": { },
			            "hv1oAJf18cE": { },
			            "DbfyDJ04SjL": { },
			            "BqyBHC6eEFr": { },
			            "quOYwc0SOqD": { },
			            "fGSXGuPIEOy": { },
			            "omugvBULuf0": { },
			            "vOrRzjpdQC6": { },
			            "GCl3ORKj1jC": { }
			          };
				
				
				var eventDate = Util.formatDate_DisplayDate( response.eventDetails.eventDate );
				me.eventReportTag.find("[attribute='eventDate']").html( eventDate );
				
				
				for( var i in dataValues )
				{
					var deId = dataValues[i].dataElement;
					
					if( deId != me.de_indexLeadUIC )
					{
						var value = dataValues[i].value;
						
						if( exceptions[deId] != undefined )
						{
							
							if( me.metaData[deId][value] != undefined )
							{
								value = me.metaData[deId][value];
							}
							else
							{
								value = me.metaData[deId].shortName;
							}
						}
						else if( me.metaData[deId][value] != undefined )
						{
							value = me.metaData[deId][value];
						}
						
						if( value == "true"){
							value = "Yes";
						}
						else if( value == "false"){
							value = "No";
						}
						
						me.eventReportTag.find( "[dataelement='" + deId+ "']").html( value );
					}
				}
				
				// Populate client data
				me.loadAndPopulateClientData( response.eventDetails.trackedEntityInstance );
			}
			,error: function(response)
			{
				console.log(response);
			}
		});
	};
	
	me.loadAndPopulateClientData = function( clientId )
	{		
		$.ajax(
		{
			type: "POST"
			,url: "../client/details?clientId=" + clientId
			,success: function( response ) 
			{
				var attributes = response.client.attributes;
				
				// -------------------------------------------------------------
				// STEP 2. Populate client data
				
				// BirthOfDistrict
				var districtOfBirth = me.getAttributeData( attributes, me.attr_districtOfBirth );
				var districtOfBirthVal = me.metaData[me.attr_districtOfBirth][districtOfBirth];
				districtOfBirth = ( districtOfBirthVal == undefined ) ? districtOfBirth : districtOfBirthVal;
				me.eventReportTag.find("[attribute='" + me.attr_districtOfBirth + "']").html( districtOfBirth );
				
				
				// BirthOrder
				var orderOfBirth = me.getAttributeData( attributes, me.attr_birthOrder );
				var orderOfBirthVal = me.metaData[me.attr_birthOrder][orderOfBirth] ;
				orderOfBirth = ( orderOfBirthVal == undefined ) ? orderOfBirth : orderOfBirthVal;
				me.eventReportTag.find("[attribute='" + me.attr_birthOrder + "']").html( orderOfBirth );

				
				// CUIC
				var cuic = me.getAttributeData( attributes, me.attr_CUIC );
				for( var i=0; i<cuic.length; i++ )
				{
					me.eventReportTag.find("[attribute='" + me.attr_CUIC + "'][idx='" + i + "']").html( cuic.charAt(i) );
				}
				
				
				// dateOfBirth
				var dateOfBirth = Util.formatDate_LocalDisplayDate( me.getAttributeData( attributes, me.attr_dateOfBirth ) );
				me.eventReportTag.find("[attribute='" + me.attr_dateOfBirth + "']").html( dateOfBirth );
				
				// dateMostRecentHIVTest
				var dateMostRecentHIVTest = Util.formatDate_LocalDisplayDate( me.getAttributeData( attributes, me.attr_dateMostRecentHIVTest ) );
				me.eventReportTag.find("[attribute='" + me.attr_dateMostRecentHIVTest + "']").html( dateMostRecentHIVTest );
				
				
				// -------------------------------------------------------------
				// Another attribute values 
				
				var exceptions = {
		            "kdzfhXK71re": {},
		            "Fty7JMtC7mX": {},
		            "tzZCy78mWEG": {},
		            "kpMMzIM3t5I": {},
		            "gYiUqfKwktq": {},
		            "fa7lRYdWJfl": {}
				};
				
				for( var i in attributes )
				{
					var attrValue = attributes[i];
					var attrId = attrValue.attribute;
					var value = attrValue.value;
					
					if( attrId != me.attr_CUIC 
							&& attrId != me.attr_dateOfBirth
							&& attrId != me.attr_districtOfBirth
							&& attrId != me.attr_birthOrder 
							&& attrId != me.attr_dateMostRecentHIVTest && me.metaData[attrId] != undefined ) 
					{
						if( exceptions[attrId] != undefined )
						{
							if( me.metaData[attrId][value] != undefined )
							{
								value = me.metaData[attrId][value];
							}
							else
							{
								value = me.metaData[attrId].shortName;
							}
						}
						else if( me.metaData[attrId][value] != undefined )
						{
							value = me.metaData[attrId][value];
						}
						
						if( value == "true"){
							value = "Yes";
						}
						else if( value == "false"){
							value = "No";
						}
						
						me.eventReportTag.find("[attribute='" + attrValue.attribute + "']").html( value );
					}
					
				}
				
			}
			,error: function(response)
			{
				console.log(response);
			}
		}).always( function( data ) {
			MsgManager.appUnblock();
		});
	};
	
	
	// ------------------------------------------------------------------------------------------
	// Get client attribute values
	// ------------------------------------------------------------------------------------------
	
	me.getAttributeData = function( attributes, attrId )
	{
		for( var j in attributes )
		{
			var attrValue = attributes[j];
			if( attrValue.attribute == attrId ) {
				return attrValue.value;
			}
		}
		
		return "";
	};
	

	me.getIndexLeadUIC = function( dataValues )
	{
		for( var j in dataValues )
		{
			var dataValue = dataValues[j];
			if( dataValue.dataElement == me.de_indexLeadUIC ) {
				return dataValue.value;
			}
		}
		
		return "";
	};

	

	// ------------------------------------------------------------------------------------------
	// RUN init method
	// ------------------------------------------------------------------------------------------
	
	me.init();
}