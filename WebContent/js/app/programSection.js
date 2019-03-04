
function ProgramSection( _mainPage, _metaData, _translationObj )
{
	var me = this;
	me.mainPage = _mainPage;
	me.metaData = _metaData;
	me.translationObj = _translationObj;
	me.settingsManagement = _mainPage.settingsManagement;
	
	
	// -------------------------------------------------------------------------
	// Init methods
	// -------------------------------------------------------------------------
	
	me.init = function()
	{
		$("#setupProgramSectionForm").load("programSection.html", function(responseTxt, statusTxt, xhr){
	        if(statusTxt == "success")
	        {
	        	me.setupProgamSectionBtnTag = $("#setupProgamSectionBtn");

	        	me.setupProgramSectionDivTag = $("#setupProgramSectionDiv");
	        	me.programSectionListDivTag = $("#programSectionListDiv");
	        	me.programSectionFormTag = $("#programSectionForm");
	        	me.addNewBtnTag = $("#addNewBtn");
	        	me.backToSettingPageBtnTag = $("#backToSettingPageBtn");
	        	
	        	
	        	me.nameTag = me.setupProgramSectionDivTag.find("#name");
	        	me.codeTag = me.setupProgramSectionDivTag.find("#code");
	        	me.programTag = me.setupProgramSectionDivTag.find("#program");
	        	me.searchAvailableAttributeTag = me.setupProgramSectionDivTag.find("#searchAvailableAttribute");
	        	me.availableAttributeTag = me.setupProgramSectionDivTag.find("#availableAttribute");
	        	me.selectedAttributeTag = me.setupProgramSectionDivTag.find("#selectedAttribute");
	        	
	        	me.programSectionListDivTag = me.setupProgramSectionDivTag.find("#programSectionListDiv");
	        	
	        	me.saveBtnTag = me.setupProgramSectionDivTag.find("#setupProgamSectionBtn");
	        	me.cancelBtnTag = me.setupProgramSectionDivTag.find("#cancelProgamSectionBtn");
	        	
	        	
	        	me.setUp_Events();
	    		me.loadInitData();
	        }
	    });
		
		
	};
	
	me.loadInitData = function()
	{
		Commons.checkSession( function( isInSession ) {
			if ( isInSession ) {
				var tranlatedText = me.translationObj.getTranslatedValueByKey( "common_msg_loadingData" );
				MsgManager.appBlock( tranlatedText + " ... " );
				
				me.populateList();
				me.populateAvailableAttributes();
				
				MsgManager.appUnblock();
				
			} else {
				me.showExpireSessionMessage();					
			}
		});	
	};
	
	
	// -------------------------------------------------------------------------
	// Set up Events
	// -------------------------------------------------------------------------
	
	me.setUp_Events = function()
	{
		// Add Event for Settings [Program section]
		me.setupProgamSectionBtnTag.click(function(){
			me.settingsManagement.settingsDivTag.hide();
        	me.programSectionFormTag.hide(); 
			me.setupProgramSectionDivTag.show();
        	me.programSectionListDivTag.show("fast");
		});
		
		// Show Add/Update Attribute FORM
		me.addNewBtnTag.click( function(){
			me.setupProgramSectionDivTag.removeAttr("selectedId");
			me.programSectionFormTag.find("input,select").val("");
			me.programTag.val("KDgzpKX3h2S");
        	me.programSectionListDivTag.hide();
        	me.programSectionFormTag.show("fast"); 
		});
		
		// Back to Setting Page
    	me.backToSettingPageBtnTag.click( function(){
    		me.settingsManagement.settingsDivTag.show("fast");
			me.setupProgramSectionDivTag.hide("fast");
		});
    	
    	
    	// For Attribute Selectors
    	me.searchAvailableAttributeTag.keyup( function(){
    		var searchVal = me.searchAvailableAttributeTag.val();
			var optionTags = me.availableAttributeTag.find("option");
    		if( searchVal !="" )
    		{
    			optionTags.hide();
        		$('#availableAttribute option').filter( function ()
				{ 
        			return $(this).html().toLowerCase().indexOf(searchVal.toLowerCase())>=0;
    			}).show();
    		}
    		else
    		{
    			optionTags.show();
    		}
    	});
    	
		me.availableAttributeTag.dblclick( function(){
			var selectedOption = me.availableAttributeTag.find("option:selected");
			me.selectedAttributeTag.append( selectedOption );
		});
		
		
		me.selectedAttributeTag.dblclick( function(){
			var selectedOption = me.selectedAttributeTag.find("option:selected");
			me.availableAttributeTag.append( selectedOption );
		});
		
		
		me.saveBtnTag.click( function(){
			var sectionId = me.setupProgramSectionDivTag.attr("selectedId");
			if( sectionId !== undefined && sectionId !== "" )
			{
				me.updateProgramSection();
			}
			else
			{
				me.addProgramSection();
			}
		});
		
		me.cancelBtnTag.click( function(){
        	me.programSectionFormTag.hide(); 
			me.programSectionListDivTag.show("fast");
		});
	};
	
	
	// -------------------------------------------------------------------------
	// Populate data
	// -------------------------------------------------------------------------
	
	me.populateList = function()
	{
		var sections = me.metaData.attGroups.programSections;
		
		var tbody = me.programSectionListDivTag.find("tbody");
		tbody.find("tr").remove();
		for( var i in sections )
		{
			var section = sections[i];
			
			var rowTag = $("<tr sectionId='" + section.id + "'></tr>");
			rowTag.append("<td>" + section.name + "</td>");
			rowTag.append("<td>" + section.code + "</td>");
			rowTag.append("<td><img src='../images/edit.png' class='edit' style='cursor:pointer'> <img src='../images/delete.png' class='delete' style='cursor:pointer'></td>");
			
			me.setup_Events_RowTag( rowTag );
			
			tbody.append( rowTag );
		}
	};
	
	me.populateAvailableAttributes = function()
	{
		var attributes = me.metaData.attributes.trackedEntityAttributes;
		
		me.availableAttributeTag.find("option").remove();
		for( var i in attributes )
		{
			me.availableAttributeTag.append("<option value='" + attributes[i].id + "'>" + attributes[i].name + "</option>");
		}
	};
	
	
	me.setup_Events_RowTag = function( rowTag )
	{
		rowTag.find(".edit").click( function(){
			var sectionId = rowTag.attr("sectionId");
			var jsonData = Util.findItemFromList( me.metaData.attGroups.programSections, "id", sectionId );
			me.populateDataInForm( jsonData );
			
		});
		
		rowTag.find(".delete").click( function(){
			var id = rowTag.attr("sectionId");
			var name = rowTag.find("td:nth(0)").text();
			me.removeProgramSection( id, name )
		});
	};
	
	
	// -------------------------------------------------------------------------
	// Populate data in Edit Form
	// -------------------------------------------------------------------------
	
	me.populateDataInForm = function( jsonData )
	{
		me.programSectionFormTag.find("input,select").val("");
		me.programTag.val("KDgzpKX3h2S");
		me.availableAttributeTag.find("option").show();
		
		me.setupProgramSectionDivTag.attr("selectedId", jsonData.id );
		me.nameTag.val( jsonData.name );
		me.codeTag.val( jsonData.code );
		me.populateSelectedAttributes( jsonData );
		
    	me.programSectionListDivTag.hide();
    	me.programSectionFormTag.show("fast"); 
	};
	
	me.populateSelectedAttributes = function( jsonData )
	{
		var attributes = jsonData.programTrackedEntityAttribute;
		
		me.selectedAttributeTag.find("option").remove();
		for( var i in attributes )
		{
			me.selectedAttributeTag.append("<option value='" + attributes[i].id + "'>" + attributes[i].name + "</option>");
		}
	};

	// -------------------------------------------------------------------------
	// Generate JSON data
	// -------------------------------------------------------------------------
	
	me.generateJSONData = function()
	{
		var jsonData = {};
		jsonData.name = me.nameTag.val();
		jsonData.code = me.codeTag.val();
		jsonData.program = {};
		jsonData.program.id =  me.programTag.val();
		
		jsonData.attributes = [];
		var selectedOptions = me.selectedAttributeTag.find("option");
		for( var i=0;i<selectedOptions.length; i++ )
		{
			var attribute = {};
			attribute.id = $(selectedOptions[i]).val();
			attribute.name = $(selectedOptions[i]).text();
			jsonData.attributes.push( attribute );
		}
		
		jsonData.sortOrder = me.metaData.attGroups.programSections.length + 1;
		
		return jsonData;
	};

	// -------------------------------------------------------------------------
	// Add/Update/Delete data
	// -------------------------------------------------------------------------
	
	
	me.addProgramSection = function()
	{
		var jsonData = me.generateJSONData();
		$.ajax(
			{
				type: "POST"
				,url: "../metaData/addProgramSection"
				,dataType: "json"
				,data: JSON.stringify( jsonData )
	            ,contentType: "application/json;charset=utf-8"
            	,beforeSend: function( xhr ) {
            		var tranlatedText = me.translationObj.getTranslatedValueByKey( "setupProgramSection_msg_saving" );
            		MsgManager.appBlock( tranlatedText );
	            }
				,success: function( response ) 
				{
					me.saveDataAfter( jsonData, response.response.uid );
				}
				,error: function( response )
				{
					MsgManager.appUnblock();
				}
			});
	};

	me.updateProgramSection = function()
	{
		var jsonData = me.generateJSONData();
		jsonData.id = me.setupProgramSectionDivTag.attr("selectedId");
		
		$.ajax(
			{
				type: "POST"
				,url: "../metaData/updateProgramSection"
				,dataType: "json"
				,data: JSON.stringify( jsonData )
	            ,contentType: "application/json;charset=utf-8"
            	,beforeSend: function( xhr ) {
            		var tranlatedText = me.translationObj.getTranslatedValueByKey( "setupProgramSection_msg_saving" );
            		MsgManager.appBlock( tranlatedText );
	            }
				,success: function( response ) 
				{
					me.saveDataAfter( jsonData );
				}
				,error: function( response )
				{
					MsgManager.appUnblock();
				}
			});
	};
	
	me.removeProgramSection = function( id, name )
	{
		var message = me.translationObj.getTranslatedValueByKey( "setupProgramSection_msg_confirmDelete" );
		message += "\n" + name;
		
		var result = confirm( message );
		if( result )
		{
			$.ajax(
				{
					type: "POST"
					,url: "../metaData/deleteProgramSection?id=" + id 
	            	,beforeSend: function( xhr ) {
	            		var tranlatedText = me.translationObj.getTranslatedValueByKey( "setupProgramSection_msg_deleting" );
	            		MsgManager.appBlock( tranlatedText );
		            }
					,success: function( response ) 
					{
						MsgManager.appUnblock();
						Util.RemoveFromArray( me.metaData.attGroups.programSections, "id", id );
						
						// Update list
						me.populateList();
						me.mainPage.clientFormManagement.init();
					}
					,error: function( response )
					{
						MsgManager.appUnblock();
					}
				});
		}
	};
	
	me.saveDataAfter = function( jsonData, id )
	{
		// Resolve attributes in jsonData to programTrackedEntityAttribute
		jsonData.programTrackedEntityAttribute = JSON.parse( JSON.stringify( jsonData.attributes ) );
		delete jsonData["attributes"];
		
		// New case
		if( id !== undefined )
		{
			jsonData.id = id;
			me.metaData.attGroups.programSections.push( jsonData );
		}
		else // Update case
		{
			Util.findAndReplaceItemFromList( me.metaData.attGroups.programSections, "id", jsonData.id, jsonData );
		}
    	
    	// Update list
		me.populateList();
		me.mainPage.clientFormManagement.init();
		
		// Show list data
		MsgManager.appUnblock();
		me.programSectionListDivTag.show("fast");
    	me.programSectionFormTag.hide(); 
	};
	

	// -------------------------------------------------------------------------
	// RUN init
	// -------------------------------------------------------------------------
	
	me.init();
}