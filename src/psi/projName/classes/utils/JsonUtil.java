package psi.projName.classes.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class JsonUtil {
	
	
	// ========================================================
   	// ---------------------------------------------------------------
   	// ---------- JSON BASIC HELPER METHODS ----------------------------

   	// ---------------------------------------
   	// ------ Create related ----------------

	// same as Util.copyJson
	public static JSONObject cloneJsonObj( JSONObject jsonObj )
	{
   		return new JSONObject( jsonObj.toString() );
	}
	
   	public static JSONObject copyJson( JSONObject jsonSrc )
   	{
   		return new JSONObject( jsonSrc.toString() );
   	}
   	
   	// -----------------
   	
	public static JSONObject createJSONObj_withParent( String jsonName, JSONObject parentJson )
	{
		JSONObject newJson = new JSONObject();
		
		if ( parentJson != null ) parentJson.put( jsonName, newJson );
		
		return newJson;
	}


	public static JSONObject createJSONObj( String key, String value )
	{
		return setJSONObjVal( key, value, null );
	}
   	
   	// -----------------
	
	public static JSONArray createJSONArray_withParent( String jsonArrName, JSONObject parentJson )
	{
		JSONArray newJsonArr = new JSONArray();
		
		if ( parentJson != null ) parentJson.put( jsonArrName, newJsonArr );
		
		return newJsonArr;
	}
	
	
   	// ---------------------------------------
   	// ------ Sets, Insert, Put ----------------
   	
	
	public static JSONObject insertToJsonArray( JSONObject newJson, JSONArray jsonArr )
	{		
		if ( jsonArr != null && newJson != null )
		{
			jsonArr.put( newJson );
		}
		
		return newJson;
	}
	
	
	public static String jsonToStr( JSONObject dataJson )
	{
		String output = "";
		
		try
		{
			if ( dataJson != null ) output = dataJson.toString();
		}
		catch( Exception ex )
		{
			Util.outputErr( "Error in Util.jsonToStr: " + ex.getMessage() );
		}
			
		return output;
	}
	
	public static JSONArray strToJsonArray( String jsonArrStr )
	{
		JSONArray outJsonArr = new JSONArray();
		
		if ( !jsonArrStr.isEmpty() )
		{
			try
			{
				outJsonArr = new JSONArray( jsonArrStr );
			}
			catch( Exception ex )
			{
				Util.outputErr( "Failed to convert string to JsonArr: " + ex.getMessage() );
			}
		}
		
		return outJsonArr;
	}

	
	
	public static JSONObject setJSONObjVal( String key, String value, JSONObject jsonObj )
	{
		if ( jsonObj == null ) jsonObj = new JSONObject();
		
		jsonObj.put( key, value );
		
		return jsonObj;
	}

	public static JSONObject setJSONObjVal( String key, String value )
	{
		return setJSONObjVal( key, value, null );
	}

	// //Util.respondMsgOut( response, (new JSONObject()).put( "msg",  "success" ) );


	public static JSONArray setJSONArray( JSONObject jsonObj, JSONArray jsonArr )
	{
		if ( jsonArr == null ) jsonArr = new JSONArray();
		
		jsonArr.put( jsonObj );
		
		return jsonArr;
	}
   	
	public static JSONArray setJSONArray( JSONObject jsonObj )
	{
		return setJSONArray( jsonObj, null );
	}
	
	public static JSONArray createJSONArray( JSONObject jsonObj )
	{
		return setJSONArray( jsonObj, null );
	}
	
	
   	public static String insertPropVal_StrJson( String inputStr, String propName, String valStr )
   	{
		JSONObject jsonDataOutput = new JSONObject( inputStr );
		jsonDataOutput.put( propName, valStr );
		return jsonDataOutput.toString();   		
   	}
   	// ------------------------------------   	
   	

   	
	public static boolean isJsonEmpty( JSONObject jsonData )
	{
		boolean isEmptyJson = false;
		
		try {
			isEmptyJson = ( jsonData == null || jsonData.length() == 0 );
		} catch ( Exception ex )
		{
			Util.outputErr( "ERROR in JsonUtil.isJsonEmtpy - " + ex.getMessage() );
		}
		
		return isEmptyJson;
	}
	
	public static boolean isJsonEmpty( JSONArray jsonArray )
	{
		boolean isEmptyJson = false;
		
		try {
			isEmptyJson = ( jsonArray == null || jsonArray.length() == 0 );
		} catch ( Exception ex )
		{
			Util.outputErr( "ERROR in JsonUtil.isJsonEmtpy - " + ex.getMessage() );
		}
		
		return isEmptyJson;
	}
	
	public static JSONObject createJsonObjFromStr( String jsonStr )
	{
		JSONObject jsonData = new JSONObject();
		
		try
		{
			jsonData = ( jsonStr.isEmpty() ) ? new JSONObject() : new JSONObject( jsonStr );
		}
		catch( Exception ex )
		{
			Util.outputErr( "Error during String to JSONObject, str: " + jsonStr + ", err: " + ex.toString() );
		}
		
		return jsonData;
	}
	
	
	
	
   	// ---------------------------------------
   	// ------ Gets ----------------
	
	public static String getJSONStrVal( JSONObject jsonDataInput, String key )
	{
		String output = "";
				
		if ( jsonDataInput != null && jsonDataInput.has( key ) )
		{
			//output = jsonDataInput.getString( key );					
			output = jsonDataInput.get( key ).toString();		
		}
		
		return output;
	}
		
	   	
   	public static JSONObject getJsonObject( JSONObject jsonObj, String propName )
   	{
   		JSONObject propJson = null;
   		
   		if ( jsonObj != null && jsonObj.has( propName ) )
   		{
   			propJson = jsonObj.getJSONObject( propName );
   		}
   		
   		return propJson;
   	}
   	

   	public static JSONObject getJsonObject_NoNull( JSONObject jsonObj, String propName )
   	{
   		JSONObject propJson = getJsonObject( jsonObj, propName );   		
   		if ( propJson == null ) propJson = new JSONObject();
   		
   		return propJson;
   	}
   	

   	public static JSONObject getJsonObject( JSONArray jsonObjArr, String propName, String propVal )
   	{
   		JSONObject propJson = null;
   		
   		if ( jsonObjArr != null && jsonObjArr.length() > 0 )
   		{   			
			for( int i = 0; i < jsonObjArr.length(); i++ )
			{
				JSONObject jsonObj = jsonObjArr.getJSONObject(i);
				
				String propValStr = JsonUtil.getJSONStrVal( jsonObj, propName );
				
				if ( propValStr.equals( propVal ) )
				{
					propJson = jsonObj;
					break;
				}
			}
   		}
   		
   		return propJson;
   	}
   	
   	public static JSONObject getJsonObject( JSONArray jsonObjArr, int index )
   	{
   		JSONObject foundJson = null;
   		
   		if ( jsonObjArr != null && jsonObjArr.length() > index )
   		{   		
   			foundJson = jsonObjArr.getJSONObject( index );   			
   		}
   		
   		return foundJson;
   	}
   	
	public static JSONObject getJsonObject( JSONObject jsonObj, int propIndex ) throws Exception
    {
        JSONObject propJson = null;

        if ( jsonObj != null )
        {
            Iterator<?> keys = jsonObj.keys();

            int count = 0;

            while( keys.hasNext() )
            {
                String key = (String) keys.next();

                if ( propIndex == count )
                {
                    propJson = JsonUtil.getJsonObject( jsonObj, key );
                }

                count++;
            }
        }

        return propJson;
    }
    
   	public static JSONArray getJsonArray( JSONObject jsonObj, String propName )
   	{
   		JSONArray propJsonArr = new JSONArray(); //null;
   		
   		if ( jsonObj != null && jsonObj.has( propName ) )
   		{
   			propJsonArr = jsonObj.getJSONArray( propName );
   		}
   		
   		return propJsonArr;
   	}

   	public static JSONArray getJsonArray_Null( JSONObject jsonObj, String propName )
   	{
   		JSONArray propJsonArr = null;
   		
   		if ( jsonObj != null && jsonObj.has( propName ) )
   		{
   			try
   			{
   				propJsonArr = jsonObj.getJSONArray( propName );
   			}
   			catch ( Exception ex )
   			{
   				Util.outputErr( "ERROR on JsonUtil.getJsonArray_Null - " + ex.getMessage() );
   			}
   		}
   		
   		return propJsonArr;
   	}

   	
   	// Get list of sub objects (array)
   	public static JSONArray getJsonArray_Sub( JSONArray jsonArr, String propName )
   	{
   		JSONArray resultJsonArr = new JSONArray();
   		
   		if ( jsonArr != null )
   		{   			
			for( int i = 0; i < jsonArr.length(); i++ )
			{
				JSONObject jsonObj = jsonArr.getJSONObject(i);
				
				JSONObject subJsonObj = JsonUtil.getJsonObject( jsonObj, propName );
				
				resultJsonArr.put( subJsonObj );
			}
   		}
   		
   		return resultJsonArr;
   	}

   	
   	// Could be used 'dataElement' or 'attribute' array list <-- 'findProp' could be 'dataElement'/'attribute'
	public static String getJsonArrPropFindVal( JSONArray jsonArr, String findProp, String findVal, String outputProp )
	{
	   	JSONObject foundJson = getJsonObject( jsonArr, findProp, findVal );

	   	return JsonUtil.getJSONStrVal( foundJson, outputProp );
	}
   	   	
   	
   	/*
	public static void setJsonArrPropVal( JSONArray jsonArr, String propName, Object val )
	{
		for ( int i = 0; i < jsonArr.length(); i++ )
		{
			JSONObject jsonObj = jsonArr.getJSONObject( i );
			
			jsonObj.put( propName, val );			
		}
	}
	*/

	// ---- _Create & _Copy versions

   	public static JSONObject getJsonObject_Create( JSONObject jsonObj, String propName )
   	{
   		JSONObject propJson = getJsonObject( jsonObj, propName );

   		if ( propJson == null )
   		{
   			propJson = new JSONObject();
   			jsonObj.put( propName, propJson );
   		}
   		
   		return propJson;
   	}
   	
   	public static JSONArray getJsonArray_Copy( JSONObject jsonObj, String propName )
   	{
   	   	JSONArray jsonArr = JsonUtil.getJsonArray( jsonObj, propName );
   	   	   		
   		if ( jsonArr == null ) return null;
   		else return new JSONArray( jsonArr.toString() );
   	}
	
   	public static JSONObject getJsonObject_Copy( JSONObject jsonObj, String propName )
   	{
   	   	JSONObject jsonObjTemp = JsonUtil.getJsonObject( jsonObj, propName );

   	   	if ( jsonObjTemp == null ) return null;
   		else return new JSONObject( jsonObjTemp.toString() );   		
   	}

   	public static JSONArray getJsonArray_Filtered( JSONArray jsonArr, String propName, String valStr )
   	{
   		JSONArray jsonArrNew = new JSONArray();

   		if ( jsonArr != null )
   		{
			for( int i = 0; i < jsonArr.length(); i++ )
			{
				JSONObject jsonObj = jsonArr.getJSONObject(i);
				
				if ( JsonUtil.getJSONStrVal( jsonObj, propName ).equals( valStr ) )
				{
					jsonArrNew.put( jsonObj );
				}
			}   		
   		}

		return jsonArrNew;
   	}
   	
   	
	public static void appendJSONStrVal( JSONObject jsonObj, String key, String appendStr )
	{
		if ( jsonObj != null && jsonObj.has( key ) )
		{			
			jsonObj.put( key, JsonUtil.getJSONStrVal( jsonObj, key ) + appendStr );
		}
	}
	
	public static void appendJSONObj( JSONObject jsonObj, String key, JSONObject dataJsonSrc ) throws Exception
	{
		if ( jsonObj != null )
		{			
			JSONObject dataJson = JsonUtil.getJsonObject_Create( jsonObj, key );
			JsonUtil.jsonMerge( dataJsonSrc, dataJson );
		}
	}
	
	public static JSONObject convertJsonStrValToJson( JSONObject jsonObj, String catchKey )
	{
		JSONObject newJsonObj = null;
		
		if ( jsonObj != null )
		{			
			newJsonObj = new JSONObject();
			
			Iterator<?> keys = jsonObj.keys();

			while( keys.hasNext() ) 
			{
			    String key = (String)keys.next();
			    String valStr = jsonObj.get(key).toString();
			    			
			    if ( valStr.contains( catchKey ) )
			    {
			    	valStr = valStr.replace( catchKey, "" );
			    	newJsonObj.put( key, new JSONObject( valStr ) );
			    }
			    else
			    {
			    	newJsonObj.put( key, valStr );
			    }
			}						
		}
		
		return newJsonObj;
	}

	public static Map<String, String> convertMapDataToStr( Map<String, Object> inputMap )
	{
		Map<String, String> outputMap = new HashMap<String, String>();
		
		
		
		return outputMap;
	}
	
	// -----------------------------------------
	// ---- Merge Related -----------

   	// if already on target (the string value), it does not move from source..
   	public static void jsonMerge( JSONObject source, JSONObject target ) throws Exception 
   	{
   		jsonMerge( source, target, false );
   	}

   	public static void jsonMerge( JSONObject source, JSONObject target, boolean bOverwrite ) throws Exception 
   	{
   		if ( JsonUtil.isJsonEmpty( source ) )
   		{
   			// Util.outputErr( "source emtpy case" );
   		}
   		else
   		{
	   	    for ( String key: JSONObject.getNames( source ) ) 
	   	    {
	            Object value = source.get(key);
	
	            if ( !target.has(key) ) 
	            {
	                target.put( key, value );
	            } 
	            else 
	            {  	            	
	            	// If already exists on target, 
	                // existing value for "key" - recursively deep merge:
	                if ( value instanceof JSONObject ) 
	                {
	                    JSONObject valueJson = (JSONObject)value;
		
	                	Object targetVal = target.get( key );
	
	                	if ( targetVal instanceof JSONObject )
	                	{	
	                		jsonMerge( valueJson, (JSONObject)targetVal, bOverwrite );
	                	}
	                } 
	                else if ( value instanceof String )
	                {
	                	if ( bOverwrite ) target.put( key, value );
	                }
	            }
	   	    }
   		}
   	    //return target;
   	}
   	
	// -----------------------------------------

   	
	public static String jsonStrFormat( String input )
	{
		return input.replace( "\"", "'" );
	}

	public static String replaceQuote_SToD( String input )
	{
		return input.replace( "'", "\"" );
	}

	public static String getJsonFormattedStr( String input )
	{
		String output = "{}";
		
		try
		{
			// If 'input' is emtpy string, use above '{}'.  If not, check by creating new JSONObject.
			if ( !input.isEmpty() )
			{
				JSONObject inputJson  = new JSONObject( input );
				
				output = inputJson.toString();				
			}			
		}
		catch(Exception ex )
		{			
		}
		
		return output;
	}
	
	public static String getJSONObjStr_Msg( String msg )
	{
		return replaceQuote_SToD( "{ 'msg': '" + jsonStrFormat( msg ) + "' }" );
	}
	
   	// ------------------------------------

	public static JSONObject getJsonFromListByPropVal( JSONArray jsonList, String propName, String propVal )
	{
		JSONObject foundJson = null;
		
		if ( jsonList != null )
		{
			for( int i = 0; i < jsonList.length(); i++ )
			{
				JSONObject dataJson = jsonList.getJSONObject(i);
	
				if ( dataJson.has( propName ) )
				{		
					String value = dataJson.get( propName ).toString();	// due to property value could be number, not string
									
					if( value.equals( propVal ))
					{					
						foundJson = dataJson;
						break;
					}
				}
			}
		}
	
		return foundJson;
	}
	
   	// ---------- JSON BASIC HELPER METHODS ----------------------------
   	// ---------------------------------------------------------------
	// ========================================================
	
	
	
	
	public static JSONObject getJsonClone_withObjCleared( JSONObject jsonObj, String propKey, String propVal )
	{
		JSONObject jsonObjClone = null;
		
		if ( jsonObj != null )
		{
			try
			{
				// Search the json object (down) and return array of obj that holds the key prop.
				jsonObjClone = cloneJsonObj( jsonObj );
				
				// json.remove  <-- action
				List<JSONObject> matchList = getKeyMatchList( jsonObjClone, propKey, propVal );
				
				for ( JSONObject matchedJsonObj : matchList) {
					jsonObjectClear( matchedJsonObj, "--- secured section ---" );
				}
			
			}
			catch( Exception ex )
			{
				Util.outputErr( " === EXCEPTION, JsonUtil.getJsonClone_withObjCleared: " + ex.toString() );
			}
		}
					
		return jsonObjClone;
	}
	
	
	public static JSONObject getJsonClone_withObjCleared( JSONObject jsonObj, String propKey )
	{
		JSONObject jsonObjClone = null;
		
		if ( jsonObj != null )
		{
			try
			{
				// Search the json object (down) and return array of obj that holds the key prop.
				jsonObjClone = cloneJsonObj( jsonObj );
				
				// json.remove  <-- action
				List<JSONObject> matchList = getKeyMatchList( jsonObjClone, propKey );
				
				for ( JSONObject matchedJsonObj : matchList) {
					matchedJsonObj.remove( propKey );
				}
			
			}
			catch( Exception ex )
			{
				Util.outputErr( " === EXCEPTION, JsonUtil.getJsonClone_withObjCleared2: " + ex.getMessage() );
			}
		}
					
		return jsonObjClone;
	}
	
	
	
	public static List<JSONObject> getKeyMatchList( JSONObject jsonObj, String key, String val )
	{
		List<JSONObject> arrList = new ArrayList<JSONObject>();
		
		findObjsWithKey( jsonObj, key, val, arrList );
		
		return arrList;
	}
	
	public static List<JSONObject> getKeyMatchList( JSONObject jsonObj, String key )
	{
		List<JSONObject> arrList = new ArrayList<JSONObject>();
		
		findObjsWithKey( jsonObj, key, arrList );
		
		return arrList;
	}
	
	// Assumption: 'key' is String type value.
	public static void findObjsWithKey( JSONObject jsonObj, String inputKey, String inputVal, List<JSONObject> matchList) throws JSONException 
	{
	    Iterator<?> keys = jsonObj.keys();

	    while( keys.hasNext() ) {

	    	String key = (String)keys.next();
	    	Object value = jsonObj.get(key);
	    	
            if ( value instanceof String )
	        {
		    	if ( key.equals( inputKey ) && inputVal.equals( value.toString() ) )
		    	{
		            //System.out.println(jsonObj.get(key));
		            matchList.add( jsonObj );
		        }	        	
	        }	    	
            else if ( value instanceof JSONObject ) 
	        {	        	
	            //System.out.println(jsonObj.get(key));
	            findObjsWithKey( (JSONObject)value, inputKey, inputVal, matchList);
	        }
	        else if ( value instanceof JSONArray ) 
	        {	        	
	        	findObjsWithKey_Arr( (JSONArray)value, inputKey, inputVal, matchList);
	        }
	    }	
	}
	

	// Assumption: 'key' is String type value.
	public static void findObjsWithKey( JSONObject jsonObj, String inputKey, List<JSONObject> matchList) throws JSONException 
	{
	    Iterator<?> keys = jsonObj.keys();

	    while( keys.hasNext() ) {

	    	String key = (String)keys.next();
	    	Object value = jsonObj.get(key);
	    	
		    if ( key.equals( inputKey ) )
		    {
		        //System.out.println(jsonObj.get(key));
		    	matchList.add( jsonObj );
		    }	        	
            else if ( value instanceof JSONObject ) 
	        {
	            //System.out.println(jsonObj.get(key));
	            findObjsWithKey( (JSONObject)value, inputKey, matchList);
	        }
	        else if ( value instanceof JSONArray ) 
	        {
	        	findObjsWithKey_Arr( (JSONArray)value, inputKey, matchList);
	        }
	    }	
	}
	
	
	// If JSONArray has JSONObject, continue with 'findObjsWithKey'.
	// But if JSONArray has JSONArray in it, use 'findObjsWithKey_Arr' to keep looking for JSONObject content.
	public static void findObjsWithKey_Arr( JSONArray jsonArr, String inputKey, String inputVal, List<JSONObject> matchList) throws JSONException 
	{		
        for ( int i = 0; i < jsonArr.length(); i++ ) 
        {
        	Object arrVal = jsonArr.get(i);
        	
        	if ( arrVal instanceof JSONObject )
        	{
        		findObjsWithKey( (JSONObject)arrVal, inputKey, inputVal, matchList );
        	}
        	else if ( arrVal instanceof JSONArray )
        	{
        		findObjsWithKey_Arr( (JSONArray)arrVal, inputKey, inputVal, matchList );
        	}
        	// else if string, ignore it.
        }
	}
	

	// If JSONArray has JSONObject, continue with 'findObjsWithKey'.
	// But if JSONArray has JSONArray in it, use 'findObjsWithKey_Arr' to keep looking for JSONObject content.
	public static void findObjsWithKey_Arr( JSONArray jsonArr, String inputKey, List<JSONObject> matchList) throws JSONException 
	{		
        for ( int i = 0; i < jsonArr.length(); i++ ) 
        {
        	Object arrVal = jsonArr.get(i);
        	
        	if ( arrVal instanceof JSONObject )
        	{
        		findObjsWithKey( (JSONObject)arrVal, inputKey, matchList );
        	}
        	else if ( arrVal instanceof JSONArray )
        	{
        		findObjsWithKey_Arr( (JSONArray)arrVal, inputKey, matchList );
        	}
        	// else if string, ignore it.
        }
	}
	
	
	public static void jsonObjectClear( JSONObject jsonObj, String securedMsg ) 
	{
		try
		{
			if ( jsonObj != null )
			{
				String[] keys = JSONObject.getNames( jsonObj );
				
				for ( int i = 0; i < keys.length; i++ )
				{
					String key = keys[i];			
			    	//Object value = jsonObj.get(key);
			    		    	
		            //if ( value instanceof String )
			        //{
		            jsonObj.remove( key );
				}		
				
				if ( !securedMsg.isEmpty() ) jsonObj.put( "securedMsg" , securedMsg );
			}
		}
		catch( Exception ex )
		{
			Util.outputErr( "Exception on JsonUtil.jsonObjectClear: " + ex.getMessage() );
		}
	}
	
}
