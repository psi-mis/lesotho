package psi.lesotho.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;

public class EventController
    extends HttpServlet
{
    private static final long serialVersionUID = -8009460801270486913L;

    private static String PARAM_USERNAME = "@PARAM_USERNAME";
    private static String PARAM_START_DATE = "@PARAM_START_DATE";
    private static String PARAM_END_DATE = "@PARAM_END_DATE";
    private static String PARAM_CLIENT_ID = "@PARAM_CLIENT_ID";
    private static String PARAM_EVENT_ID = "@PARAM_EVENT_ID";
    private static String PARAM_ORGUNIT_ID = "@PARAM_ORGUNIT_ID";
    private static String PARAM_CATEGORY_OPTION_COMBO_ID = "@PARAM_CATEGORY_OPTION_COMBO_ID";
    // -------------------------------------------------------------------------
    // URLs
    // -------------------------------------------------------------------------

    // Load meta data
    private static String URL_QUERY_METADATA = Util.LOCATION_DHIS_SERVER
        + "/api/programs/" + Util.ID_PROGRAM + ".json?fields=programStages[programStageDataElements[dataElement[id,formName,optionSet[options[code,name]]]]],programTrackedEntityAttributes[trackedEntityAttribute[id,shortName,optionSet[options[code,name]]]";
    
    
    // -------------------------------------------------------------------------
    // Load list
    
    private static String URL_QUERY_CASES_BY_TIME = Util.LOCATION_DHIS_SERVER
        + "/api/sqlViews/" + Util.ID_SQLVIEW_LOAD_TODAY_CASE + "/data.json?paging=false&var=startDate:" + EventController.PARAM_START_DATE + "&var=endDate:"
        + EventController.PARAM_END_DATE + "&var=username:" + PARAM_USERNAME + "&var=stageId:" + Util.ID_STAGE;

    private static String URL_QUERY_POSITIVE_CASES = Util.LOCATION_DHIS_SERVER
        + "/api/sqlViews/" + Util.ID_SQLVIEW_LOAD_POSITIVE_CASE + "/data.json?paging=false&var=startDate:" + EventController.PARAM_START_DATE + "&var=endDate:"
        + EventController.PARAM_END_DATE + "&var=username:" + PARAM_USERNAME + "&var=stageId:" + Util.ID_STAGE;
    
    private static String URL_QUERY_FUCASE_BY_USERNAME = Util.LOCATION_DHIS_SERVER
        + "/api/sqlViews/" + Util.ID_SQLVIEW_LOAD_FUCASE_BY_USERNAME + "/data.json?paging=false&var=startDate:" + EventController.PARAM_START_DATE + "&var=endDate:"
        + EventController.PARAM_END_DATE + "&var=username:" + PARAM_USERNAME + "&var=stageId:" + Util.ID_STAGE;
    
    private static String URL_QUERY_FUCASE_ALL = Util.LOCATION_DHIS_SERVER + "/api/sqlViews/" + Util.ID_SQLVIEW_LOAD_FUCASE_ALL + "/data.json?paging=false&var=stageId:" + Util.ID_STAGE + "&var=username:";

    // -------------------------------------------------------------------------
    // Event

    private static String URL_QUERY_CREATE_EVENT = Util.LOCATION_DHIS_SERVER + "/api/events";
    private static String URL_QUERY_UPDATE_EVENT = Util.LOCATION_DHIS_SERVER + "/api/events/" + EventController.PARAM_EVENT_ID;
    // private static String URL_QUERY_EVENTS_BY_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/events.json?ouMode=ACCESSIBLE&skipPaging=true&order=eventDate:DESC&trackedEntityInstance=" + EventController.PARAM_CLIENT_ID;
    private static String URL_QUERY_EVENTS_BY_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/events.json?skipPaging=true&order=eventDate:DESC&trackedEntityInstance=" + EventController.PARAM_CLIENT_ID;
    
    // Load event details
    private static String URL_QUERY_EVENT_BY_ID = Util.LOCATION_DHIS_SERVER
        + "/api/events/" + EventController.PARAM_EVENT_ID + ".json";
    
    // Load event orgUnit
    private static String URL_QUERY_ORGUNIT = Util.LOCATION_DHIS_SERVER
        + "/api/organisationUnits/" + PARAM_ORGUNIT_ID + ".json?fields=name,parent[name]";

    // -------------------------------------------------------------------------
    // Client
    
    
    // Find client partner information
    private static String URL_QUERY_FIND_FIRST_CLIENT_IN_COUPLE = Util.LOCATION_DHIS_SERVER + "/api/sqlViews/" + Util.ID_SQLVIEW_FIND_PARTNER + "/data.json?paging=false&var=startDate:" + EventController.PARAM_START_DATE 
        + "&var=stageId:" + Util.ID_STAGE + "&var=username:" + EventController.PARAM_USERNAME + "&var=ouId:" + EventController.PARAM_ORGUNIT_ID + "&var=endDate:" + EventController.PARAM_END_DATE;
    
    // -------------------------------------------------------------------------
    // Report
    
    private static String URL_QUERY_COUNSELLOR_REPORT = Util.LOCATION_DHIS_SERVER + "/api/analytics.json?dimension=dx:KDgzpKX3h2S.QLMo6Kh3eVP;KDgzpKX3h2S.tUIkmIFMEDS;KXSdghPqhl6;LE7tDH8dfDV;rcVLQsClLUa;sNS1PQ1YNXA;sX8wCJQEm2l&dimension=pe:THIS_FINANCIAL_YEAR;THIS_MONTH;THIS_QUARTER;THIS_WEEK&filter=ou:" + Util.ROOT_ORGTUNIT_LESOTHO + "&filter=" + Util.USER_CATEGORY_ID + ":" + EventController.PARAM_CATEGORY_OPTION_COMBO_ID + "&skipMeta=false";
    private static String URL_QUERY_COORDINATOR_REPORT = Util.LOCATION_DHIS_SERVER + "/api/analytics.json?dimension=dx:AUu3Q2cTOxt;R8zCCZYPVjm;gO8DpAzJsDp&dimension=pe:THIS_FINANCIAL_YEAR;THIS_MONTH;THIS_QUARTER;THIS_WEEK&filter=ou:" + Util.ROOT_ORGTUNIT_LESOTHO + "&filter=" + Util.USER_CATEGORY_ID + ":" + EventController.PARAM_CATEGORY_OPTION_COMBO_ID + "&displayProperty=SHORTNAME";
    
    
   // -------------------------------------------------------------------------
   // POST method
   // -------------------------------------------------------------------------
  
    protected void doPost( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        try
        {
            // STEP 1. Get loginUsername/password from session

            HttpSession session = request.getSession( true );
            String loginUsername = (String) session.getAttribute( Util.KEY_LOGIN_USERNAME );

            // STEP 2. Check loginUsername/password

            ResponseInfo responseInfo = null;

            if ( request.getPathInfo() != null && request.getPathInfo().split( "/" ).length >= 2 )
            {
                String[] queryPathList = request.getPathInfo().split( "/" );

                String key = queryPathList[1];

                // Load Today's case
                if ( key.equals( Util.KEY_TODAY_CASES ) )
                {
                    responseInfo = EventController.getTodayCases( request, loginUsername );
                }
                // Load Previous case
                else if ( key.equals( Util.KEY_PREVIOUS_CASES ) )
                {
                    responseInfo = EventController.getPreviousCases( request, loginUsername );
                }
                // Load Previous case
                else if ( key.equals( Util.KEY_POSITIVE_CASES ) )
                {
                    responseInfo = EventController.getPositiveCases( request, loginUsername );
                }
                // Add / Update Event
                else if ( key.equals( Util.KEY_SAVE_EVENT ) )
                {
                    String ouId = request.getParameter( Util.PAMAM_ORGUNIT_ID );
                    String clientId = request.getParameter( Util.PAMAM_CLIENT_ID );
                    String eventId = request.getParameter( Util.PAMAM_EVENT_ID );
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );
                    System.out.println(receivedData ); 
                    // Create Event
                    if ( eventId == null )
                    {
                        responseInfo = EventController.createEvent( receivedData, clientId, ouId, loginUsername );
                    }
                    // Update Event
                    else
                    {
                        responseInfo = EventController.updateEvent( eventId, receivedData, loginUsername );
                    }
                } 
                // Load event by ID
                else if ( key.equals( Util.KEY_GET_EVENT_DETAILS ) )
                {
                    String outputData = "";
                    String eventId = request.getParameter( Util.PAMAM_EVENT_ID );
                    responseInfo = EventController.getEventById( eventId );
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        outputData +="\"eventDetails\":" + responseInfo.output;
                        
                        JSONObject jsonEvent = new JSONObject ( responseInfo.output );
                        String ouId = jsonEvent.getString("orgUnit");
                        String catOptionId = jsonEvent.getString("attributeCategoryOptions" );
                        responseInfo = EventController.getEventOrgUnit( ouId );
                        if( responseInfo.responseCode == 200 )
                        {
                            outputData += ",\"ouInfo\":" + responseInfo.output;
                            
                            responseInfo = EventController.getMetaData();
                            if( responseInfo.responseCode == 200 )
                            {
                                outputData += ",\"metaData\":" + responseInfo.output;
                                outputData += ",\"catOptCode\":\"" + EventController.getCatOptionComboCode( catOptionId ) + "\""; 
                                outputData = "{" + outputData + "}";
                                responseInfo.output = outputData;
                            }
                        }
                    }
                } 
                // Load counsellor report
                else if ( key.equals( Util.KEY_GET_COUNSELLOR_REPORT ) )
                {
                    responseInfo = EventController.getCounsellorReport( loginUsername );
                    String output = "\"report\":" + responseInfo.output + "";
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        ResponseInfo responseInfo_AnalyticsTime = EventController.getAnalyticsTime();
                        if( responseInfo_AnalyticsTime.responseCode == 200 )
                        {
                                JSONObject analyticsTime = new JSONObject( responseInfo_AnalyticsTime.output );
                                String time = analyticsTime.getString( "intervalSinceLastAnalyticsTableSuccess" );
                                time = time.replace("s", "seconds");
                                time = time.replace("m", "minutes");
                                time = time.replace("h", "hours");                                                              
                                
                                output += ",\"analyticsTime\":\"" + time + "\"";
                        }
                    }
                    
                    responseInfo.output = "{" + output + "}";
                }
                // Load coordinator report
                else if ( key.equals( Util.KEY_GET_COORDINATOR_REPORT ) )
                {
                    responseInfo = EventController.getCoordinatorReport( loginUsername );
                    String output = "\"report\":" + responseInfo.output + "";
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        ResponseInfo responseInfo_AnalyticsTime = EventController.getAnalyticsTime();
                        if( responseInfo_AnalyticsTime.responseCode == 200 )
                        {
                                JSONObject analyticsTime = new JSONObject( responseInfo_AnalyticsTime.output );
                                String time = analyticsTime.getString( "intervalSinceLastAnalyticsTableSuccess" );
                                time = time.replace("s", "seconds");
                                time = time.replace("m", "minutes");
                                time = time.replace("h", "hours");                                                              
                                
                                output += ",\"analyticsTime\":\"" + time + "\"";
                        }
                    }
                    
                    responseInfo.output = "{" + output + "}";
                }
                // Load Today F/U
                else if ( key.equals( Util.KEY_TODAY_FU ) )
                {
                    responseInfo = EventController.getTodayFU( request, loginUsername );
                }  
                // Load Previous F/U
                else if ( key.equals( Util.KEY_ALL_FU ) )
                {
                    responseInfo = EventController.getAllFU( request, loginUsername );
                }
                // Find fist client in couple -- Used for finding partner CUIC and partner event UID
                else if ( key.equals( Util.KEY_FIND_PARTNER ) )
                {
                    String ouId = request.getParameter( Util.PAMAM_ORGUNIT_ID );
                    responseInfo =  EventController.findClientPartner( ouId, loginUsername );
                }
                else if ( key.equals( Util.KEY_SAVE_PARTNER_CUIC ) )
                {
                    String clientEventId = request.getParameter( Util.PAMAM_EVENT_ID );
                    String clientCUIC = request.getParameter( Util.PAMAM_CLIENT_CUIC );
                    String partnerEventId = request.getParameter( Util.PAMAM_PARTNER_EVENT_ID );
                    String partnerCUIC = request.getParameter( Util.PAMAM_PARTNER_CUIC );
                    String coupleStatus = request.getParameter( Util.PAMAM_COUPLE_STAUTS );

                    // ---------------------------------------------------------
                    // For Partner - Update Event with partner information
                    
                    responseInfo = EventController.getEventById( partnerEventId );
                   
                    JSONObject jsonEvent = responseInfo.data;
                    String partnerId = jsonEvent.getString( "trackedEntityInstance" );
                    
                    JSONObject dataValueCUIC = new JSONObject();                    
                    dataValueCUIC.put( "dataElement", Util.ID_DE_PARTNER_CUIC );
                    dataValueCUIC.put( "value", partnerCUIC );
                    jsonEvent.getJSONArray( "dataValues" ).put( dataValueCUIC );

                    JSONObject dataValueEventId = new JSONObject();
                    dataValueEventId.put( "dataElement", Util.ID_DE_PARTNER_EVENTID );
                    dataValueEventId.put( "value", clientEventId );
                    jsonEvent.getJSONArray( "dataValues" ).put( dataValueEventId );
                    
                    JSONObject dataValueCoupleStatus = new JSONObject();
                    dataValueCoupleStatus.put( "dataElement", Util.ID_DE_COPUPLE_STATUS );
                    dataValueCoupleStatus.put( "value", coupleStatus );
                    jsonEvent.getJSONArray( "dataValues" ).put( dataValueCoupleStatus );
                    
                    
                    responseInfo = EventController.updateEvent( partnerEventId, jsonEvent, loginUsername );

                    // ---------------------------------------------------------		
                    // For Partner - Save Partner attribute information
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        JSONArray attrValues = new JSONArray();
                        
                        JSONObject attrValue = new JSONObject();
                        attrValue.put( "attribute", Util.ID_ATTR_HIV_TEST_PARTNER_CUIC );
                        attrValue.put( "value", clientCUIC ); 
                        attrValues.put( attrValue );
                        

                        JSONObject attrOptionValue = new JSONObject();
                        attrOptionValue.put( "attribute", Util.ID_ATTR_HIV_TEST_PARTNER_OPTION );
                        attrOptionValue.put( "value", "2" ); 
                        attrValues.put( attrOptionValue );
                        
                        responseInfo = ClientController.updateAttrValues( partnerId, attrValues );
                    }
                    
                    
                    // ---------------------------------------------------------                
                    // For Client - Update Event with partner information
                    
                    ResponseInfo responseInfo_Client = EventController.getEventById( clientEventId );
 
                    JSONObject jsonClientEvent = responseInfo_Client.data;
                    
                    JSONObject dataValueClientCUIC = new JSONObject();                    
                    dataValueClientCUIC.put( "dataElement", Util.ID_DE_PARTNER_CUIC );
                    dataValueClientCUIC.put( "value", clientCUIC );
                    jsonClientEvent.getJSONArray( "dataValues" ).put( dataValueClientCUIC );

                    JSONObject dataValueClientEventId = new JSONObject();
                    dataValueClientEventId.put( "dataElement", Util.ID_DE_PARTNER_EVENTID );
                    dataValueClientEventId.put( "value", partnerEventId );
                    jsonClientEvent.getJSONArray( "dataValues" ).put( dataValueClientEventId );
                    
                    JSONObject dataValueClientCoupleStatus = new JSONObject();
                    dataValueClientCoupleStatus.put( "dataElement", Util.ID_DE_COPUPLE_STATUS );
                    dataValueClientCoupleStatus.put( "value", coupleStatus );
                    jsonClientEvent.getJSONArray( "dataValues" ).put( dataValueClientCoupleStatus );
                    

                    responseInfo_Client = EventController.updateEvent( clientEventId, jsonClientEvent, loginUsername );  
                    
                    // ---------------------------------------------------------                
                    // For Client - Save Partner attribute information 
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        JSONArray attrValues = new JSONArray();
                        
                        JSONObject attrValue = new JSONObject();
                        attrValue.put( "attribute", Util.ID_ATTR_HIV_TEST_PARTNER_CUIC );
                        attrValue.put( "value", partnerCUIC ); 
                        attrValues.put( attrValue );

                        JSONObject attrOptionValue = new JSONObject();
                        attrOptionValue.put( "attribute", Util.ID_ATTR_HIV_TEST_PARTNER_OPTION );
                        attrOptionValue.put( "value", "1" ); 
                        attrValues.put( attrOptionValue );
                        
                        responseInfo_Client = ClientController.updateAttrValues( clientEventId, attrValues );
                    }
                } 
               
            }

            // STEP 4. Send back the messages
            responseInfo.outMessage = responseInfo.output;
            Util.respondMsgOut( responseInfo, response );

        }
        catch ( IOException ex )
        {
            System.out.println( "IO Excpetion: " + ex.toString() );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
            System.out.println( "Exception: " + ex.toString() );
        }
    }

    // ===============================================================================================================
    // Suportive methods
    // ===============================================================================================================

    private static ResponseInfo getTodayCases( HttpServletRequest request, String loginUsername )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String curDate = Util.getCurrentDate();
            String tomorrow = Util.getXLastDate( -1 );

            String requestUrl = EventController.URL_QUERY_CASES_BY_TIME;
            requestUrl = requestUrl.replace( PARAM_USERNAME, loginUsername );
            requestUrl = requestUrl.replace( PARAM_START_DATE, curDate );
            requestUrl = requestUrl.replace( PARAM_END_DATE, tomorrow );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );

        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    private static ResponseInfo getPreviousCases( HttpServletRequest request, String loginUsername )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String today = Util.getCurrentDate();
            String last12Month = Util.getXLastMonth( 12 );
            
            String requestUrl = EventController.URL_QUERY_CASES_BY_TIME;
            requestUrl = requestUrl.replace( PARAM_USERNAME, loginUsername );
            requestUrl = requestUrl.replace( PARAM_START_DATE, last12Month );
            requestUrl = requestUrl.replace( PARAM_END_DATE, today );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );

        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

    private static ResponseInfo getPositiveCases( HttpServletRequest request, String loginUsername )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String startDate = Util.getXLastMonth( 12 );
            String endDate = Util.getXLastDate( -1 );

            String requestUrl = EventController.URL_QUERY_POSITIVE_CASES;
            requestUrl = requestUrl.replace( PARAM_USERNAME, loginUsername );
            requestUrl = requestUrl.replace( PARAM_START_DATE, startDate );
            requestUrl = requestUrl.replace( PARAM_END_DATE, endDate );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );

        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

    private static String getCatOptionComboUid( String loginUsername )
    {
        String catOptionComboId = "";
        
        try
        {
            String url = Util.LOCATION_DHIS_SERVER + "/api/categoryOptions.json?fields=id,name,code&filter=code:eq:" + loginUsername;
            ResponseInfo responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
            
            if ( responseInfo.responseCode == 200 )
            {
                JSONObject catOptionCombo = new JSONObject( responseInfo.output );
                JSONArray catOptionComboList = catOptionCombo.getJSONArray( "categoryOptions" );
                catOptionComboId = catOptionComboList.getJSONObject( 0 ).getString( "id" );

            }
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return catOptionComboId;
    }
    
    private static String getCatOptionComboCode( String id )
    {
        String code = "";
        
        try
        {
            String url = Util.LOCATION_DHIS_SERVER + "/api/categoryOptions/" + id + ".json?fields=code";
            ResponseInfo responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
            
            if ( responseInfo.responseCode == 200 )
            {
                JSONObject catOptionCombo = new JSONObject( responseInfo.output );
                code = catOptionCombo.getString( "code" );
            }
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return code;
    }
     
    private static ResponseInfo getCounsellorReport( String loginUsername )
    {
        ResponseInfo responseInfo = new ResponseInfo();
        
        String catOptionComboId = EventController.getCatOptionComboUid( loginUsername );
        if ( catOptionComboId != null )
        {
            try
            {
                String url = EventController.URL_QUERY_COUNSELLOR_REPORT;
                url = url.replace( EventController.PARAM_CATEGORY_OPTION_COMBO_ID, catOptionComboId );
                responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
            }
            catch ( Exception ex )
            {
                ex.printStackTrace();
            }
        }
        else
        {
            responseInfo.responseCode = 404;
        }
       

        return responseInfo;
    }
    
  
    private static ResponseInfo getCoordinatorReport( String loginUsername )
    {
        ResponseInfo responseInfo = new ResponseInfo();
        
        String catOptionComboId = EventController.getCatOptionComboUid( loginUsername );
        if ( catOptionComboId != null )
        {
            try
            {
                String url = URL_QUERY_COORDINATOR_REPORT;
                url = url.replace( EventController.PARAM_CATEGORY_OPTION_COMBO_ID, catOptionComboId );
                responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
            }
            catch ( Exception ex )
            {
                ex.printStackTrace();
            }
        }
        else
        {
            responseInfo.responseCode = 404;
        }
       

        return responseInfo;
    }
    
    public static ResponseInfo createEvent( JSONObject eventData, String clientId, String ouId, String loginUsername )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = new ResponseInfo();

        try
        {
            String catOptionComboId = EventController.getCatOptionComboUid( loginUsername );

            if ( catOptionComboId != null )
            {
                JSONObject eventJson = EventController.composeJsonEvent( eventData, clientId, ouId, catOptionComboId );
                String requestUrl = EventController.URL_QUERY_CREATE_EVENT;
                responseInfo = Util.sendRequest( Util.REQUEST_TYPE_POST, requestUrl, eventJson, null );

                if( responseInfo.responseCode == 200 )
                {
                    Util.processResponseMsg( responseInfo, "" );

                    String eventId = responseInfo.referenceId;
                    eventJson.put( "event", eventId );
                    responseInfo.output = eventJson.toString();
                }
            }
            else
            {
                responseInfo.responseCode = 404;
            }

        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    public static ResponseInfo updateEvent( String eventId, JSONObject eventData, String loginUsername )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = new ResponseInfo();
        
        try
        {     
            String requestUrl = URL_QUERY_UPDATE_EVENT;
            requestUrl = requestUrl.replace( EventController.PARAM_EVENT_ID, eventId );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_PUT, requestUrl, eventData, null );
            if( responseInfo.responseCode == 200 )
            {
                responseInfo.output = eventData.toString();
            }

        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    public static ResponseInfo getEventsByClient( String clientId )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = EventController.URL_QUERY_EVENTS_BY_CLIENT;
            requestUrl = requestUrl.replace( EventController.PARAM_CLIENT_ID, clientId );
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    public static ResponseInfo getEventById( String eventId )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = EventController.URL_QUERY_EVENT_BY_ID;
            requestUrl = requestUrl.replace( EventController.PARAM_EVENT_ID, eventId );
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    public static ResponseInfo getMetaData()
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = EventController.URL_QUERY_METADATA;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

    public static ResponseInfo getEventOrgUnit( String ouId )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = EventController.URL_QUERY_ORGUNIT;
            requestUrl = requestUrl.replace( EventController.PARAM_ORGUNIT_ID, ouId );
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    
    private static ResponseInfo findClientPartner( String ouId, String loginUsername )
    {
        ResponseInfo responseInfo = null;
        String outputData = "";
        try
        {
            String startDate = Util.getCurrentDate();
            String endDate = Util.getXLastDate( -1 );
            
            String requestUrl = EventController.URL_QUERY_FIND_FIRST_CLIENT_IN_COUPLE;
            requestUrl = requestUrl.replace( EventController.PARAM_START_DATE, startDate );
            requestUrl = requestUrl.replace( EventController.PARAM_END_DATE, endDate );
            requestUrl = requestUrl.replace( EventController.PARAM_USERNAME, loginUsername );
            requestUrl = requestUrl.replace( EventController.PARAM_ORGUNIT_ID, ouId );
            
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
//            
//            if( responseInfo.responseCode == 200 )
//            {
//                JSONObject partnerData = new JSONObject( responseInfo.output );
//                JSONArray list = partnerData.getJSONArray( "trackedEntityInstances" );
//                
//                if( list.length() == 1 )
//                {
//                    JSONObject clientData = list.getJSONObject( 0 );
//                    outputData = "\"clientDetails\":" + clientData.toString();
//                    
//                    ResponseInfo responseInfo_Events = EventController.getEventsByClient( clientData.getString( "trackedEntityInstance" ) );
//                    if( responseInfo_Events.responseCode == 200 )
//                    {
//                        JSONObject eventData = new JSONObject( responseInfo_Events.output );
//                        JSONArray eventList = eventData.getJSONArray( "events" );
//                        if( eventList.length() > 0 )
//                        {
//                            outputData += ",\"eventDetails\":" + eventList.getJSONObject( 0 ).toString();
//                        }
//                    }
//                }
//                
//                responseInfo.output = "{" + outputData + "}";  
//            }
//            
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
        
    }
    
    
    public static ResponseInfo getAnalyticsTime() throws Exception, IOException
    {
        String requestUrl = Util.LOCATION_DHIS_SERVER + "/api/system/info.json";
        
        return Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
    }
    
    public static ResponseInfo getPartnerByEventId( String eventId )
    {
        ResponseInfo responseInfo = null;
        String outputData = "";
        
        try
        { 
            String requestUrl = EventController.URL_QUERY_EVENT_BY_ID;
            requestUrl = requestUrl.replace( EventController.PARAM_EVENT_ID, eventId );
            
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
            
            outputData +="\"eventDetails\":" + responseInfo.output;
            
            
            if( responseInfo.responseCode == 200 )
            {
                JSONObject eventData = new JSONObject( responseInfo.output );
                String clientId = eventData.getString( "trackedEntityInstance" );
                
                ResponseInfo responseInfo_Client = ClientController.getClientById( clientId );
                if( responseInfo_Client.responseCode == 200 )
                {
                    outputData += ",\"clientDetails\":" + responseInfo_Client.output;
                }
            }

            responseInfo.output = "{" + outputData + "}";
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
        
    }
    
    
    // ===============================================================================================================
    // Coordinator
    // ===============================================================================================================

    private static ResponseInfo getTodayFU( HttpServletRequest request, String loginUsername )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String curDate = Util.getCurrentDate();
            String tomorrow = Util.getXLastDate( -1 );
         
            String requestUrl = EventController.URL_QUERY_FUCASE_BY_USERNAME;
            requestUrl = requestUrl.replace( PARAM_USERNAME, loginUsername );
            requestUrl = requestUrl.replace( PARAM_START_DATE, curDate );
            requestUrl = requestUrl.replace( PARAM_END_DATE, tomorrow );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    
    private static ResponseInfo getAllFU( HttpServletRequest request, String loginUsername )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = EventController.URL_QUERY_FUCASE_ALL + loginUsername;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

    
    // ===============================================================================================================
    // Supportive methods
    // ===============================================================================================================

    
    public static String getPartnerEventId( JSONObject event )
    {
        if( event != null )
        {
            JSONArray dataValues = event.getJSONArray( "dataValues" );
            for( int i=0; i < dataValues.length(); i ++ )
            {
                JSONObject dataValue = dataValues.getJSONObject( i );
                if( dataValue.getString( "dataElement" ).equals( Util.ID_DE_PARTNER_EVENTID ) )
                {
                    return dataValue.getString( "value" );
                }
            }
        }
        
        return null;
    }

    public static JSONObject getActiveEvent( JSONArray eventList, String stageId )
    {
        for( int i=0; i < eventList.length(); i++ )
        {
            JSONObject event = eventList.getJSONObject( i );
            if( event.getString( "status" ).equals( "ACTIVE" ) && event.getString( "programStage" ).equals( stageId ) )
            {
                return event;
            }
        }
        
        return null;
    }

    // CREATE JSON FOR THIS - add voucher Id, linking info.. etc..
    private static JSONObject composeJsonEvent( JSONObject eventData, String teiId, String orgUnitId,
        String catOptionComboId )
    {
        eventData.put( "program", Util.ID_PROGRAM );
        eventData.put( "orgUnit", orgUnitId );
        eventData.put( "trackedEntityInstance", teiId );
        eventData.put( "eventDate", Util.getCurrentDateTime() );
        
        if( !eventData.has( "status"  ))
        {
            eventData.put( "status", "ACTIVE" );  
        }
       
        eventData.put( "attributeCategoryOptions", catOptionComboId );

        if ( eventData.isNull( "dataValues" ) )
        {
            eventData.put( "dataValues", new JSONArray() );
        }

        
        return eventData;
    }
    
    
    
    

}
