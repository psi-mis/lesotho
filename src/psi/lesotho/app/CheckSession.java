package psi.lesotho.app;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

import psi.lesotho.service.Util;

public class CheckSession
    extends HttpServlet
{

    /**
     * 
     */
    private static final long serialVersionUID = 6169116828707157100L;

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
     *      response)
     */
    protected void doGet( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        HttpSession session = request.getSession();
        boolean loggedSuccess = (boolean) session.getAttribute( Util.KEY_LOGGED_SUCCESS );
        
        JSONObject responseData = new JSONObject();
        
        if (!request.getRequestedSessionId().equals(session.getId()) || !loggedSuccess )
        {
            responseData.put( "msg", "session_expired" );
        }
        else
        {
            long remainingTimeInMilliseconds = session.getMaxInactiveInterval(); // miliseconds
            responseData.put( "msg", "ok" );
            responseData.put( "sessionTimeOut", remainingTimeInMilliseconds );
        }
        
        PrintWriter out = response.getWriter();
        out.print( responseData.toString() );
        out.flush(); 
    }
}
