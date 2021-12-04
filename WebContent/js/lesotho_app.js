
function lesothoApp( baseUrl, exeFunc )
{
	var me = this;
	me.exeFunc = exeFunc;
	
	me.init = function()
	{
		MsgManager.appBlock("Loading translation...");

		var storageObj = new Storage();
		var translationObj = new Translation( baseUrl, storageObj );
		
		translationObj.getKeywordsFromStorage( function(){
			translationObj.loadProjectDetails(function(){
				translationObj.translatePage( function(){
					MsgManager.appUnblock();
					if( me.exeFunc !== undefined ) me.exeFunc( translationObj );
				});
			});
		});
	};
	
	
	// -----------------------------------------------------------------------
	// RUN Init method
	// -----------------------------------------------------------------------
	
	me.init();
}