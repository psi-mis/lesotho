
function Menu()
{	
	var me = this;
	
	me.trigger = $('.hamburger');
	me.overlay = $('.overlay');
	me.offcanvasTag = $('[data-toggle="offcanvas"]');
	me.offcanvasmenuTag = $('[data-toggle="offcanvasmenu"]');
	me.wapperTag = $('#wrapper')
	me.pageHeaderTag = $( '#headerPage' );
	
	me.isClosed = false;

	
    me.init = function()
    {
    	me.setUp_Events();
    },
    
    me.setUp_Events = function()
    {
    	me.trigger.click(function () {
    		
    		if (me.isClosed == true) {  
    			
        		me.overlay.hide();
    	        me.trigger.removeClass('is-open');
    	        me.trigger.addClass('is-closed');
    	        me.isClosed = false;

    		} else {   
    	    	me.overlay.show();
    	        me.trigger.removeClass('is-closed');
    	        me.trigger.addClass('is-open');
    	        me.isClosed = true;
    	    
    		}
    		
    		// Stops the enclosing 'div' click from happening
    		event.stopPropagation();
    	});
    	

        me.offcanvasTag.click(function () {
        	me.wapperTag.toggleClass('toggled');
    	});
        
        
        me.offcanvasmenuTag.click(function () {
    		me.overlay.hide();
        	me.trigger.removeClass('is-open');
        	me.trigger.addClass('is-closed');
        	me.isClosed = false;  
			me.wapperTag.toggleClass('toggled');
        });
        
        me.overlay.click(function(){
        	me.offcanvasmenuTag.click();
        });
        
        me.setUp_HeaderClickCollapse();
    },


	me.setUp_HeaderClickCollapse = function()
	{    	
		me.pageHeaderTag.click( function()
		{
    		if ( me.isClosed ) {  
            	me.offcanvasmenuTag.click();
    		}
		});
	},
	
    
    // -----------------------------------------------------
    // -----------------------------------------------------
    // -----------------------------------------------------
    
    me.init();

}

	  