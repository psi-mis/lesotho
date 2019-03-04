
function Storage()
{
	var me = this;
	me.KEY_STORAGE_DISTRICT = "lesotho_district";
	me.KEY_STORAGE_ORGUNIT = "lesotho_orgunit";
	me.KEY_STORAGE_HIDE_HIV_TEST_LOGIC_ACTION_FIELDS = "lesotho_HIVTestLogicActionFields";
	
	me.addItem = function( key, value )
	{
		me.removeItem( key );
		if ( typeof(Storage) !== "undefined" ) { // if (typeof value === "object") {
		    localStorage.setItem( key, value );
		    console.log("The selected language is saved.");
		} else {
		   alert( "Sorry, your browser does not support Web Storage..." );
		}
	};
	
	me.getItem = function( key )
	{
		var value = localStorage.getItem( key );
		return ( value === null || value === "null" ) ? "" : value;
	};
	
	me.removeItem = function( key )
	{
		sessionStorage.removeItem( key );
		localStorage.removeItem( key );
	}
}
