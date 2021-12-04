package psi.projName.classes;

import java.net.HttpURLConnection;
import java.util.Map;

import org.apache.tomcat.util.codec.binary.Base64;
import org.json.JSONArray;
import org.json.JSONObject;
import psi.projName.classes.utils.*;

public class DataStore {

    // ===========================
    // --- Variables ------------

	// Request Data
	public String requestType = "";		// POST/GET/PUT/DELETE
	public String requestUrl = "";	
	public JSONObject requestInputJson = null;
	
	
	// Extra Request Data parameters
	public String username = "";
	public String password = "";
	public Map<String,Object> requestParams = null;
	public String sourceType = "";
	
	// Request data Extra var
	public int requestTimeout = Util.REQUEST_TIMEOUT; 
	public JSONArray requestHeaders = null;
	
	
	// Response Data
	public int responseCode = 0;
	public String output = "";		
	public String outMessage = "";
	public JSONObject outputJson = null;
	public String referenceId = "";
		
	public String errorMsg = "";  // Might be collection
	

    // ===========================
    // --- Constructor ------------
    
	public DataStore()
    {
        super();
    }    
        
	public DataStore( String requestType, String requestUrl, JSONObject requestInputJson, String sourceType )
    {
        super();
        this.requestType = requestType;
        this.requestUrl = requestUrl;
        this.requestInputJson = requestInputJson;
        this.sourceType = sourceType;        
    }    
	
    // ===========================
    // --- Print Out ------------
	
    @Override
	public String toString() {
		return "DataStore: responseCode=" + responseCode + ", output="
				+ ", requestUrl=" + requestUrl				
				+ ", inputJson=" + JsonUtil.jsonToStr( requestInputJson )
				+ ", outputJson=" + JsonUtil.jsonToStr( outputJson );		
	}	
    
	
    // ===========================
    // --- Other Methoeds ------------
	
    // preMsgStr - Util.sendRequest [REQUEST]
    public void sendRequestDebug( boolean debugFlag, String preMsgStr )
    {
    	Util.output( preMsgStr + "[" + requestType + "] ReqeustUrl: " + requestUrl );
        if ( requestInputJson != null ) Util.output( preMsgStr + " RequestInputJson: " + requestInputJson.toString() );    	
    }    
    
	// ---------------------------------------------
	// ------ Request Header Override Related ----------------
		
	public void setRequestHeader_ContentType( String value )
	{
		if ( requestHeaders == null ) requestHeaders = new JSONArray();
	
		JSONObject newHeader = new JSONObject();
		newHeader.put( "headerType", "Content-Type" );
		newHeader.put( "value", value );
		
		requestHeaders.put( newHeader );
	}
	
	public void setRequestHeader_Auth( String value, String authType )
	{
		if ( requestHeaders == null ) requestHeaders = new JSONArray();

		String authStr = "";
		
		if ( authType == "BasicAuth" )
		{
	        //String userpass = username + ":" + password;
			authStr = "Basic " + new String( new Base64().encode( value.getBytes() ) );			
		}
		else if ( authType == "BearerToken" )
		{
			authStr = "Bearer " + value;
			//Bearer a8bed213959117397f78176b6d3608b694d20a3d
		}
		

		JSONObject newHeader = new JSONObject();
		newHeader.put( "headerType", "Authorization" );		
		newHeader.put( "value", authStr );
		
		requestHeaders.put( newHeader );
	}
	
	public void setRequestHeader_Custom( String headerType, String value )
	{
		if ( requestHeaders == null ) requestHeaders = new JSONArray();
		
		JSONObject newHeader = new JSONObject();
		newHeader.put( "headerType", headerType );		
		newHeader.put( "value", value );
		
		requestHeaders.put( newHeader );		
	}
	
	public void applyRequestHeaders( HttpURLConnection con )
	{
		// this.requestHeaders != null )
		if ( requestHeaders != null )
		{
			for ( int i = 0; i < requestHeaders.length(); i++ )
			{
				JSONObject jsonHeader = requestHeaders.getJSONObject( i );
				
				String headerType = JsonUtil.getJSONStrVal( jsonHeader, "headerType" );
				String value = JsonUtil.getJSONStrVal( jsonHeader, "value" );

				con.setRequestProperty( headerType, value );					
			}			
		}		
	}

	// ------ End of Request Header Related ----------------
	// ---------------------------------------------
	
}
