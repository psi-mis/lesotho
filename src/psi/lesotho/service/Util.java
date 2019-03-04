package psi.lesotho.service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.json.JSONArray;
import org.json.JSONObject;

public final class Util
{
    
//  public static String LOCATION_DHIS_SERVER = "http://localhost:8080/dhis";

    //// https://data.psi-mis.org
//    public static String LOCATION_DHIS_SERVER = "https://data.psi-mis.org";
    public static String LOCATION_DHIS_SERVER = "https://clone.psi-mis.org";
//    public static String LOCATION_DHIS_SERVER = "https://leap.psi-mis.org";
    public static final String ID_TRACKED_ENTITY = "XV3kldsZq0H";
//    
//    // https://sandbox.psi-mis.org
//    public static String LOCATION_DHIS_SERVER = "https://sandbox.psi-mis.org";
//    public static final String ID_TRACKED_ENTITY = "MCPQUTHX1Ze";


    
    public static String REQUEST_PARAM_USERNAME = "usr";
    public static String REQUEST_PARAM_PASSWORD = "pwd";

    // -------------------------------------------------------------------------
    // Key words
    // -------------------------------------------------------------------------
    
    // Login page
    public static final String KEY_FULLNAME = "fullName";
    public static final String KEY_LOGGED_SUCCESS = "logged";
    public static final String KEY_DHIS_SERVER = "dhisServer";
    public static final String KEY_LOGIN_USERNAME = "loginUsername";
    public static final String KEY_LOGIN_PASSWORD = "loginPassword";
    public static final String KEY_WORKER_ROLE = "workerRole";

    // Meta data
    public static final String KEY_METADATA_ALL = "all";
    public static final String KEY_METADATA_DISTRICTLIST = "districtList";
    public static final String KEY_METADATA_OULIST = "ouList";
    public static final String KEY_METADATA_ADD_PROGRAMSECTION = "addProgramSection";
    public static final String KEY_METADATA_UPDATE_PROGRAMSECTION = "updateProgramSection";
    public static final String KEY_METADATA_DELETE_PROGRAMSECTION = "deleteProgramSection";
        
    // -------------------------------------------------------------------------
    // Retrieve data
    
    public static final String KEY_TODAY_CASES = "todayCases";
    public static final String KEY_PREVIOUS_CASES = "previousCases";
    public static final String KEY_POSITIVE_CASES = "positiveCases";
    public static final String KEY_TODAY_FU = "todayFU";
    public static final String KEY_ALL_FU = "allFU";
    
    // Search
    public static final String KEY_SEARCH_CASES = "search"; 
    public static final String KEY_SEARCH_TYPE = "searchType";  
    public static final String KEY_SEARCHTYPE_ALL = "all";
    public static final String KEY_SEARCHTYPE_POSITIVE = "positive"; 
    public static final String KEY_CLIENT_DETAILS = "details";
    public static final String KEY_FIND_PARTNER = "findPartner";
    
    public static final String KEY_GET_EVENT_DETAILS = "details";
    
    // Save data
    public static final String KEY_SAVE_CLIENT = "save";    
    public static final String KEY_SAVE_EVENT = "save"; 
    public static final String KEY_SAVE_PARTNER_CUIC = "savePartnerCUIC"; 
    
    // Reports
    public static final String KEY_GET_COUNSELLOR_REPORT = "counsellorReport";
    public static final String KEY_GET_COORDINATOR_REPORT = "coordinatorReport";
    
    // Translation
    public static String KEY_TRANSLATION_LIST = "keywordList";
    public static String KEY_TRANSLATION_VERSION = "version";
    

    public static String REQUEST_TYPE_GET = "GET";
    public static String REQUEST_TYPE_POST = "POST";
    public static String REQUEST_TYPE_PUT = "PUT";
    public static String REQUEST_TYPE_DELETE = "DELETE";


    public static String PAMAM_ORGUNIT_ID = "ouId";
    public static String PAMAM_CLIENT_ID = "clientId";
    public static String PAMAM_EVENT_ID = "eventId";
    public static String PAMAM_PARTNER_EVENT_ID = "partnerEventId";
    public static String PAMAM_DISTRICT_ID = "districtId";
    public static String PAMAM_PARTNER_CUIC = "partnerCUIC";
    public static String PAMAM_CLIENT_CUIC = "clientCUIC";
    public static String PAMAM_PARTNER_ID = "partnerId";
    public static String PAMAM_COUPLE_STAUTS = "coupleStatus";
    
    
    // -------------------------------------------------------------------------
    // UIDs
    // -------------------------------------------------------------------------

    
    // Supper DHIS account
    public static String ACCESS_SERVER_USERNAME = "ls.webapp";
    public static String ACCESS_SERVER_PASSWORD = "Q57pAJ9V";
     
    // Translation Ids
    // public static String KEY_TRANSLATION_KEYWORDS_PROJECT_ID = "98319"; // On Rodolfo account
    // public static String KEY_TRANSLATION_VERSION_PROJECT_ID = "95765"; // On Rodolfo account
    public static String KEY_TRANSLATION_KEYWORDS_PROJECT_ID = "102649"; // Tran account
    public static String KEY_TRANSLATION_VERSION_PROJECT_ID = "102655"; // Tran account
    
    // Orgunit Ids
    public static final String ROOT_ORGTUNIT = "FvUGp8I75zV";    
    public static final String ROOT_ORGTUNIT_LESOTHO = "vJNI6blhosr"; 
    public static final String REGISTER_DISTRICT_LEVEL = "4";
    
    // Program Ids
    public static final String ID_PROGRAM = "KDgzpKX3h2S";
    public static final String ID_STAGE = "lVglvBnE3TY";
    
    // Category Ids
    public static final String USER_CATEGORY_ID = "qVl8p3w3fI5";
    public static final String USER_CATEGORY_PIN_ATRIBUTE_ID = "WgOzQa7KDTV";
    public static final String USER_CATEGORY_WORKER_ROLE_ATRIBUTE_ID = "aXv3j7whLvA";
    
    // Attribute Ids
    public static final String CLIENT_ATTR_ID_CUIC = "rw3W9pDCPb2";
    public static final String ID_ATTR_FIRSTNAME = "R9Lw1uNtRuj";
    public static final String ID_ATTR_LASTNAME = "TBt2a4Bq0Lx";
    public static final String ID_ATTR_DOB = "BvsJfkddTgZ";
    public static final String ID_ATTR_DISTRICTOB = "u57uh7lHwF8";
    public static final String ID_ATTR_CLIENT_CUIC = "rw3W9pDCPb2";
    public static final String ID_ATTR_BIRTHORDER ="vTPYC9BXPNn";
    
    
    public static final String ID_ATTR_HIV_TEST_PARTNER_OPTION ="HJQvtlJOmQm";
    public static final String ID_ATTR_HIV_TEST_PARTNER_CUIC = "s192aFpfWbW";   
    public static final String ID_ATTR_HIV_TEST_FINAL_RESULT = "PoTcUsGrIbS";
    public static final String ID_ATTR_HIV_TEST_FINAL_RESULT_EVENTDATE = "AcpKX4a2iAx";
    public static final String ID_ATTR_HIV_TEST_FINAL_RESULT_CATOPT = "hkf4GS79Sul";
    public static final String ID_ATTR_HIV_TESTING_EVENT_NUMBER = "Y1pdU5TSGrB";

//    public static final String ID_ATTR_HAS_CONTACT_LOG_INFOR = "i1NpXcIwfes";
//
//    public static final String ID_ATTR_CONTACTLOGEVENT_DATE = "L5NZ7vuyLe7";
//    public static final String ID_ATTR_CONTACTLOGEVENT_USERNAMES ="L9SC2lA8eWg";
//    
//    public static final String ID_ATTR_ARTCLOSURE_DATE = "D7CpzDGAPpy";
//    public static final String ID_ATTR_ARTCLOSURE_USERNAMES = "YhfhMtu82Pr";
    


    // DE Ids
    public static final String ID_DE_PARTNER_CUIC = "UYyCL2xz8Wz";
    public static final String ID_DE_PARTNER_EVENTID = "UV2AsoZJ7fw";
    public static final String ID_DE_COPUPLE_STATUS = "Umu8i2QXCZk";
    
    
    // SQL Views
    public static final String ID_SQLVIEW_LOAD_TODAY_CASE = "IdFgIYoRINL";
    public static final String ID_SQLVIEW_LOAD_POSITIVE_CASE = "mayPuvHkJ7G";
    public static final String ID_SQLVIEW_LOAD_FUCASE_BY_USERNAME = "llbPbszABjd";
    public static final String ID_SQLVIEW_LOAD_FUCASE_ALL = "I8xOsd6qfyh";

    public static final String ID_SQLVIEW_SEARCH_CLIENTS = "zPJW0n6mymH";
    public static final String ID_SQLVIEW_SEARCH_POSITIVE_CLIENTS = "aUc8BV6Ipmu";

    public static final String ID_SQLVIEW_FIND_PARTNER = "SKI1rT5vA3m";
    public static final String ID_SQLVIEW_FIND_PARTNER_BY_EVENTID = "aZX9hTaN0aj";
    
    // --------------------------------------------------------------------------------------------------------------
    // HTTPS GET/POST/PUT request
    // --------------------------------------------------------------------------------------------------------------

    // Convert InputStream to String
    public static JSONObject getJsonFromInputStream( InputStream is )
    {
        BufferedReader br = null;
        StringBuilder sb = new StringBuilder();

        String line;
        try
        {
            br = new BufferedReader( new InputStreamReader( is ) );
            while ( (line = br.readLine()) != null )
            {
                sb.append( line );
            }
        }
        catch ( IOException e )
        {
            e.printStackTrace();
        }
        finally
        {
            if ( br != null )
            {
                try
                {
                    br.close();
                }
                catch ( IOException e )
                {
                    e.printStackTrace();
                }
            }
        }
        
        JSONObject jsonData = new JSONObject( sb.toString() );
        return jsonData;
    }

    public static ResponseInfo sendRequest( String requestType, String url, JSONObject jsonData,
        Map<String, Object> params )
        throws Exception, IOException
    {

        System.out.println( "\n\n ====== \n requestUrl : " + url );

        String username = Util.ACCESS_SERVER_USERNAME;
        String password = Util.ACCESS_SERVER_PASSWORD;   
        ResponseInfo responseInfo = new ResponseInfo();
        StringBuffer responseMsg = new StringBuffer();
        
        // 2. Open HttpsURLConnection and Set Request Type.
        URL obj = new URL( url );

        try
        {
            if ( obj.getProtocol().equals( "https" ) )
                responseInfo = Util.sendRequestHTTPS( responseInfo, responseMsg, requestType, url, jsonData, params,
                    username, password );
            else
                responseInfo = Util.sendRequestHTTP( responseInfo, responseMsg, requestType, url, jsonData, params,
                    username, password );
        }
        catch ( Exception ex )
        {
            responseMsg.append( "{ \"msg\": \"DHIS reponse code: " + responseInfo.responseCode
                + ", No Message - Error occurred during DHIS response processing: " + responseMsg.toString() + "\" }" );
        }

        responseInfo.output = responseMsg.toString();

        return responseInfo;
    }

    private static ResponseInfo sendRequestHTTP( ResponseInfo responseInfo, StringBuffer responseMsg,
        String requestType, String url, JSONObject jsonData, Map<String, Object> params, String username,
        String password )
        throws Exception, IOException
    {
        // responseInfo.sendStr = bodyMessage;
        responseInfo.data = jsonData;

        // 2. Open HttpsURLConnection and Set Request Type.
        URL obj = new URL( url );
        // Since HttpsURLConnection extends HttpURLConnection, we can use this
        // for both HTTP & HTTPS?
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        // add Request header
        con.setRequestMethod( requestType );

        con.setRequestProperty( "User-Agent",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11" );
        con.setRequestProperty( "Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" );
        con.setRequestProperty( "Accept-Language", "en-US,en;q=0.5" );
        con.setRequestProperty( "Content-Type", "application/json; charset=utf-8" );
        
        String userpass = username + ":" + password;
        String basicAuth = "Basic " + new String( new Base64().encode( userpass.getBytes() ) );
        con.setRequestProperty( "Authorization", basicAuth );

        // 3. Body Message Received Handle
        if ( jsonData != null && jsonData.length() > 0 )
        {
            // Send post request
            con.setDoOutput( true );
            /* DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
            wr.writeBytes( jsonData.toString() );
            wr.flush();
            wr.close(); */
            
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(con.getOutputStream(), "UTF-8"));
            bw.write(jsonData.toString());
            bw.flush();
            bw.close();
        }

        if ( params != null && !params.isEmpty() )
        {
            StringBuilder postData = new StringBuilder();
            for ( Map.Entry<String, Object> param : params.entrySet() )
            {
                if ( postData.length() != 0 )
                    postData.append( '&' );

                postData.append( URLEncoder.encode( param.getKey(), "UTF-8" ) );
                postData.append( '=' );
                postData.append( URLEncoder.encode( String.valueOf( param.getValue() ), "UTF-8" ) );
            }

            byte[] postDataBytes = postData.toString().getBytes( "UTF-8" );

            con.setDoOutput( true );

            DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
            wr.write( postDataBytes );
            wr.flush();
            wr.close();
        }

        // 4. Send and get Response
        responseInfo.responseCode = con.getResponseCode();

        // 5. Other response info
        if ( con.getResponseCode() == HttpURLConnection.HTTP_OK ) 
        {
            BufferedReader in = new BufferedReader( new InputStreamReader( con.getInputStream(), "UTF-8" ) );

            String inputLine;
            while ( (inputLine = in.readLine()) != null )
            {
                responseMsg.append( inputLine );
            }

            in.close();
            
        } else 
        {
             String json = Util.readStream(con.getErrorStream());
             responseMsg.append( json );
        }

        responseInfo.data = new JSONObject( responseMsg.toString() );

        return responseInfo;
    }

    private static ResponseInfo sendRequestHTTPS( ResponseInfo responseInfo, StringBuffer responseMsg,
        String requestType, String url, JSONObject jsonData, Map<String, Object> params, String username,
        String password )
        throws Exception, IOException
    {
        // responseInfo.sendStr = bodyMessage;
        responseInfo.data = jsonData;

        // 2. Open HttpsURLConnection and Set Request Type.
        URL obj = new URL( url );
        // Since HttpsURLConnection extends HttpURLConnection, we can use this
        // for both HTTP & HTTPS?
        HttpsURLConnection con = (HttpsURLConnection) obj.openConnection();

        // add Request header
        con.setRequestMethod( requestType );

        con.setRequestProperty( "User-Agent",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11" );
        con.setRequestProperty( "Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" );
        con.setRequestProperty( "Accept-Language", "en-US,en;q=0.5" );
        con.setRequestProperty( "Content-Type", "application/json; charset=utf-8" );

        String userpass = username + ":" + password;
        String basicAuth = "Basic " + new String( new Base64().encode( userpass.getBytes() ) );
        con.setRequestProperty( "Authorization", basicAuth );

        
        // 3. Body Message Received Handle
        if ( jsonData != null && jsonData.length() > 0 )
        { 
            // Send post request
            con.setDoOutput( true );
            
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(con.getOutputStream(), "UTF-8"));
            bw.write(jsonData.toString());
            bw.flush();
            bw.close();
        }
    
        if ( params != null && !params.isEmpty() )
        { 
            StringBuilder postData = new StringBuilder();
            for ( Map.Entry<String, Object> param : params.entrySet() )
            {
                if ( postData.length() != 0 )
                    postData.append( '&' );

                postData.append( URLEncoder.encode( param.getKey(), "UTF-8" ) );
                postData.append( '=' );
                postData.append( URLEncoder.encode( String.valueOf( param.getValue() ), "UTF-8" ) );
            }

            byte[] postDataBytes = postData.toString().getBytes( "UTF-8" );

            con.setDoOutput( true );

            DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
            wr.write( postDataBytes );
            wr.flush();
            wr.close();
        }
        // 4. Send and get Response
        responseInfo.responseCode = con.getResponseCode();

        // 5. Other response info
        if ( con.getResponseCode() < 400 ) 
        {
            BufferedReader in = new BufferedReader( new InputStreamReader( con.getInputStream(), "UTF-8" ) );

            String inputLine;
            while ( (inputLine = in.readLine()) != null )
            {
                responseMsg.append( inputLine );
            }
            
            in.close();

        } else 
        {
             String json = Util.readStream(con.getErrorStream());
             responseMsg.append( json );
        }

        responseInfo.data = new JSONObject( responseMsg.toString() );

        return responseInfo;
    }

    private static String readStream(InputStream stream) throws Exception {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = in.readLine()) != null) {
                builder.append(line); // + "\r\n"(no need, json has no line breaks!)
            }
            in.close();
        }
        
        return builder.toString();
    }
    
    public static void respondMsgOut( ResponseInfo responseInfo, HttpServletResponse response )
        throws IOException, Exception
    {
        response.setContentType( "application/json" );
        response.setStatus( responseInfo.responseCode );
        
        PrintWriter out = response.getWriter();
        out.print( responseInfo.outMessage );
        out.flush();
    }

    // --------------------------------------------------------------------------------------------------------------
    // Util Data
    // --------------------------------------------------------------------------------------------------------------

    private static Date getCurrentDateObj()
    {
        ZonedDateTime now = ZonedDateTime.now( ZoneOffset.UTC );
        Date date = new Date( now.getYear() - 1900, now.getMonthValue() - 1, now.getDayOfMonth(), now.getHour(), now.getMinute(), now.getSecond() );
        return date;
    }
    
    public static String getCurrentDate()
    {
        return Util.formatDate( Util.getCurrentDateObj() );
    }

    public static String getCurrentDateTime()
    {
       return Util.formatDateTime( Util.getCurrentDateObj() );
    }

    public static String getXLastDate( int noDays )
    {
        Date date = DateUtils.addDays( Util.getCurrentDateObj(), -noDays);        
        return formatDate( date );
    }

    public static String getXLastMonth( int noMonths )
    {
        Date now = Util.getCurrentDateObj();
        Date date = DateUtils.addMonths( now, -noMonths );
        return formatDate( date );
    }

    public static String formatDate( Date date )
    {
        int year = date.getYear() + 1900;
        int month = date.getMonth() + 1;
        int day = date.getDate();

        String monthStr = (month < 10) ? "0" + month : "" + month;
        String dayStr = (day < 10) ? "0" + day : "" + day;

        return year + "-" + monthStr + "-" + dayStr;
    }

    public static String formatDateTime( Date date )
    {
        int hours = date.getHours();
        int minutes = date.getMinutes();
        int seconds = date.getSeconds();

        String hoursStr = (hours < 10) ? "0" + hours : "" + hours;
        String minutesStr = (minutes < 10) ? "0" + minutes : "" + minutes;
        String secondsStr = (seconds < 10) ? "0" + seconds : "" + seconds;
        
        return Util.formatDate( date ) + "T" + hoursStr + ":" + minutesStr + ":" + secondsStr;
    }

    // --------------------------------------------------------------------------------------------------------------
    // Utilitizes
    // --------------------------------------------------------------------------------------------------------------

    public static String outputImportResult( String output, String summaryType )
    {
        String referenceId = "";

        JSONObject rec = null;

        JSONObject recTemp = new JSONObject( output );
        if ( summaryType != null && summaryType.equals( "importSummaries" ) )
        {
            if ( recTemp.has( "response" ) )
            {
                JSONObject response = recTemp.getJSONObject( "response" );

                if ( response.has( "importSummaries" ) )
                {
                    JSONArray importSummaries = response.getJSONArray( "importSummaries" );
                    rec = importSummaries.getJSONObject( 0 );
                }
            }
        }
        else
        {
            if ( recTemp.has( "response" ) )
            {
                rec = recTemp.getJSONObject( "response" );
            }
        }

        if ( rec != null && rec.has( "status" ) && rec.getString( "status" ).equals( "SUCCESS" ) )
        { 
            if( rec.has( "importSummaries" ) )
            {
                JSONObject importSummaries = rec.getJSONArray( "importSummaries" ).getJSONObject( 0 );
                if ( importSummaries.has( "reference" ) )
                {
                    referenceId = importSummaries.getString( "reference" );
                }
            }
            else if ( rec.has( "reference" ) )
            {
                    referenceId = rec.getString( "reference" );
            }
        }

        return referenceId;
    }

    public static void processResponseMsg( ResponseInfo responseInfo, String importSummaryCase )
    {
        if ( responseInfo.responseCode >= 400 )
        {
            // If error occured, display the output as it is (received from
            // DHIS).
            // Set return Msg
            responseInfo.outMessage = responseInfo.output;
        }
        else
        {
            // Set return Msg
            responseInfo.referenceId = Util.outputImportResult( responseInfo.output, importSummaryCase );
            responseInfo.outMessage = "{ \"id\": \"" + responseInfo.referenceId + "\" }";
        }
    }
    
}
