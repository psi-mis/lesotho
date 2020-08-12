package psi.lesotho.service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
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
    private static final String URL_QUERY_CLIENT_DETAILS = Util.LOCATION_DHIS_SERVER + "/api/trackedEntityInstances/" + ClientController.PARAM_CLIENT_ID + ".json?program=" + Util.ID_PROGRAM + "&fields=*";
    private static final String URL_ADD_RELATIONSHIP = Util.LOCATION_DHIS_SERVER + "/api/relationships/";

        
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
                        JSONObject clientData = responseInfo.data;
                        JSONObject checkEQCFistname = getAttributeValue( clientData, Util.ID_ATTR_FIRSTNAME );

                        JSONArray enrollmentList = new JSONArray( clientData.getJSONArray( "enrollments" ).toString() );
                        clientData.remove( "enrollments" );
                        outputData = "\"client\":" + clientData.toString();

                        if( !checkEQCFistname.getString( "value" ).equals("EQC") )
                        {
                            outputData += ",\"enrollments\":" + enrollmentList.toString();

                          // STEP 2.2.1 Get active event
                          JSONObject latestEnrollment = ClientController.getLatestEnrollments( enrollmentList );
                          if( latestEnrollment != null )
                          {
                              JSONArray eventList = latestEnrollment.getJSONArray( "events" );
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
                          }
                          
                        }
                        else
                        {
                            outputData += ",\"enrollments\":[]";
                        }
                        
                        outputData = "{" + outputData + "}";
                        responseInfo.output = outputData; 
                    }
                }
                // STEP 2.3. Add / Update Client
                else if ( key.equals( Util.KEY_SAVE_CLIENT ) )
                {
                    String clientId = request.getParameter( Util.PAMAM_CLIENT_ID );
                    String ouId = request.getParameter( Util.PAMAM_ORGUNIT_ID );
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );

                    responseInfo = ClientController.saveClient( clientId, ouId, receivedData );
                }
                else if( key.equals( Util.KEY_ADD_RELATIONSHIP ))
                {
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );
                    
                    String clientAId = receivedData.getString( "clientAId" );
                    String clientBId = null;
                    if( receivedData.has( "clientBId" ) )
                    {
                        clientBId = receivedData.getString( "clientBId" );
                    }
                    String ouId = receivedData.getString( Util.PAMAM_ORGUNIT_ID );
                    String relationshipType = receivedData.getString( "relationshipType" );
                    String loginUsername = receivedData.getString( "loginUsername" );
                    
                    // Save Or Update client
                    responseInfo = ClientController.saveRelationshipClient( clientBId, ouId, receivedData.getJSONObject( "client" ) );
                    
                    clientBId = responseInfo.data.getString("trackedEntityInstance");
//                    if( !responseInfo.data.has( "relationships" ) )
//                    {
//                        responseInfo.data.put( "relationships", new JSONArray() );
//                    }
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        // Add relationship
                        ResponseInfo responseInfo_Relationship = ClientController.addRelationship( clientAId, clientBId, relationshipType );
                    
                        // Add new event for "HIVTest" and "ContactLog" if any
                        if( responseInfo_Relationship.responseCode == 200 
                            && receivedData.has( Util.ID_STAGE ) )
                        {
                            EventController.createRelationEvents( receivedData, clientBId, ouId, loginUsername );
                            
//                            responseInfo.data.getJSONArray( "relationships" ).put( responseInfo_Relationship.inputData );
                        }
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
    
    private static ResponseInfo saveClient( String clientId, String ouId, JSONObject attributes ) throws IOException, Exception
    {
        ResponseInfo responseInfo;
        
        // Update client
        if( clientId != null )
        {
            responseInfo = ClientController.updateClient( clientId, attributes );
            responseInfo.data.put( "trackedEntityInstance", clientId );
        }
        // Add client
        else
        {
            responseInfo = ClientController.createClient( attributes, ouId );
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
        
        return responseInfo;
    }
    

    private static ResponseInfo saveRelationshipClient( String clientId, String ouId, JSONObject clientData ) throws IOException, Exception
    {
        ResponseInfo responseInfo;

        // Update client
        if( clientId != null )
        {
            responseInfo = ClientController.updateAttrValues( clientId, clientData.getJSONArray( "attributes" ), ouId );
        }
        // Add client
        else
        {
            responseInfo = ClientController.createClient( clientData, ouId );

            responseInfo.data = responseInfo.inputData;
            if ( responseInfo.responseCode == 200 )
            {
                // Enroll client
                clientId = responseInfo.referenceId;
                responseInfo.data.put( "trackedEntityInstance", clientId );

                ResponseInfo responseInfo_Enrollment = ClientController.enrollClient( clientId, ouId );
                responseInfo.data.put( "enrollments", responseInfo_Enrollment.inputData );

                responseInfo.output = responseInfo.data.toString();
            }

        }

System.out.println( "\n\n === saveRelationshipClient : " + responseInfo.data.toString() );
        
        return responseInfo;
    }
    
    private static JSONObject generateRelationshipJsonData( String clientAId, String clientBId, String relationshipTypeId )
    {
        JSONObject jsonData_From = new JSONObject();
        jsonData_From.put( "trackedEntityInstance", ( new JSONObject() ).put( "trackedEntityInstance", clientAId )  );
        
        JSONObject jsonData_To = new JSONObject();
        jsonData_To.put( "trackedEntityInstance", ( new JSONObject() ).put( "trackedEntityInstance", clientBId )  );
        
        JSONObject jsonData = new JSONObject();
        jsonData.put( "relationshipType", relationshipTypeId );
        jsonData.put( "from", jsonData_From );
        jsonData.put( "to", jsonData_To );
        
        return jsonData;
    }

    private static ResponseInfo addRelationship( String clientAId, String clientBId, String relationshipTypeId )
    {
        ResponseInfo responseInfo = null;

        try
        {
            JSONObject jsonData = ClientController.generateRelationshipJsonData( clientAId, clientBId, relationshipTypeId );
            
            String requestUrl = ClientController. URL_ADD_RELATIONSHIP;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_POST, requestUrl, jsonData, null );
        }
        catch ( Exception ex )
        {
            System.out.println( "Exception: " + ex.toString() );
        }

        return responseInfo;
    }

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
    
    public static ResponseInfo updateAttrValues( String clientId, JSONArray updatedAttrValueList, String ouId )
        throws IOException, Exception
    {
        ResponseInfo responseInfo = null;

        try
        {
            responseInfo = ClientController.getClientById( clientId );
            JSONObject clientData = responseInfo.data;
            JSONArray clientAttrValues = clientData.getJSONArray( "attributes" );
            for( int i=0; i< updatedAttrValueList.length(); i++ )
            {
                JSONObject updatedAttrValue = updatedAttrValueList.getJSONObject( i );
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
            
            
            JSONArray enrollements = clientData.getJSONArray( "enrollments" );
            if( ClientController.checkEnrollmentForProgram( enrollements, Util.ID_PROGRAM ) )
            {
                ResponseInfo responseInfo_Enrollment = ClientController.enrollClient(clientId, ouId );
                
                clientData.put( "enrollments", responseInfo_Enrollment.inputData );
            }
            
            responseInfo.data = clientData;
            responseInfo.output = clientData.toString();
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
    
    private static JSONObject getAttributeValue( JSONObject clientData, String attrId )
    {
        JSONArray attributeValues = clientData.getJSONArray( "attributes" );
        for(int i=0; i<attributeValues.length(); i++ )
        {
            JSONObject attributeValue = attributeValues.getJSONObject( i );
            if( attributeValue.getString( "attribute" ).equals( attrId ) )
            {
                return attributeValue;
            }
        }
        
        return null;
    }
    
    public static JSONObject getLatestEnrollments( JSONArray enrollements ) throws JSONException, ParseException
    {
        if( enrollements.length() > 0 )
        { 
            // Get "Active" enrollment if any
            JSONArray foundItems_LSEnrollements = Util.findItemFromList( enrollements, "program", Util.ID_PROGRAM );
            if( foundItems_LSEnrollements.length() == 0 )
            {
                return null;
            }
            if( foundItems_LSEnrollements.length() == 1 )
            {
                return foundItems_LSEnrollements.getJSONObject( 0 );
            }
            else
            {
                JSONArray foundItems = Util.findItemFromList( foundItems_LSEnrollements, "status", "ACTIVE" );
                if( foundItems.length() > 0 ) // Get "Active" enrollment if any
                {
                    return foundItems.getJSONObject( 0 );
                }
                else // Find the latest enrollment by "enrollmentDate"
                {
                    // If not active enrollment exitst, Get latest enrollment
                    JSONObject latestEnrollment = foundItems_LSEnrollements.getJSONObject( 0 );

                    SimpleDateFormat format = new SimpleDateFormat("dd-MM-yyyy");
                    Date enrolllmentDate = format.parse( latestEnrollment.getString( "enrollmentDate" ).substring( 0,  10 ) );
                    for(int i=1; i<foundItems_LSEnrollements.length(); i++ )
                    {
                        JSONObject temp = foundItems_LSEnrollements.getJSONObject( i );
                        Date tempDate = format.parse( temp.getString( "enrollmentDate" ).substring( 0,  10 ) );

                        if ( enrolllmentDate.compareTo( tempDate ) <= 0) 
                        {
                            latestEnrollment = temp;
                            enrolllmentDate = tempDate;
                        }
                    }
                    
                    return latestEnrollment;
                }
            }
        }
           
        return null;
    }
    
    public static boolean checkEnrollmentForProgram( JSONArray enrollements, String programId ) throws JSONException, ParseException
    {
        JSONArray foundEnrollments = Util.findItemFromList( enrollements, "program", programId );
        
        if( foundEnrollments.length() > 0 )
        {
            JSONArray foundItems = Util.findItemFromList( foundEnrollments, "status", "ACTIVE" );
            return ( foundItems.length() > 0 );
        }
        
        return false;
    }

}
