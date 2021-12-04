package psi.projName;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import psi.projName.classes.utils.*;

public class ApiController extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ApiController() {
        super();
    }
    
	// -----------------------------------------------------------
	// ----- Servlet 'GET'/'POST' Methods  -----------------------
	    
    // 'GET' SERVLET - INFORMATION LOOK-UP
	protected void doGet( HttpServletRequest request, HttpServletResponse response ) throws ServletException, IOException 
	{	    
		String msgOut = "";		
		
		String key1 = Util.getRequestPath( request, 1 );
		//String key2 = Util.getRequestPath( request, 2 );
		
		if ( !key1.isEmpty() )
		{				
			try 
			{				
				switch( key1 )
				{												
					case "testGet":
						msgOut = "dtOutput - .... ";
						break;
				}
											
			} catch (Exception ex) 
			{
				Util.outputErr( "Exception Occurred!! " + ex.getMessage() );
				msgOut = ex.getMessage();
			}			
		}
		else
		{
			msgOut = "Query Path does not have 2 parts and more";
		}
				
		
		
		JSONObject jsonMsg = new JSONObject();
		jsonMsg.put( "message", msgOut );
		
		Util.respondMsgOut(response, jsonMsg );
	}
	
	

	// ===============================================================
	// 'POST' SERVLET - RECORD (Register) - Worker registers/updates the client/patient
	protected void doPost( HttpServletRequest request, HttpServletResponse response ) throws UnsupportedEncodingException, ServletException, IOException
	{	
		JSONObject outputJson = new JSONObject();
		
		//String key1 = Util.getRequestPath(request, 1);		
		
		// Process it...
		// outputJson = processPostRequest();
		
		
		// Output Data..
		Util.respondMsgOut(response, outputJson );
	}
	
	// =======================================
	// ====== METHODS ========================	
	
	
}
