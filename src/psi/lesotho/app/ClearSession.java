package psi.lesotho.app;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class ClearSession
    extends HttpServlet
{
    private static final long serialVersionUID = -302963909853738077L;
 
    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
     *      response)
     */ 
    protected void doGet( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        HttpSession session = request.getSession(true);
        session.setAttribute( "username", "" );
        session.setAttribute( "password", "" );
    }
}
