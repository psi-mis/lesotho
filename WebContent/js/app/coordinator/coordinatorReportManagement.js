
function CoordinatorReportManagement( mainPage )
{
	var me = this;

	me.mainPage = mainPage;
	me.storageObj = me.mainPage.storageObj;
	me.translationObj = me.mainPage.translationObj;
	
	// [Report]
	me.reportParamDivTag = $("#reportParamDiv");
	me.reportTblTag = $("#reportTbl");
	me.analyticTimeTag = $("#analyticTime");
	
	//[Ids]

	me.de_Achieved = "AUu3Q2cTOxt";
	me.de_ARTEnrollmentConfirmed = "gO8DpAzJsDp";
	me.de_Target = "R8zCCZYPVjm";
	
	
	me.reportName_SuccessfulLinkages = "successfulLinkages";
	

	me.COLOR_GREEN = "lime";
	me.COLOR_ORGANGE = "#FF9900";
	me.COLOR_RED = "red";

	
	// -------------------------------------------------------------------
	// [Report]
	// -------------------------------------------------------------------
	
	me.getReport = function()
	{
		Commons.checkSession( function( isInSession ) 
		{
			if( isInSession ) 
			{
				$.ajax(
					{
						type: "POST"
						,url: "../event/coordinatorReport"
						,dataType: "json"
			            ,contentType: "application/json;charset=utf-8"
			            ,beforeSend: function()
			            {
			            	var translatedText = me.translationObj.getTranslatedValueByKey( "report_msg_loadingReport" );
			            	MsgManager.appBlock( translatedText );
			            	
			            	me.reportTblTag.hide();
			            	me.reportTblTag.find("tbody td[dataelement]").find("span").html("");
			            	me.reportParamDivTag.show();
			            }
						,success: function( response ) 
						{
							// STEP 1. Add analytic time
							me.analyticTimeTag.html(response.analyticsTime);
							
							// --------------------------------------------------------------------
							// Generate report
							// --------------------------------------------------------------------
							
							// STEP 2. Get the currentPeriod and period which Yesterday is winthin
							var thisWeekPeriod;
							var thisMonthPeriod;
							var thisQuarterlyPeriod;
							var thisFinancialPeriod;
							
							for( var peKey in response.report.metaData.items )
							{
								if( peKey.indexOf("W") >= 0 ) // Ex: 2019W5
								{
									thisWeekPeriod = peKey;
								}
								else if( peKey.indexOf("Q") >= 0 ) // Ex: 2019Q1
								{
									thisQuarterlyPeriod = peKey;
								}
								else if( peKey.length == 6 ) // Ex: 201901
								{
									thisMonthPeriod = peKey;
								}
								else if( peKey.length == 7 ) // Ex: 2018Oct
								{
									thisMonthPeriod = peKey;
								}
							}
							
							var data = response.report.rows;
							for( var i in data )
							{
								var deId = data[i][0];
								var peId = data[i][1];
								var value = data[i][2];
								
								var periodKey = "";
								// STEP 3. Set "This Week" data
								if( peId == thisWeekPeriod ) 
								{
									periodKey = "thisWeek";
								}
								else if( peId == thisMonthPeriod ) 
								{
									periodKey = "thisMonth";
								}
								else if( peId == thisQuarterlyPeriod ) 
								{
									periodKey = "thisQuarterly";
								}
								else if( peId == thisFinancialPeriod ) 
								{
									periodKey = "thisFinancialYear";
								}


								me.setDataInReportCell( me.reportName_SuccessfulLinkages, deId, periodKey, value );
							}
							
							me.reportTblTag.show();
						}
						,error: function(response)
						{
							console.log(response);
						}
					}).always( function( data ) {
						MsgManager.appUnblock();
					});
			} 
			else {
				me.showExpireSessionMessage();					
			}
		});	
	};

	me.setDataInReportCell = function( clazzTableName, deId, peId, value )
	{
		value = Util.formatNumber( eval( value ) );
		var colTag = me.reportTblTag.find("tbody." + clazzTableName ).find("td[dataelement='" + deId + "'][period='" + peId + "']");
		colTag.find("span.value").html( value );
		
		var trafficLightTag = colTag.find("span.trafficLight");
		if( trafficLightTag.length > 0 )
		{
			colTag.find("span.value").html( value + "%" );
			
			var color = "";
			if( value >= 80 ){ // Green
				color = me.COLOR_GREEN;
			}
			else if( value >= 60 ){ // Yellow
				color = me.COLOR_ORGANGE;
			}
			else { // Red
				color = me.COLOR_RED;
			}
			
			trafficLightTag.css( "color", color );
			trafficLightTag.html("&#9679;");
		}
	};
	
}