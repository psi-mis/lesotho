
// ----------------------------------------------------------------------------
// Generate Input Tags
// ----------------------------------------------------------------------------
	
function InputTagGeneration( attribute )
{
	var me = this;
	
	me.generateInputTag = function( attribute, inputKey )
	{
		var inputTag = $( "<input type='text' class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >" );
		
		if( attribute.optionSet !== undefined )
		{
			inputTag = me.generateOptionInputTag( attribute, inputKey );
		}
		else if( attribute.valueType === "BOOLEAN" )
		{
			inputTag = me.generateBoolInputTag( attribute, inputKey );
		}
		else if( attribute.valueType === "TRUE_ONLY" )
		{
			inputTag = "<input type='checkbox' class='form-control checkBox'  " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >";
		}
		else if( attribute.valueType === "NUMBER" || attribute.valueType === "INTEGER" 
			|| attribute.valueType === "INTEGER_POSITIVE" || attribute.valueType === "INTEGER_NEGATIVE" 
			|| attribute.valueType === "INTEGER_ZERO_OR_POSITIVE" )
		{
			inputTag = me.generateNumberInputTag( attribute, inputKey );
		}
		else if( attribute.valueType === "LETTER" )
		{
			inputTag = "<input type='text' letter='true' class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >";
		}
		else if( attribute.valueType === "DATE" )
		{
			inputTag = "<input type='text' isDate='true' class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >";
		}
		else if( attribute.valueType === "DATETIME" )
		{
			inputTag = "<input type='text' isDateTime='true' class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >";
		}
//		else if( attribute.valueType === "PHONE_NUMBER" )
//		{
//			inputTag = "<input type='text' phonenumber='true' class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' >";
//		}
		else if( attribute.valueType === "LONG_TEXT" )
		{
			inputTag = "<textarea class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "' maxlength='255'>";
		}
		
		return inputTag;
		
	};
	
	me.generateOptionInputTag = function( attribute, inputKey )
	{
		var options = attribute.optionSet.options;
		inputTag = $("<select class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "'>");
		inputTag.append( "<option value=''>[Please select]</option>" );
		for( var k in options )
		{
			var code = options[k].code;
			var name = options[k].name;
			inputTag.append( "<option value='" + code + "'>" + name + "</option>" );
		}
		
		return inputTag;
	};
	
	me.generateNumberInputTag = function( attribute, inputKey )
	{
		var inputTag;
		
		var type = "";
		if( attribute.valueType === "NUMBER" )
		{
			type = "number='true'";
		}	
		else if( attribute.valueType === "INTEGER" )
		{
			type = "integer='true'";
		}
		else if( attribute.valueType === "INTEGER_POSITIVE" )
		{
			type = "integerPositive='true'";
		}
		else if( attribute.valueType === "INTEGER_NEGATIVE")
		{
			type = "integerNegative='true'";
		}
		else if( attribute.valueType === "INTEGER_ZERO_OR_POSITIVE"  )
		{
			type = "integerZeroPositive='true'";
		}
		
		return $( "<input type='text' " + type + " class='form-control' " + inputKey + "='" + attribute.id + "'>" );;
	};
	
	me.generateBoolInputTag = function( attribute, inputKey )
	{
		var inputTag = $( "<select class='form-control' " + inputKey + "='" + attribute.id + "' mandatory='" + attribute.mandatory + "'>" );
		inputTag.append( "<option value=''>[Please select]</option>" );
		inputTag.append( "<option value='true'>Yes</option>" );
		inputTag.append( "<option value='false'>No</option>" );
		
		return inputTag;
	};
	
}