
//=====================================================================================
// Translation Utils
//=====================================================================================


function Translation( baseURL, storageObj )
{
	var me = this;	
	me.baseURL = baseURL;
	me.storageObj = storageObj;
	
	me.KEY_LANGUAGE = "lesotho_lang";
	me.KEY_VERSION = "lesotho_version";
	me.KEY_VERSION_WITH_OPTION = "lesotho_versionWithOption";
	
	me.languageSelectorTag = $("#languageSelector");

	me.translationStatusImg_loadingTag = $("#translationStatusImg_loading");
	me.translationStatusImg_checkedTag = $("#translationStatusImg_checked");
	me.translationStatusImg_downloadTag = $("#translationStatusImg_download");
	me.translationStatusImgTags = $( "img.checkingImages" );
		
	me.lang = "en";
	me.version = "";
	me.autoPush = false;

	me._TRANSLATE_STATUS_LOADING = "loading";
	me._TRANSLATE_STATUS_CHECKED = "checked";
	me._TRANSLATE_STATUS_DOWNLOAD = "download";

	
	me.translatedKeyWords = {};
	
	me.init = function()
	{
		// STEP 1. Get the language which was choice before in local storage
		var configLang = me.storageObj.getItem( me.KEY_LANGUAGE );
		if( configLang !== "" && configLang !== "null" ){
			me.lang = configLang;
		}
		me.languageSelectorTag.val( me.lang );
		
		// STEP 2. Set up events for language selector
		me.setup_Events();
		
		// STEP 3. Load keywords from storage if any
		var storedLangkey = "lang_" + me.lang;
		var translatedKeyList = me.storageObj.getItem( storedLangkey );
		if( translatedKeyList !== "" )
		{
			var storedList = JSON.parse( translatedKeyList );
			me.translatedKeyWords[me.lang] = storedList.list;
		}
	};
	
	me.setup_Events = function()
	{
		me.languageSelectorTag.change( function(event){
			event.preventDefault();
			me.lang = me.languageSelectorTag.val();
			me.translatePage();
			me.storageObj.addItem( "lesotho_lang", me.lang );
		});
		
		me.translationStatusImg_downloadTag.click( function() {

			var version = me.storageObj.getItem( me.KEY_VERSION );
			var versionFullText = me.storageObj.getItem( me.KEY_VERSION_WITH_OPTION );

			me.translateStatusImgChange( me._TRANSLATE_STATUS_LOADING, version );

			me.loadKeywords( function(){
				
				me.translateStatusImgChange( me._TRANSLATE_STATUS_CHECKED, versionFullText );
			});
		});
	};

	me.translatePage = function( exeFunc )
	{
		// If the language is not loaded already, load them.		
		if( me.translatedKeyWords[me.lang] !== undefined )
		{
			me.translate();
			if( exeFunc !== undefined ) exeFunc();
		}
		else
		{
			me.getKeywordsFromStorage( function(){
				me.translate();
				if( exeFunc !== undefined ) exeFunc();
			})
		}
	};
	
	me.translateTag = function( tag, exeFunc )
	{
		if( me.translatedKeyWords[me.lang] !== undefined )
		{
			me.covertKeywordTextAndTranslate( tag );
			if( exeFunc !== undefined ) exeFunc();
		}
		else
		{
			me.getKeywordsFromStorage( function(){
				me.covertKeywordTextAndTranslate( tag );
				if( exeFunc !== undefined ) exeFunc();
			})
		}		
	};
	

	me.translate = function( tag )
	{
		var translatedTags = $.find("[keyword]");
		if( tag !== undefined )
		{
			translatedTags = tag.find("[keyword]");
		}
		
		for( var i in translatedTags ){
			var key = $(translatedTags[i]).attr("keyword");
			var value = me.getTranslatedValueByKey( key );
			$(translatedTags[i]).html( value );
		};
		
		//console.log('translation');
	};
	

	me.covertKeywordTextAndTranslate = function( tag ){
		me.translatePage(function(){
			var list = me.translatedKeyWords[me.lang];
			var html = tag.html();
			for( var i in list )
			{
				var key = i;
				var value = list[i];
				if( html !== undefined && html.indexOf( key ) >= 0 )
				{
					value = ( value !== "" ) ? value : key; 
					html = html.split(key).join("<span keyword='" + key + "'>" + value + "</span>");
				}
			}
			tag.html(html);
		});
	};
	
	me.getTranslatedValueByKey = function( key )
	{
		if( me.translatedKeyWords[me.lang] !== undefined )
		{
			var value = me.translatedKeyWords[me.lang][key];
			if( value !== undefined )
			{
				return value;
			}
		}

		return key;
	};
	
	me.getKeywordsFromStorage = function( exeFunc )
	{ 
		var storedLangkey = "lang_" + me.lang;
		if( me.storageObj.getItem( storedLangkey ) !== "" )
		{
			var storedList = JSON.parse( me.storageObj.getItem( storedLangkey ) );
			me.translatedKeyWords[me.lang] = storedList.list;
			
			exeFunc();
		}
		else
		{
			me.loadKeywords( exeFunc );
		}
		
	};
	
	me.loadKeywords = function( exeFunc )
	{
		var storedLangkey = "lang_" + me.lang;
		var url = me.baseURL + "../" + Commons.wsUrl + "/translation/keywordList?lang=" + me.lang;
		$.ajax(
			{
				type: "POST"
				,url: url
				,dataType: "json"
	            ,contentType: "application/json;charset=utf-8"
				,success: function( response ) 
				{
					me.storageObj.addItem( storedLangkey, JSON.stringify( response ) );
					me.translatedKeyWords[me.lang] = response.list;
					
					me.translationStatusImg_checkedTag.show();
					exeFunc();
				}
				,error: function() 
				{
					exeFunc();
				}
			});
	}
	
	me.loadProjectDetails = function( exeFunc )
	{ 
		me.translateStatusImgChange( me._TRANSLATE_STATUS_LOADING, "version info" );		
				
		var url = me.baseURL + "../" + Commons.wsUrl + "/translation/version";
		
		$.ajax(
			{
				type: "POST"
				,url: url
				,dataType: "json"
	            ,contentType: "application/json;charset=utf-8"
				,success: function( response ) 
				{
					var searchedItem = response.list["lesotho_version"];
					if( searchedItem !== undefined )
					{
						var versionFullText = searchedItem;
						var value = versionFullText.split(" ");
						var version = value[0];
						var autoPush = ( value[1] === "[push]" ) ? true : false;
						var alwaysPush = ( value[1] === "[push-always]" ) ? true : false;
						
						var existingVersion = me.storageObj.getItem( me.KEY_VERSION );
						
						// In beginning to open the app, or in case of always push
						if( alwaysPush || existingVersion === "" )
						{
							me.translateStatusImgChange( me._TRANSLATE_STATUS_LOADING, version );
														
							me.loadKeywords( function() {

								me.storageObj.addItem( me.KEY_VERSION, version );
								me.storageObj.addItem( me.KEY_VERSION_WITH_OPTION, versionFullText );

								me.translateStatusImgChange( me._TRANSLATE_STATUS_CHECKED, versionFullText );
																
								exeFunc();
							} );							
						}
						// If the version on server is different from the browser storage
						else if( existingVersion != version )
						{			
							if( autoPush )
							{								
								me.translateStatusImgChange( me._TRANSLATE_STATUS_LOADING, version );

								// Load keywords again
								me.loadKeywords( function() {

									me.storageObj.addItem( me.KEY_VERSION, version );
									me.storageObj.addItem( me.KEY_VERSION_WITH_OPTION, versionFullText );
									
									me.translateStatusImgChange( me._TRANSLATE_STATUS_CHECKED, versionFullText );
									
									exeFunc();
								} );
							}
							else
							{
								// update available case..								
								me.translateStatusImgChange( me._TRANSLATE_STATUS_DOWNLOAD, version );
								
								exeFunc();
							}							
						}
						else
						{
							// same version case
							me.translateStatusImgChange( me._TRANSLATE_STATUS_CHECKED, versionFullText );
							
							exeFunc();
						}
					}
					else
					{
						exeFunc();
					}
				}
				,error: function() 
				{
					exeFunc();
				}
			});
		
	};	
	
	me.translateStatusImgChange = function( status, version )
	{
		me.translationStatusImgTags.hide();		

		if ( version === undefined ) version = '';
		 
		if ( status == me._TRANSLATE_STATUS_LOADING )
		{
			me.translationStatusImg_loadingTag.show().attr( 'title', me.getTranslatedValueByKey( 'translation_msg_updatingTranslationKeywords' ) + ' ' + version );
		}
		else if ( status == me._TRANSLATE_STATUS_CHECKED )
		{
			me.translationStatusImg_checkedTag.show().attr( 'title', me.getTranslatedValueByKey( 'translation_msg_updatedTranslationKeywords' ) + ' ' + version );
		}
		else if ( status == me._TRANSLATE_STATUS_DOWNLOAD )
		{
			me.translationStatusImg_downloadTag.show().attr( 'title', me.getTranslatedValueByKey( 'translation_btn_updateKeyword' ) + ' ' + version );
		}
	}

	
	// -----------------------------------------------------------------------
	// RUN Init method
	// -----------------------------------------------------------------------
	
	me.init();
}
