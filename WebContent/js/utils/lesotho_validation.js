
function Validation( translationObj )
{
	var me = this;
	me.translationObj = translationObj;
	
	// ================================
	// == Tag Validations
	
	me.setUp_isNumberOnly_OlderBrowserSupport = function( formTag ) {

		// Support for older browser number only keypress
		formTag.find("[number='true']").keypress( function(e) {
			return e.charCode >= 48 && e.charCode <= 57;
		});		
	};
	
	me.checkFormEntryTagsData = function( formTag )
	{	
		var allValid = true;

		// If any of the tag is not valid, mark it as invalid.
		formTag.find( "input,select" ).each( function() {
			
			if ( !me.checkValidations( $(this) ) )
			{
				allValid = false;
			}
		});
				
		return allValid;
	};
	

	me.checkValidations = function( tag )
	{	
		// Validation Initial Setting Clear
		tag.attr( 'valid', 'true' );
		var divTag = tag.closest( "td" );
		if( divTag.length == 0 ) divTag = tag.closest( "div.col-sm-10" );
		divTag.find( "span.errorMsg" ).remove();
		
		if ( tag.is( ':visible' ) )
		{		
			me.performValidationCheck( tag, 'mandatory', divTag );
			me.performValidationCheck( tag, 'minlength', divTag );
			me.performValidationCheck( tag, 'exactlength', divTag );
			me.performValidationCheck( tag, 'maxlength', divTag );
			me.performValidationCheck( tag, 'maxvalue', divTag );
			me.performValidationCheck( tag, 'minvalue', divTag );
			me.performValidationCheck( tag, 'number', divTag );
			me.performValidationCheck( tag, 'letter', divTag );
			me.performValidationCheck( tag, 'phonenumber', divTag );
			me.performValidationCheck( tag, 'valueNotAllow', divTag );
			me.performValidationCheck( tag, 'notAllowSpecialChars', divTag );
		}

		var valid = ( tag.attr( 'valid' ) == 'true' );
		
		// If not valid, set the background color.
		tag.attr( 'background-color', ( valid ) ? '' : me.COLOR_WARNING );
		
		return valid;
	};
	
	me.performValidationCheck = function( tag, type, divTag )
	{		
		// check the type of validation (if exists in the tag attribute)
		// , and if not valid, set the tag as '"valid"=false' in the attribute
		var valid = true;
		var validationAttr = tag.attr( type );
		var rowTag = tag.closest("tr");
		
		// If the validation attribute is present in the tag
		if ( validationAttr && !rowTag.hasClass("logicHide") )
		{						
			if ( type == 'mandatory' ) valid = me.checkRequiredValue( tag, divTag );
			else if ( type == 'minlength' ) valid = me.checkValueLen( tag, divTag, 'min', Number( validationAttr ) );
			else if ( type == 'maxlength' ) valid = me.checkValueLen( tag, divTag, 'max', Number( validationAttr ) );
			else if ( type == 'exactlength' ) valid = me.checkValueLen( tag, divTag, 'exactlength', Number( validationAttr ) );
			else if ( type == 'maxvalue' ) valid = me.checkValueRange( tag, divTag, 0, Number( validationAttr ) );
			else if ( type == 'number' ) valid = me.checkValueNumber( tag, divTag );
			else if ( type == 'integer' ) valid = me.checkValueInteger( tag, divTag );
			else if ( type == 'integerPositive' ) valid = me.checkValueIntegerPositive( tag, divTag );
			else if ( type == 'integerZeroPositive' ) valid = me.checkValueIntegerZeroOrPositive( tag, divTag );
			else if ( type == 'integerNegative' ) valid = me.checkValueIntegerNegative( tag, divTag );
			else if ( type == 'letter' ) valid = me.checkValueLetter( tag, divTag );
			else if ( type == 'phonenumber' ) valid = me.checkPhoneNumberValue( tag, divTag );
			else if ( type == 'valueNotAllow' ) valid = me.checkNotAllowValue( tag, divTag );
			else if ( type == 'notAllowSpecialChars' ) valid = me.checkNotAllowSpecialChars( tag, divTag );
			
			
			if ( !valid ) tag.attr( 'valid', false );
		}		
	};
	
	
	// ------------------------------
	// -- Each type validation
	
	me.checkRequiredValue = function( inputTag, divTag )
	{
		var valid = true;
		var value = inputTag.val();

		if( inputTag.attr('mandatory') === 'true' )
		{
			if( inputTag.attr("type") === "checkbox" && !inputTag.prop("checked") )
			{
				divTag.append( me.getErrorSpanTag( 'Enter data in this field' ) );
				valid = false;
			}
			else if( value === "" || value === null )
			{
				divTag.append( me.getErrorSpanTag( 'Enter data in this field' ) );
				valid = false;
			}
		}
		
		return valid;
	};
	
	me.checkValueLen = function( inputTag, divTag, type, length )
	{		
		var valid = true;
		var value = inputTag.val();
		
		if ( value && type == 'min' && value.length < length )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_minLength' ) );
			divTag.append( me.getErrorSpanTag( length ) );
			divTag.append( me.getErrorSpanTag( 'common_validation_exactCharacter' ) );
			valid = false;
		}
		else if ( value && type == 'max' && value.length > length )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_maxLength' ) );
			valid = false;
		}
		else if ( value && type == 'exactlength' && value.length != length )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_exactLength' ) );
			divTag.append( me.getErrorSpanTag( length ) );
			divTag.append( me.getErrorSpanTag( 'common_validation_exactCharacter' ) );
			valid = false;
		}
		
		
		return valid;
	};


	me.checkValueRange = function( inputTag, divTag, valFrom, valTo )
	{
		var valid = true;
		var value = inputTag.val();
		
		if ( value && ( valFrom > value || valTo < value ) )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueMax' ) );
			divTag.append( me.getErrorSpanTag( valTo ) );
			valid = false;
		}
		
		return valid;		
	};
	
	me.checkValueInteger = function( inputTag, divTag )
	{
		var value = inputTag.val();
		var valid = isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
		
		if( !valid )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueInteger' ) );
		}
		return valid;	
	};
	
	me.checkValueIntegerPositive = function( inputTag, divTag )
	{
		var value = inputTag.val();
		var valid = ( isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) ) && value > 0 ;
		
		if( !valid )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueIntegerPositive' ) );
		}
		return valid;	
	};

	me.checkValueIntegerZeroOrPositive = function( inputTag, divTag )
	{
		var value = inputTag.val();
		var valid = ( isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) ) && value >= 0 ;
		
		if( !valid )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueIntegerPositive' ) );
		}
		return valid;	
	};

	me.checkValueIntegerNegative = function( inputTag, divTag )
	{
		var value = inputTag.val();
		var valid = ( isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) ) && value < 0 ;
		
		if( !valid )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueIntegerPositive' ) );
		}
		return valid;	
	};
	
	me.checkValueNumber = function( inputTag, divTag )
	{
		var valid = true;
		var value = inputTag.val();
		
		if ( value && !( !isNaN(parseFloat(value)) && isFinite(value) ) )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueNumber' ) );
			valid = false;
		}
		
		return valid;	
	};

	me.checkValueLetter = function( inputTag, divTag )
	{
		var valid = true;
		var value = inputTag.val();
		
		var letters = /^[A-Za-z]+$/;
		if( !value.match(letters) )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_valueLetter' ) );
			return false;
		}
		
		return valid;	
	};
	
	me.checkPhoneNumberValue = function( inputTag, divTag )
	{
		var valid = true;
		
		// Check if Phone number is in [ 12, 15 ]
		inputTag.attr( 'altval', '' );

		var validationInfo = me.phoneNumberValidation( inputTag.val() );		
		if ( !validationInfo.success ) 
		{
			divTag.append( me.getErrorSpanTag( validationInfo.msg ) );
			valid = false;			
		}
		else
		{
			// If valid phone number, put the converted phone number as attribute to be used later.
			inputTag.attr( 'altval', validationInfo.phoneNumber );
		}
		
		return valid;
	};
	
	
	me.checkNotAllowValue = function( inputTag, divTag )
	{
		var valid = true;
		
		var value = inputTag.val().toUpperCase();
		var valueNotAllow = inputTag.attr("valueNotAllow").toUpperCase();
		
		if ( value && value == valueNotAllow )
		{
			divTag.append( me.getErrorSpanTag( 'common_validation_notAllowClientWith' ) );
			divTag.append( me.getErrorSpanTag( valueNotAllow ) );
			valid = false;
		}
		
		return valid;
	};
	
	me.checkNotAllowSpecialChars = function( inputTag, divTag )
	{
		var valid = true;
		
		var value = inputTag.val();
		var validValueReq = /^[(A-Za-z)( |')]+$/;
	    
	    if ( value && !value.match(validValueReq) ) {
	    	divTag.append( me.getErrorSpanTag( 'common_validation_notAllowSpecialChars' ) );
			valid = false;
	    }
	    return valid;
	};

	me.phoneNumberValidation = function( phoneVal )
	{
		var success = ( phoneVal == "" ) ? true : false;
		if( success ) {
			return { 'success': success, 'phoneNumber': phoneVal, 'msg': '' };
		}
		var msg = '';


		// Trim value
		var value = Util.trim( phoneVal );

		// Starts with '0'
		if ( Util.startsWith( value, "0" ) )
		{
			if ( !( value.length >= 12 && value.length <= 15 ) )
			{
				msg += 'common_validation_phoneNumberLengthFor0';
			}
			else if( Util.isNumberDigit(value) )
			{
				success = true;
			}
			else
			{
				msg += 'common_validation_phoneNumberAcceptPlusLetterAndNumberOnly';
			}
		}
		else if ( Util.startsWith( value, "+" ) )
		{
			if ( value.length != 11 )
			{
				msg += 'common_validation_phoneNumberLengthForLocal';
			}
			else if( Util.isNumberDigit(value.replace("+","")) )
			{
				success = true;
			}
			else{
				msg += 'common_validation_phoneNumberAcceptPlusLetterAndNumberOnly';
			}
		}
		else
		{
			msg += "common_validation_phoneNumberStartWith";
		}

		
		return { 'success': success, 'phoneNumber': value, 'msg': msg };	
	}
	
	// -----------------------------
	// -- Others
	
	me.getErrorSpanTag = function( keyword )
	{
		var text = me.translationObj.getTranslatedValueByKey( keyword );
		return  $( "<span class='errorMsg' keyword='" + keyword + "'>" + text + "</span>" );		
	};
	
	me.clearTagValidations = function( tags )
	{
		tags.css( "background-color", "" ).val( "" ).attr( "altval", "" );
		
		tags.each( function() {
			$( this ).closest( "div" ).find( "span.errorMsg" ).remove();
		});		
	};	
}