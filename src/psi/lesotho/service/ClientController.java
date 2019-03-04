package psi.lesotho.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

public class ClientController
    extends HttpServlet
{
    private static final long serialVersionUID = -8009460801270486913L;

    private static final String PARAM_CLIENT_ID = "@PARAM_CLIENT_ID";
    
    private static ArrayList<String> searchVariables = new ArrayList<>(Arrays.asList( Util.ID_ATTR_FIRSTNAME, Util.ID_ATTR_LASTNAME
        , Util.ID_ATTR_DOB, Util.ID_ATTR_DISTRICTOB, Util.ID_ATTR_BIRTHORDER ));
    
    // -------------------------------------------------------------------------
    // URLs
    // -------------------------------------------------------------------------
    
    private static final String URL_QUERY_SEARCH_CLIENTS = Util.LOCATION_DHIS_SERVER + "/api/sqlViews/" + Util.ID_SQLVIEW_SEARCH_CLIENTS + "/data.json?paging=false&";
    private static final String URL_QUERY_SEARCH_POSITIVE_CLIENTS = Util.LOCATION_DHIS_SERVER + "/api/sqlViews/" + Util.ID_SQLVIEW_SEARCH_POSITIVE_CLIENTS + "/data.json?paging=false&";
    private static final String URL_QUERY_CREATE_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/30/trackedEntityInstances";
    private static final String URL_QUERY_UPDATE_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/30/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID;
    private static final String URL_QUERY_ENROLLMENT = Util.LOCATION_DHIS_SERVER + "/api/enrollments";
    private static final String URL_QUERY_CLIENT_DETAILS = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID + ".json?program=" + Util.ID_PROGRAM + "&fields=*,attributes[attribute,value]";

//    public static final String URL_QUERY_CLIENT_BY_ID = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID + ".json?program=" + Util.ID_PROGRAM;
//    private static final String URL_QUERY_SEARCH_CLIENTS = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances.json?ouMode=ALL&program=" + Util.ID_PROGRAM;
//    private static final String URL_QUERY_SEARCH_POSITIVE_CLIENTS = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances.json?program=" + Util.ID_PROGRAM + "&ouMode=ALL&filter=" + Util.ID_ATTR_HIV_TEST_FINAL_RESULT + ":EQ:POSITIVE";
//    private static final String URL_QUERY_CREATE_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances";
//    private static final String URL_QUERY_UPDATE_CLIENT = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID;
//    private static final String URL_QUERY_ENROLLMENT = Util.LOCATION_DHIS_SERVER + "/api/enrollments";
//    private static final String URL_QUERY_CLIENT_DETAILS = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID + ".json?program=" + Util.ID_PROGRAM + "&fields=*,attributes[attribute,value]";
    
        
    // -------------------------------------------------------------------------
    // POST method
    // -------------------------------------------------------------------------
    
    protected void doPost( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        try
        {         
            // STEP 1. Check loginUsername/password
            ResponseInfo responseInfo = null;
            
            if ( request.getPathInfo() != null && request.getPathInfo().split( "/" ).length >= 2 )
            {
                String[] queryPathList = request.getPathInfo().split( "/" );
                String key = queryPathList[1];

                // STEP 2.1. Search client
                if ( key.equals( Util.KEY_SEARCH_CASES ) )
                {
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );
                   
                    String searchType = request.getParameter( "searchType" );
                    
                    if( searchType.equals( Util.KEY_SEARCHTYPE_ALL ) )
                    {
                        responseInfo = ClientController.searchClients( request, receivedData );
                    }
                    else if( searchType.equals( Util.KEY_SEARCHTYPE_POSITIVE ) )
                    {
                        responseInfo = ClientController.searchPositiveClients( request, receivedData );
                    }
                }
                // STEP 2.2. Get All events of an client
                else if ( key.equals( Util.KEY_CLIENT_DETAILS ) )
                {
                    String outputData = "";
                    String clientId = request.getParameter( "clientId" );
                    responseInfo = ClientController.getClientDetails( clientId );
                    if ( responseInfo.responseCode == 200 )
                    {
                        outputData = "\"client\":" + responseInfo.output;
                        responseInfo = EventController.getEventsByClient( clientId );
                        if ( responseInfo.responseCode == 200 )
                        {
                            outputData += ",\"events\":" + responseInfo.output;
                             
                            // STEP 2.2.1 Get active event
                            JSONArray eventList = responseInfo.data.getJSONArray( "events" );
                            JSONObject activeHIVTestingEvent = EventController.getActiveEvent( eventList, Util.ID_STAGE );
                            String partnerEventId = EventController.getPartnerEventId( activeHIVTestingEvent );
                            if( partnerEventId != null )
                            {
                                responseInfo = EventController.getPartnerByEventId( partnerEventId );
                                if ( responseInfo.responseCode == 200 )
                                {
                                    outputData += ",\"partner\":" + responseInfo.output;
                                }
                            }
                            
                            outputData = "{" + outputData + "}";
                            responseInfo.output = outputData; 
                            
                        }
                    }
                }
                // STEP 2.3. Add / Update Client
                else if ( key.equals( Util.KEY_SAVE_CLIENT ) )
                {
                    String clientId = request.getParameter( Util.PAMAM_CLIENT_ID );
                    String ouId = request.getParameter( Util.PAMAM_ORGUNIT_ID );
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );

                    // Update client
                    if( clientId != null )
                    {
                        responseInfo = ClientController.updateClient( clientId, receivedData );
                    }
                    // Add client
                    else
                    {
                        responseInfo = ClientController.createClient( receivedData, ouId );

                        StringBuffer output = new StringBuffer();
                        output.append( responseInfo.output );

                        if ( responseInfo.responseCode == 200 )
                        {
                            // Enroll client
                            clientId = responseInfo.referenceId;
                            responseInfo = ClientController.enrollClient( clientId, ouId );
                        }
                        
                        responseInfo.output = output.toString();
                    }
                }
            }

            // STEP 3. Send back the messages
            responseInfo.outMessage = responseInfo.output;
            Util.respondMsgOut( responseInfo, response );

        }
        catch ( IOException ex )
        {
            System.out.println( "IO Excpetion: " + ex.toString() );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }
    }

    // ===============================================================================================================
    // Supportive methods
    // ===============================================================================================================


    public static ResponseInfo getClientById( String clientId )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = ClientController.URL_QUERY_CLIENT_DETAILS;
            requestUrl = requestUrl.replace( ClientController.PARAM_CLIENT_ID, clientId );
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, requestUrl, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }
    
    private static ResponseInfo searchClients( HttpServletRequest request, JSONObject jsonData )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;
        try
        {
            String condition = ClientController.createSearchClientCondition( jsonData.getJSONArray( "attributes" ) );
            String url = ClientController.URL_QUERY_SEARCH_CLIENTS + condition;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo searchPositiveClients( HttpServletRequest request, JSONObject jsonData )
        throws UnsupportedEncodingException, ServletException, IOException, Exception
    {
        ResponseInfo responseInfo = null;
        try
        {
            String condition = ClientController.createSearchClientCondition( jsonData.getJSONArray( "attributes" ) );
            String url = ClientController.URL_QUERY_SEARCH_POSITIVE_CLIENTS +  condition;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo createClient( JSONObject receivedData, String ouId )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            receivedData.put( "trackedEntityType", Util.ID_TRACKED_ENTITY );
            receivedData.put( "orgUnit", ouId );
            
            String requestUrl = ClientController.URL_QUERY_CREATE_CLIENT;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_POST, requestUrl, receivedData, null );
            Util.processResponseMsg( responseInfo, "" );
            String clientId = responseInfo.referenceId;
            receivedData.put( "trackedEntityInstance", clientId );
            responseInfo.output = receivedData.toString();
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

    private static ResponseInfo updateClient( String clientId, JSONObject receivedData )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            String requestUrl = ClientController.URL_QUERY_UPDATE_CLIENT;
            requestUrl = requestUrl.replace( ClientController.PARAM_CLIENT_ID, clientId );
            
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_PUT, requestUrl, receivedData, null );
            if( responseInfo.responseCode == 200 )
            {
                responseInfo.output = receivedData.toString();
            }
            
            Util.processResponseMsg( responseInfo, "" );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }  

        return responseInfo;
    }
    
    public static ResponseInfo updateAttrValues( String clientId, JSONArray updatedAttrValues )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            responseInfo = ClientController.getClientById( clientId );
            JSONObject clientData = responseInfo.data;
            JSONArray clientAttrValues = clientData.getJSONArray( "attributes" );
            for( int i=0; i< updatedAttrValues.length(); i++ )
            {
                JSONObject updatedAttrValue = updatedAttrValues.getJSONObject( i );
                for( int j=0; j< clientAttrValues.length(); j++ )
                {
                    JSONObject clientAttrValue = clientAttrValues.getJSONObject( j );
                    if( updatedAttrValue.getString( "attribute" ).equals( clientAttrValue.getString( "attribute" ) ) )
                    {
                        clientAttrValue.put( "value", updatedAttrValue.getString( "value" ) );
                        break;
                    }
                }
            }

            
            
            clientData.remove( "attributes" );
            clientData.put( "attributes", clientAttrValues );
            responseInfo = ClientController.updateClient( clientId, clientData );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }  

        return responseInfo;
    }
    

    private static ResponseInfo enrollClient( String clientId, String ouId )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = new ResponseInfo();

        try
        {
            JSONObject enrollmentJson = ClientController.getEnrollmentJson( clientId, Util.ID_PROGRAM, ouId );
            String requestUrl = ClientController.URL_QUERY_ENROLLMENT;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_POST, requestUrl, enrollmentJson, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo getClientDetails( String clientId )
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = ClientController.URL_QUERY_CLIENT_DETAILS;
            url = url.replace( ClientController.PARAM_CLIENT_ID, clientId );
            
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    
    // -----------------------------------------------------------------------------------------------------
    // Create JSON data
    // -----------------------------------------------------------------------------------------------------

    private static JSONObject getEnrollmentJson( String clientId, String programId, String orgUnitId )
    {
        String today = Util.getCurrentDate();

        JSONObject jsonData = new JSONObject();
        jsonData.put( "trackedEntityInstance", clientId );
        jsonData.put( "orgUnit", orgUnitId );
        jsonData.put( "program", programId );
        jsonData.put( "enrollmentDate", today );
        jsonData.put( "incidentDate", today );

        return jsonData;
    }
    
    @SuppressWarnings( "unchecked" )
    private static String createSearchClientCondition( JSONArray attributeList )
    { 
        String condition = "";
        ArrayList<String> searchVariableCopy = (ArrayList<String>)ClientController.searchVariables.clone();
        
        for( int i=0; i<attributeList.length(); i++ ) 
        {
            String attributeId = attributeList.getJSONObject( i ).getString( "attribute" );
            String value = attributeList.getJSONObject( i ).getString( "value" );
            value = value.replaceAll("'", "-");
            
            condition += "var=" + attributeId + ":" + URLEncoder.encode( value ) + "&";

            if ( searchVariableCopy.indexOf( attributeId ) >= 0 )
            {
                searchVariableCopy.remove( attributeId );
            }
        }
        
        for( int i=0; i<searchVariableCopy.size(); i++ )
        {
            condition += "var=" + searchVariableCopy.get( i ) + ":%20&";
        }
        
        return condition;
    }

}
