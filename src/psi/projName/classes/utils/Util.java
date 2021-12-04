package psi.projName.classes.utils;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.codec.binary.Base64;
import org.json.JSONObject;

import psi.projName.classes.*;

public class Util {
		
	public static final String VERSION_NO = "1.18.0"; // restructure code (simple & layered), Incoming sms
	public static final String VERSION_STR = "v " + VERSION_NO; // restructure code (simple & layered), Incoming sms
		
	public static final String REQUEST_TYPE_GET = "GET";
	public static final String REQUEST_TYPE_POST = "POST";
	public static final String REQUEST_TYPE_PUT = "PUT";
	public static final String REQUEST_TYPE_DELETE = "DELETE";	

	public static final int REQUEST_TIMEOUT = 240000;	// 4 min

	public static final String ENCODING_UTF8 = "UTF-8";
	
	public static boolean WS_DEV = false;

    public static boolean DEBUG_FLAG = false;
	// ===========================================
    	
	public static final String REQUEST_CONTENT_TYPE_BASIC_AUTH = "basicAuth";	
	
	// ============================================================
	
    public Util() {
        //super();
        // TODO Auto-generated constructor stub
    }

	// =============================================================
	

	// ====================================================
	// ============ DHIS RELATED ===============

	public static String sendRequest( DataStore dataStore ) throws Exception
	{					
		try
		{						
			// HTTPS is also handled by HTTP - 'HttpsURLConnection' extends HttpURLConnection'
			Util.sendRequestHTTP( dataStore );
			Util.output( "Util.sendRequest [RESPONSE]: " + dataStore.output );

			
			if ( dataStore.responseCode >= 400 )
			{				
				dataStore.errorMsg = dataStore.output;
				
				throw new Exception( "Error responseCode returned, " + dataStore.responseCode + ", msg: " + dataStore.errorMsg );
			}						
		}
		catch( Exception ex )
		{
			String errMsg = "SendRequest, responseCode: " + dataStore.responseCode + ", Msg: " + ex.getMessage();
			Util.outputErr( "ERROR on Util.sendRequest, " + errMsg + " - " + ex.getMessage() );

			throw ex;
		}		
		
		return dataStore.output;
	}	
	

	// HTTPS GET/POST/PUT request
	private static void sendRequestHTTP( DataStore dataStore )  throws Exception
	{
		//StringBuilder responseMsgTemp = new StringBuilder();
		try
		{		
		    dataStore.sendRequestDebug( DEBUG_FLAG, "Util.sendRequest [REQUEST]" );
			
			
			// 2. Open HttpsURLConnection and Set Request Type.	
			URL obj = new URL( dataStore.requestUrl );
			// Since HttpsURLConnection extends HttpURLConnection, we can use for both HTTP/HTTPS?
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
	
			
			//add Request header
			con.setRequestMethod( dataStore.requestType );
	
			//con.setRequestProperty( "User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11" );
			con.setRequestProperty( "User-Agent", "ConnectApp/" + VERSION_NO + " CFNetwork/711.1.16 Darwin/14.0.0" );
						
			con.setRequestProperty( "Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" );
			con.setRequestProperty( "Accept-Language", "en-US,en;q=0.5" );
				
			// Timeout <-- set to 180 sec / 3 min..
			con.setConnectTimeout( dataStore.requestTimeout );
			con.setReadTimeout( dataStore.requestTimeout );
			
			
			if ( dataStore.requestHeaders != null )
			{
				dataStore.applyRequestHeaders( con );				
			}			
			else if ( dataStore.sourceType.equals( REQUEST_CONTENT_TYPE_BASIC_AUTH ) )
	        {	
	        	con.setRequestProperty( "Content-Type", "application/json; charset=utf-8" );	        	
	
		        String userpass = dataStore.username + ":" + dataStore.password;
		        String basicAuth = "Basic " + new String( new Base64().encode( userpass.getBytes() ) );
		        con.setRequestProperty( "Authorization", basicAuth );	 
	        }   
	        else
	        {
		        con.setRequestProperty( "Content-Type", "text/plain; charset=utf-8" );	        	
	        }

	        //  Moved out from Step 3.
	        con.setDoOutput(true);

	        try
	        {
		        // 3. Body Message Received Handle
		        if ( dataStore.requestInputJson != null && dataStore.requestInputJson.length() > 0 )
		        {	      	
					// Send post request
					//con.setDoOutput(true);
					DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
		            
					byte[] jsonDataBytes = dataStore.requestInputJson.toString().getBytes( Util.ENCODING_UTF8 );
					wr.write( jsonDataBytes );
					
					//wr.writeBytes( jsonData.toString() );	// This one does ISO-8859-1
					wr.flush();
					wr.close();					
		        }	
		        else if ( dataStore.requestParams != null && !dataStore.requestParams.isEmpty() )
		        {		        
		            //con.setDoOutput(true);	            
					DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
	
					
		            if ( dataStore.requestType.equals( Util.REQUEST_TYPE_GET ) )
		            {
		            	// Should be part of the url?
		            	//con.set
		            }
		            else if ( dataStore.requestType.equals( Util.REQUEST_TYPE_POST ) )
		            {		    
		            		                
		            	// Need to make sure of this.. TEsting...
			            StringBuilder postData = new StringBuilder();
			            for ( Map.Entry<String,Object> param : dataStore.requestParams.entrySet() ) 
			            {
			                if ( postData.length() != 0) postData.append( '&' );
			            
			                postData.append( URLEncoder.encode( param.getKey(), Util.ENCODING_UTF8 ) );
			                postData.append( '=' );
			                postData.append( URLEncoder.encode( String.valueOf( param.getValue() ), Util.ENCODING_UTF8 ) );
			            }
			            		            
			            byte[] postDataBytes = postData.toString().getBytes( Util.ENCODING_UTF8 );	        	
	
						wr.write( postDataBytes );		            	            
			            //con.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));	            						
		            }
		            
					wr.flush();
					wr.close();	           
		        }
	        }
	        catch( Exception ex )
	        {
	        	// wr.write does ACTUAL REQUESTING!!!
				Util.outputErr( "ERROR ON Util.sendRequestHTTP, REQUESTING - " + ex.getMessage() );	        	
	        	throw ex;
	        }


	        try
	        {
			    // 4. Send and get Response <-- ACTUAL SENDING/REQUESTING!!!!!
			    dataStore.responseCode = con.getResponseCode();
		    }
		    catch( Exception ex )
	        {
				Util.outputErr( "ERROR ON Util.sendRequestHTTP, SERVER NOT KNOWN CASE - " + ex.getMessage() );			
			    dataStore.responseCode = 520;
	        	
	        	throw ex;
	        }		    
				    
		   
		    try
		    {
			    // 5. Message content retrieve       
		        //if ( dataStore.responseCode == HttpURLConnection.HTTP_OK ) 
			    if ( dataStore.responseCode < 400 ) 
		        {
			    	dataStore.output = readInputStream( con.getInputStream() );				    
		        } 
			    else 
		        {		        	
			    	dataStore.output = readInputStream( con.getErrorStream() );
		        }
		    }
		    catch( Exception ex )
	        {
				Util.outputErr( "ERROR ON Util.sendRequestHTTP, DATA READ - " + ex.getMessage() );	        	
	        	throw ex;
	        }		    
		    		  
		}
		catch(Exception ex)
		{
			Util.outputErr( "Failed during sendRequestHTTP: " + ex.getMessage() );			
	        // responseMsgTemp.append( "-- Failed during sendRequestHTTP" );
			
			throw ex;
		}	
	}

	
	// ---------------------------------------
	
	// ==================================================
	// ========= InputStream Related ==================

	public static String readInputStream( InputStream stream ) throws Exception 
	{
		StringBuilder builder = new StringBuilder();
	    
		try ( BufferedReader in = new BufferedReader( new InputStreamReader( stream, Util.ENCODING_UTF8 ) ) ) {

			String line;
	        
			while ( ( line = in.readLine() ) != null ) 
			{
	            builder.append(line); // + "\r\n"(no need, json has no line breaks!)
	        }
	        
	        in.close();
	    }
	    	    
		return builder.toString();
	}
	
	// ========= InputStream Related ==================
	// ==================================================
	
	

	// ==================================================
	// ========= Message/Output Related ==================


	// ==================================================
	// ========= Response Msg Related ==================
		
	
	public static void respondMsgOut( HttpServletResponse response, JSONObject content )
	{
		try
		{
			setResponseHeaderCommon( response );			 
			 
			response.setContentType( "application/json;charset=" + Util.ENCODING_UTF8 );		
			response.setStatus( 200 );		
	
			try ( PrintWriter out = response.getWriter() )
			{
				if ( content != null )
				{
					out.print( content );
				}
				
				out.flush();
			}

		}
		catch ( Exception ex )
		{
			Util.outputErr( "\n=== Error FORM respondMsgOut === \n" );			
		}
	}

	// ArrayList<ExecutorService>
	public static void respondMsgOutStr( HttpServletResponse response, int statusCode, String contentType, String contentStr )
	{
		try
		{											
			setResponseHeaderCommon( response );
								
			response.setStatus( statusCode ); //dataStore.responseCode );		

			response.setContentType( contentType );
			
			try ( PrintWriter out = response.getWriter() )
			{
				out.print( contentStr );				
				out.flush();				
			}
		}
		catch ( Exception ex )
		{
			Util.outputErr( "\n=== Error FORM respondMsgOut === \n" );			
		}
	}
	

	public static void setResponseHeaderCommon( HttpServletResponse response )
	{
		// No caching header
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
		response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
		response.setDateHeader("Expires", 0); // Proxies.

		if ( Util.WS_DEV )
		{
			// NOTE: FOR BY-PASSING CORS (DISABLING CORS).  SHOULD BE ONLY USED FOR DEV VERSION
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");			
		}		 		
	}
	// ------------------------------------
	
	// ============ HTTPS GET/POST/PUT request ===============
	// ====================================================

	
	// =======================================================
	// ========== Basic Util Related ===============================


	public static String getRequestPath( HttpServletRequest request, int positionIndex )
	{
		String pathName = "";
			
		try
		{
			// 1. get Keyword by part of url
			if ( request.getPathInfo() != null )
			{
				String[] pathArr = request.getPathInfo().split("/");
				int pathLength = pathArr.length;
				
				if ( pathLength > 0 )
				{
					pathName = getUrlPathName( pathArr, positionIndex );
				}
			}
		}
		catch( Exception ex )
		{
			Util.outputErr( "\n == ERROR on 'getRequestPath()'\n" );
		}
		
		return pathName;
	}
	
	public static String getUrlPathName( String[] pathArr, int positionIndex )
	{
		String pathName = "";
		int pathLength = pathArr.length;
				
		if ( pathLength >= ( positionIndex + 1 ) )
		{							
			pathName = pathArr[ positionIndex ];
		}		

		return pathName;		
	}
	

    public static String getUrlEncode( String input ) throws Exception
    {
    	return URLEncoder.encode( input, Util.ENCODING_UTF8 );
    }
    
   	public static void setDebugFlag( boolean flag )
   	{
   		DEBUG_FLAG = flag;
   	}
    
   	// ====================================
   	// ====== Outputing Related ===========

   	public static void output( String msg )
   	{
		Util.output( Util.class, msg, DEBUG_FLAG );   		
		// System.out.println( msg );
   	}

   	public static void output( String msg, boolean bShow )
   	{
		Util.output( Util.class, msg, bShow );   		
		// System.out.println( msg );
   	}

   	public static void output( Class<?> arg1, String msg, boolean bShow )
   	{
		if ( bShow ) System.out.println( "\n === " + msg + System.getProperty("line.separator") );
	}
   	
   	public static void outputErr( String msg )
   	{
		Util.output( Util.class, msg, true );   		
   	}
   	
   	public static void outputDebug( String msg )
   	{
		Util.output( Util.class, msg, true );   		
   	}
   	// =============================

   	// ===========================================================
   	// ====== Basic Helper/Util Methods ===========
   	
   	public static String getRequestParamValStr( HttpServletRequest request, String paramName )
   	{
   		String valStr = "";

   		try
   		{
	   		String tempVal = request.getParameter( paramName );
	   		if ( tempVal != null ) valStr = URLDecoder.decode( tempVal, Util.ENCODING_UTF8 );
   		}
   		catch( Exception ex ) {}
   		
   		return valStr;
   	}
   	
   	public static String getParamsUrl( HttpServletRequest request )
   	{
   		String queryStr = request.getQueryString();
   		
   		if ( queryStr == null ) queryStr = "";
   		
   		if ( !queryStr.isEmpty() ) queryStr = "?" + queryStr;
   		
   		return queryStr;
   	}
   	
   	// -------------------------------
   	
	public static boolean strEqual( String input, String input2 )
	{
		return ( input.compareTo( input2 ) == 0 );
	}

	public static int strToInt( String input )
	{
		int outputVal = 0;
		
		try
		{
			if ( input != null && !input.isEmpty() ) outputVal = Integer.parseInt( input );
		}
		catch( Exception ex )
		{
			Util.outputErr( "ERROR on Util.strToInt - " + ex.getMessage() );
		}
		
		return outputVal;
	}
	
}
