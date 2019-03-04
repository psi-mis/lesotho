package psi.lesotho.service;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

public class MetaDataController
    extends HttpServlet
{
    private static final long serialVersionUID = 3387895500337476082L;

    private static String PARAM_DISTRICT_ID = "@PARAM_DISTRICT_ID";
    
    // -------------------------------------------------------------------------
    // URLs
    // -------------------------------------------------------------------------
    
    private static String URL_QUERY_LOAD_PROGRAM_STAGE_SECTIONS = Util.LOCATION_DHIS_SERVER + "/api/programs/" + Util.ID_PROGRAM + ".json?fields=programStages[id,name,programStageDataElements[compulsory,dataElement[id,formName,valueType,optionSet[id,name,options[code,name]]]],programStageSections[id,displayName,dataElements[id]]";
    private static String URL_QUERY_LOAD_ATTRIBUTE_GROUPS = Util.LOCATION_DHIS_SERVER + "/api/programSections.json?filter=code:like:LSHTC&paging=false&fields=id,name,code,programTrackedEntityAttribute[id,shortName,valueType,optionSet[id,name,options[code,name]]";
    private static String URL_QUERY_LOAD_PROGRAM_ATTRIBUTES = Util.LOCATION_DHIS_SERVER + "/api/programs/" + Util.ID_PROGRAM + ".json?fields=programTrackedEntityAttributes[mandatory,trackedEntityAttribute[id,name]]";
    private static String URL_QUERY_LOAD_ORGUNIT_CHILDREN =  Util.LOCATION_DHIS_SERVER + "/api/organisationUnits/" + MetaDataController.PARAM_DISTRICT_ID + ".json?fields=children[id,name,code]";
    private static String URL_QUERY_LOAD_ORGUNITS_BY_LEVEL =  Util.LOCATION_DHIS_SERVER + "/api/organisationUnits/" + Util.ROOT_ORGTUNIT_LESOTHO + ".json?includeDescendants=true&fields=id,name,code&filter=level:eq:" + Util.REGISTER_DISTRICT_LEVEL;
    private static String URL_QUERY_LOAD_ORGUNITS_BY_PROGRAM =  Util.LOCATION_DHIS_SERVER + "/api/programs/" + Util.ID_PROGRAM + ".json?fields=organisationUnits[id]";
    private static String URL_QUERY_GET_CATEGORY_OPTION_COMBO =  Util.LOCATION_DHIS_SERVER + "/api/categories/" + Util.USER_CATEGORY_ID + ".json?fields=categoryOptions[id,name,code]";
    private static String URL_QUERY_GET_TRACKEDENTITYATTRIBUTE =  Util.LOCATION_DHIS_SERVER + "/api/trackedEntityAttributes.json?fields=id,name,shortName&paging=false";
    
    private static String URL_QUERY_SAVE_PROGRAMSECTION =  Util.LOCATION_DHIS_SERVER + "/api/programSections";
    
    // -------------------------------------------------------------------------
    // POST method
    // -------------------------------------------------------------------------
   
    protected void doPost( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        try
        {
            ResponseInfo responseInfo = null;
            
            // STEP 1. Get username/password from session
            
            if ( request.getPathInfo() != null && request.getPathInfo().split( "/" ).length >= 2 )
            {

                String[] queryPathList = request.getPathInfo().split( "/" );
                String key = queryPathList[1];
                
                // Load All meta data
                if ( key.equals( Util.KEY_METADATA_ALL ) )
                {
                    StringBuffer outputData = new StringBuffer();
                    
                    responseInfo = MetaDataController.getAttributeGroups( );
                    
                    if( responseInfo.responseCode == 200 )
                    {
                        outputData.append( "\"attGroups\":" + responseInfo.output );

                        responseInfo = MetaDataController.getProgramAttributes(); 
                        if( responseInfo.responseCode == 200 )
                        {                       
                            outputData.append( ",\"programAttributes\":" + responseInfo.output );
                            
                            responseInfo = MetaDataController.getSections();
                            if( responseInfo.responseCode == 200 )
                            {
                                outputData.append( ",\"sections\":" + responseInfo.output );
                                
                                responseInfo = MetaDataController.getOrgUnitListInL4();
                                if( responseInfo.responseCode == 200 )
                                {
                                    outputData.append( ",\"districts\":" + responseInfo.output );
                                    
                                    responseInfo = MetaDataController.getCatOptionCombos();
                                    if( responseInfo.responseCode == 200 )
                                    {
                                        outputData.append( ",\"catOptions\":" + responseInfo.output );
                                        
                                        responseInfo = MetaDataController.getTrackedEntityAttributes();
                                        if( responseInfo.responseCode == 200 )
                                        {
                                            outputData.append( ",\"attributes\":" + responseInfo.output );
                                        }   
                                        
                                    }
                                }
                            }
                           
                        }
                    }
                    
                    responseInfo.output = "{" + outputData.toString() + "}";
                }
                // Load district List only
                else if ( key.equals( Util.KEY_METADATA_DISTRICTLIST ) )
                {
                     responseInfo = MetaDataController.getOrgUnitListInL4();
                }
                // Load orgUnit List only
                else if ( key.equals( Util.KEY_METADATA_OULIST ) )
                {
                    String districtId = request.getParameter( "districtId" );
                    responseInfo = MetaDataController.getOrgUnitList( districtId );
                }
                // Add ProgramSection
                else if ( key.equals( Util.KEY_METADATA_ADD_PROGRAMSECTION ) )
                {
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );
                    responseInfo = MetaDataController.addProgramSection( receivedData );
                }  
                // Update ProgramSection
                else if ( key.equals( Util.KEY_METADATA_UPDATE_PROGRAMSECTION ) )
                {
                    JSONObject receivedData = Util.getJsonFromInputStream( request.getInputStream() );
                    responseInfo = MetaDataController.updateProgramSection( receivedData );
                }
                // Delete ProgramSection
                else if ( key.equals( Util.KEY_METADATA_DELETE_PROGRAMSECTION ) )
                {
                    String id = request.getParameter( "id" );
                    responseInfo = MetaDataController.deleteProgramSection( id );
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

     
    
    private static ResponseInfo getSections()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_LOAD_PROGRAM_STAGE_SECTIONS;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    private static ResponseInfo getAttributeGroups()
    {
        ResponseInfo responseInfo = null;
        try
        {
            // The groups which start with 'LSHTC_Register_' are in [Client Attribute] tab
            // The groups which start with 'LSHTC_LOG_' are in [Contact Log] tab
            String url = MetaDataController.URL_QUERY_LOAD_ATTRIBUTE_GROUPS;
            
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    private static ResponseInfo getProgramAttributes()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_LOAD_PROGRAM_ATTRIBUTES;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    private static ResponseInfo getOrgUnitList( String districtId )
    {
        ResponseInfo responseInfo = MetaDataController.getOrgUnitListInL5( districtId );
        if( responseInfo.responseCode == 200 )
        {
            JSONArray l5OuList =  responseInfo.data.getJSONArray( "children" );
            responseInfo = MetaDataController.getOrgUnitListInProgram();
            if( responseInfo.responseCode == 200 )
            {
                JSONArray programOuList = responseInfo.data.getJSONArray( "organisationUnits" );
                JSONArray ouList = new JSONArray();
                
                for( int i = 0; i< l5OuList.length(); i++ )
                {
                    JSONObject ou = l5OuList.getJSONObject( i );
                    for( int j = 0; j< programOuList.length(); j++ )
                    {
                        String checkedId = programOuList.getJSONObject( j ).getString( "id" );
                        if( ou.getString( "id" ).equals( checkedId ) )
                        {
                            ouList.put( ou );
                        }
                    }
                }
                
                JSONObject result = new JSONObject();
                result.put( "organisationUnits", ouList );
                
                responseInfo.data = result;
                responseInfo.output = result.toString();
            }
        }
        
        return responseInfo;
    }

    private static ResponseInfo getOrgUnitListInL5( String districtId )
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_LOAD_ORGUNIT_CHILDREN;
            System.out.println("\n\n === url 1 : " + url );
            url = url.replace( MetaDataController.PARAM_DISTRICT_ID, districtId );
            System.out.println("\n\n === url 2 : " + url );

            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            System.out.println("\n\n === ex : " + ex.getMessage() );
            ex.printStackTrace();
        }
        
        return responseInfo;
    }
    
    private static ResponseInfo getOrgUnitListInL4()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_LOAD_ORGUNITS_BY_LEVEL;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }
        
        return responseInfo;
    }
    
    private static ResponseInfo getOrgUnitListInProgram()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_LOAD_ORGUNITS_BY_PROGRAM;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }
        
        return responseInfo;
    }

    private static ResponseInfo getCatOptionCombos()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_GET_CATEGORY_OPTION_COMBO;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo getTrackedEntityAttributes()
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_GET_TRACKEDENTITYATTRIBUTE;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_GET, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
   
    private static ResponseInfo addProgramSection( JSONObject receivedData )
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_SAVE_PROGRAMSECTION;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_POST, url, receivedData, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo updateProgramSection( JSONObject receivedData )
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_SAVE_PROGRAMSECTION + "/" + receivedData.getString("id");
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_PUT, url, receivedData, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }

    private static ResponseInfo deleteProgramSection( String id )
    {
        ResponseInfo responseInfo = null;
        try
        {
            String url = MetaDataController.URL_QUERY_SAVE_PROGRAMSECTION + "/" + id;
            responseInfo = Util.sendRequest( Util.REQUEST_TYPE_DELETE, url, null, null );
        }
        catch ( Exception ex )
        {
            ex.printStackTrace();
        }

        return responseInfo;
    }
    
    

}
