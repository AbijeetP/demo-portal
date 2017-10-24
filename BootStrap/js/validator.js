// Checks for jQuery and throws error if jQuery is not included
if (typeof jQuery === 'undefined') {
  throw new Error('osm-validator-js requires jQuery. jQuery must be included before osm-validator-js.');
}

(function ($) {
  $.fn.osmValidator = function (properties) {
    // Getting the form element
    const self = this;
    var defaultValidationSetting = $.fn.osmValidator.defaultOptions;
    var validationClasses = $.fn.osmValidator.classes;
    // Default options that can be over written by user options if any
    var options = $.extend(true, {}, defaultValidationSetting, properties);

    var inputs = [];
    var rdoFields = [];
    var selectFields = [];
    var files = [];
    var areFieldsCached = false;

    // The attributes that are used in HTML page
    const osmAttributes = {
      dataDefaultValue: 'data-default-value',
      dataTarget: 'data-target',
      hasMaxLength: 'data-max-length',
      dataMaxSize: 'data-max-size',
      dataExpectedFileType: 'data-expected-file-type',
      errorDisplay: 'error-element'
    };

    // The classes are declared at the bottom of the page with "$.fn.osmValidator.classes" variable.
    const classObject = {
      email: {
        class: validationClasses.email,
        fnName: 'isEmail'
      },
      phone: {
        class: validationClasses.phone,
        fnName: 'isPhone'
      },
      url: {
        class: validationClasses.url,
        fnName: 'isURL'
      },
      number: {
        class: validationClasses.number,
        fnName: 'isNumber'
      },
      digits: {
        class: validationClasses.digits,
        fnName: 'isDigit'
      },
      greaterThanZero: {
        class: validationClasses.greaterThanZero,
        fnName: 'isGreaterThanZero'
      }
    };

    const fnObject = (function () {
      return {
        isEmail: isEmail,
        isDigit: isDigit,
        isNumber: isNumber,
        isGreaterThanZero: isGreaterThanZero,
        isEmpty: isEmpty,
        isPhone: isPhone,
        isURL: isURL,
        compareValues: compareValues
      };
    })();

    const blurFunctions = {
      inputsBlur: function osmValidatorBlur () {
        osmValidator.validateInputFields($(this));
      },
      rdoBlur: function osmValidatorBlur () {
        osmValidator.validateRadio($(this));
      },
      selectBlur: function osmValidatorBlur () {
        osmValidator.validateSelect($(this));
      },
      fileInputBlur: function osmValidatorBlur () {
        osmValidator.validateFileInput($(this));
      }
    };

    /**
     * @desc Checks whether the value is empty or not. Returns true if the value is empty, else returns false
     * @param {string} val The string value that needs to be verified.
     * @return {boolean}
     */
    function isEmpty (val) {
      if (val.trim() === '') {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks whether the value is valid email or not. Returns true if it is a valid email, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isEmail (val) {
      if (options.regularExpressions.email.test(val)) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks whether the value is a valid phone number. Returns true if it is a valid phone number, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isPhone (val) {
      if (options.regularExpressions.phone.test(val)) {
        return true;
      }
      return false;
    }

    function isURL (val) {
      if (options.regularExpressions.url.test(val)) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks whether the value is valid number. Returns true if it is a valid number, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isNumber (value) {
      // Check if the number is falsy value except for 0
      if (!value && value !== '0') {
        return false;
      }
      // Check if the number if NaN
      if (isNaN(+value)) {
        return false;
      }
      // Alright its a number
      return true;
    }

    /**
     * @desc Checks whether the value is valid digit. Returns true if it is a valid digit, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isDigit (val) {
      var areOnlyDigits = options.regularExpressions.digits.test(val.trim());
      if (areOnlyDigits) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks the length of the input field with max length of the element. Returns true if length is not greater than max length, else returns false
     * @param {number} val The value that needs to be verified.
     * @param {number} maxLen The maximum length of the value.
     * @return {boolean}
     */
    function hasMaxLength (val, maxLen) {
      if (val.length <= maxLen) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks the value of the input field with '0'. Returns true if value is not greater than 0, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isGreaterThanZero (val) {
      if (isNumber(val)) {
        if (+val > 0) {
          return true;
        }
        return false;
      }
    }

    /**
     * @desc Checks whether an option in dropdown is selected. Returns true if the value is selected, else returns false
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isSelected (val, defaultOptValue) {
      var selectedValue = val.trim();
      if (selectedValue === '' || selectedValue === defaultOptValue) {
        return false;
      }
      return true;
    }

    /**
     * Validates whether radio buttons are selected or checkboxes are checked.
     * Returns true if checkbox is checked or radio button is selected, else returns false
     * It validates both radio buttons and checkboxes
     * @param {string} val The value that needs to be verified.
     * @return {boolean}
     */
    function isChecked ($radioField) {
      var name = $radioField.attr('name');
      var selectedRadioBtns = $('input[name = "' + name + '"]:checked');
      if (selectedRadioBtns.length > 0) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks the value of the input field with maxSize. Returns true if the value is greater than maxSize, else returns false
     * @param {number} cntrlSize The size of the file that needs to be verified.
     * @param {number} maxSize The maximum file size
     * @return {boolean}
     */
    function isFileMaxSizeExceeded (cntrlSize, maxSize) {
      if (cntrlSize > +maxSize) {
        return true;
      }
      return false;
    }

    /**
     * @desc Checks the field value with the other field value. Returns true if both values are same, else returns false
     * @param {object} eleToCompareWith The element with which the current element must be compared
     * @param {object} $currInput The current element
     * @param {string} cntrlVal The value of the current element
     */
    function compareValues (cntrlVal, eleToCompareWith, $currInput) {
      var compareEleValue = self.find(eleToCompareWith).val();
      var currEleValue = cntrlVal;
      var areValuesSame = true;
      if (compareEleValue !== currEleValue) {
        areValuesSame = false;
      }
      return areValuesSame;
    }
    /**
     * @desc Checks whether the file types are valid or not based on the valid file types (Types are to be passed by user).
     * Returns true if it is an invalid type, else returns false
     * @param {string} cntrlFileTypes The file type of the files selected through element
     * @param {array} fileTypes The valid file type of the files
     * @return {boolean}
     */
    function isInvalidFileType (cntrlFileTypes, fileTypes) {
      // Trimming the value (the expected file types given for input type file) of "data-expected-file-type" attribute which is present in file element.
      fileTypes.trim();
      var invalidFileTypes = [];
      if (fileTypes.length === 0) {
        return invalidFileTypes;
      }
      fileTypes = fileTypes.split(',');
      for (var i = 0; i < fileTypes.length; i++) {
        // Trim each file type
        fileTypes[i] = fileTypes[i].trim();
        if (fileTypes[i].charAt(0) === '.') {
          fileTypes[i] = fileTypes[i].slice(1);
        }
      }
      // Loop through the uploaded file types and return the invalid file types
      for (i = 0; i < cntrlFileTypes.length; i++) {
        if (fileTypes.indexOf(cntrlFileTypes[i]) === -1) {
          if (invalidFileTypes.indexOf(cntrlFileTypes[i]) === -1) {
            invalidFileTypes.push(cntrlFileTypes[i]);
          }
        }
      }
      // Validate the uploaded file extension when attribute is given
      if (invalidFileTypes.length === 0) {
        return false;
      }
      return invalidFileTypes;
    }

    /**
     * @desc This function checks for the input elements that are already present in the response object, if not then adds the element to the response object
     * If object is already present it overwrites the error message
     * It even highlights the elements based on the highlight option that is passed by the user. By default it is true.
     * @param {array} $inputField The input element that needs to be validated and highlighted
     * @param {string} errorMessage The error message that need to displayed
     * @return {object}
     */
    function checkFieldsAndSetErrorMessages ($inputField, errorMessage) {
      if (osmValidator.response === undefined) {
        return;
      }
      if (osmValidator.response.errors.hasOwnProperty($inputField[0].name)) {
        osmValidator.response.errors[$inputField[0].name].errorMessage = errorMessage;
      } else {
        osmValidator.response.errors[$inputField[0].name] = {
          errorMessage: errorMessage
        };
      }
      osmValidator.setError($inputField, errorMessage);
      return osmValidator.response;
    }

    /**
     * @desc This function finds all the controls of the form and store them in the corresponding array
     * @param {object} $formCntrls element
     */
    function getFormControls ($formCntrls) {
      if (areFieldsCached) {
        return;
      }
      inputs = $formCntrls.find('input:text, input:password, textarea, input[type="email"], input[type="tel"], input[type="url"]').not('.hidden');
      rdoFields = $formCntrls.find('input[type="radio"], input[type="checkbox"]').not('.hidden');
      selectFields = $formCntrls.find('select').not('.hidden');
      files = $formCntrls.find('input:file');
      areFieldsCached = true;
    }

    /**
     * @desc This method adds the blur event to the form elements if setBlurEvent is set to true. By default the option is true
     * @param {array} $formCntrls The form element
     */
    function setBlurEvents ($formCntrls) {
      getFormControls($formCntrls);

      // Removes blur event
      removeBlurEvents($formCntrls);

      // Adding blur event for input fields
      inputs.blur(blurFunctions.inputsBlur);

      // Adding blur event for radio buttons
      rdoFields.blur(blurFunctions.rdoBlur);

      // Adding blur event for radio buttons
      selectFields.blur(blurFunctions.selectBlur);

      // Adding blur event for radio buttons
      files.blur(blurFunctions.fileInputBlur);
    }

    /**
     * @desc This function removes the blur events that are attached by osmValidator to the form elements
     * @param {array} $formCntrls The form element
     */
    function removeBlurEvents ($formCntrls) {
      getFormControls($formCntrls);
      files.off('blur', blurFunctions.fileInputBlur);
      inputs.off('blur', blurFunctions.inputsBlur);
      selectFields.off('blur', blurFunctions.selectBlur);
      rdoFields.off('blur', blurFunctions.rdoBlur);
    }

    /**
     * @desc Checks if the values of the elements are valid. If elements are not valid error messages are generated based on the validation
     * @param {boolean} valid The result of the validation that is returned from the validation functions
     * @param {string} className The class name (The classes which are used for validation in HTML page. Ex req-cntrl, invalid-email etc)
     * @param {array} $currInput The current element for validation
     * @return {boolean}
     */
    function checkValidation (valid, className, $currInput) {
      var isValid = true;
      if (!valid) {
        var errorMessage = options.errorMessages[className];
        osmValidator.response.hasError = true;
        checkFieldsAndSetErrorMessages($currInput, errorMessage);
        isValid = false;
      } else {
        if (options.setHighlight) {
          osmValidator.removeError($currInput);
        }
      }
      return isValid;
    }

    /**
     * @desc Gets the maximum file size and converts into human readable format. For example, 1000000 bytes is converted 1.0 MB
     * @param {number} maxFileSize The maximum file size in bytes
     * @returns {string}
     */
    function humanizeFileSize (maxFileSize) {
      var bytes = 1000;
      if (Math.abs(maxFileSize) < bytes) {
        return maxFileSize + ' B';
      }
      var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var unit = -1;
      do {
        maxFileSize /= bytes;
        ++unit;
      } while (Math.abs(maxFileSize) >= bytes && unit < units.length - 1);
      return maxFileSize.toFixed(1) + ' ' + units[unit];
    }

    // Calling blur event function if setBlurEvent is set to true
    if (options.setBlurEvent) {
      setBlurEvents(self);
    }

    var osmValidator = {
      response: {
        hasError: false,
        errors: {}
      },

      /**
       * @desc This function over writes the options with the user object
       * @param {object} prop The options that must be replaced with the form options
       */
      setFormOptions: function (prop) {
        options = $.extend(true, options, prop);
        if (prop.hasOwnProperty('setBlurEvent')) {
          if (options.setBlurEvent) {
            setBlurEvents(self);
          } else {
            removeBlurEvents(self);
          }
        }
      },

      /**
       * This functions returns the default options or the present options to the form element
       */
      getFormOptions: function () {
        return JSON.parse(JSON.stringify(options));
      },

      /**
       * @desc This function clears the response object and
       * removes the classes that are added to the elements (internally calls resetControlErrors)
       */
      resetResponse: function () {
        var $formCntrls = self;
        osmValidator.response.hasError = false;
        osmValidator.response.errors = {};
        osmValidator.resetControlErrors($formCntrls);
      },

      /**
       * @desc This function removes the classes that are added to the elements
       */
      resetControlErrors: function () {
        self.find('div.form-group').removeClass('has-error');
        self.find('.text-danger').remove();
      },

      /**
       * @desc This function sets the error by adding has-error class
       * @param {object} $currInput The element of the form that has error or is not valid
       * @param {string} msgToShow The message that needs to be displayed
       */
      setError: function ($currInput, msgToShow) {
        if (!options.setHighlight) {
          return;
        }
        var $currIntParent = $currInput.parents('div.form-group').first();
        var displayError = $currInput.attr(osmAttributes.errorDisplay);
        var $currErrorField = $currIntParent.find(displayError);
        $currIntParent.addClass('has-error');
        $currIntParent.find('.text-danger').remove();
        if (msgToShow.length > 0) {
          if ($currInput.attr('type') !== 'radio') {
            $currErrorField.append('<span class="text-danger">' + msgToShow + '</span>');
          } else {
            $currIntParent.find('.text-danger').remove();
            $currErrorField.append('<span class="text-danger">' + msgToShow + '</span>');
          }
        }
      },

      /**
       * @desc This function removes the error class that is added by setError function
       * @param {object} $inputField The element of the form for which the error must be removed
       */
      removeError: function ($inputField) {
        if (!options.setHighlight) {
          return;
        }
        for (var i = 0; i < osmValidator.response.errors.length; i++) {
          if (osmValidator.response.errors[i].hasOwnProperty($inputField[0].id)) {
            osmValidator.response.errors.splice(i, 1);
          }
        }
        var $inputFieldParent = $inputField.parents('div.form-group').first();
        $inputFieldParent.removeClass('has-error');
        $inputFieldParent.find('.text-danger').remove();
      },

      /**
       * @desc This function validates all the form controls and returns the response which holds error elements and error messages
       * @return {object}
       */
      validateFormControls: function () {
        osmValidator.resetResponse(self);
        getFormControls(self);

        // Validates input elements of type 'file
        for (var i = 0; i < files.length; i++) {
          var $currInputFileField = $(files[i]);
          osmValidator.validateFileInput($currInputFileField);
        }

        // Validates input elements of type 'text, password, textarea and email'
        for (i = 0; i < inputs.length; i++) {
          var $currInput = $(inputs[i]);
          osmValidator.validateInputFields($currInput);
        }

        // Validates drop down elements
        for (i = 0; i < selectFields.length; i++) {
          var $currSelectField = $(selectFields[i]);
          osmValidator.validateSelect($currSelectField);
        }

        // Validates radio buttons or checkboxes
        for (i = 0; i < rdoFields.length; i++) {
          var $currRdoField = $(rdoFields[i]);
          osmValidator.validateRadio($currRdoField);
        }
        return this.response;
      },

      /**
       * @desc This function gets the elements of type "text, textarea, passowrd, email" from the form element and validates them based on the classes
       * @param {object} $currInput The current element that must be validated.
       */
      validateInputFields: function ($currInput) {
        var cntrlVal = $currInput.val() ? $currInput.val().trim() : $currInput.val();
        var isEmptyValue = isEmpty(cntrlVal);
        if ($currInput.hasClass(validationClasses.required) && isEmptyValue) {
          var errorMessage = options.errorMessages.required;
          osmValidator.response.hasError = true;
          checkFieldsAndSetErrorMessages($currInput, errorMessage);
        } else {
          if (options.setHighlight) {
            osmValidator.removeError($currInput);
          }
        }
        if (isEmptyValue) {
          return;
        }

        // Checks for data-max-length attribute
        if ($currInput[0].hasAttribute(osmAttributes.hasMaxLength)) {
          var maxLen = $currInput.attr(osmAttributes.hasMaxLength);
          var isValidLength = hasMaxLength(cntrlVal, maxLen);
          var isValid = checkValidation(isValidLength, 'hasMaxLength', $currInput);
          if (!isValid) {
            return;
          }
        }

        // It compares two field values and validates whether both fields holds same values.
        if ($currInput[0].hasAttribute(osmAttributes.dataTarget)) {
          var dataTargetElement = $currInput.attr(osmAttributes.dataTarget);
          var isValueSame = compareValues(cntrlVal, dataTargetElement, $currInput);
          var isSame = checkValidation(isValueSame, 'confirmPassword', $currInput);
          if (!isSame) {
            return;
          }
        }

        // Checks the classes and validates them accordingly
        for (var prop in classObject) {
          var classObjProp = classObject[prop];
          if ($currInput.hasClass(classObjProp.class)) {
            var validValue = fnObject[classObjProp.fnName].apply(null, [cntrlVal]);
            isValid = checkValidation(validValue, prop, $currInput);
            if (!isValid) {
              break;
            }
          }
        }
      },

      /**
       * @desc This function gets the elements of type "radio or checkkbox" from the form element and validates them based on the class "required"
       * @param {object} $currInput The current element on the form
       */
      validateRadio: function ($currRdoField) {
        if ($('input[name = "' + $currRdoField.attr('name') + '"]').hasClass(validationClasses.required)) {
          var validChecked = isChecked($currRdoField);
          checkValidation(validChecked, 'required', $currRdoField);
        }
      },

      /**
       * @desc This function gets the elements of type "file" from the form element and validates the file type, file size
       * It even checks for field required class
       * @param {object} $currInput The current element on the form
       */
      validateFileInput: function ($currInput) {
        var files = $currInput.prop('files');
        if ($currInput.hasClass(validationClasses.required) && files.length < 1) {
          var errorMessage = options.errorMessages.required;
          osmValidator.response.hasError = true;
          checkFieldsAndSetErrorMessages($currInput, errorMessage);
          return osmValidator.response;
        }

        // Check if data-expected-file-type attribute is added to the input type file, only then validates the files type
        if ($currInput[0].hasAttribute(osmAttributes.dataExpectedFileType)) {
          // Get the allowable uploaded files type attribute that is given
          var fileTypes = $currInput.attr(osmAttributes.dataExpectedFileType);
          if (fileTypes === undefined) {
            osmValidator.removeError($currInput);
            return osmValidator.response;
          }
          // Loop through the uploaded file names and get the extensions
          var controlFileTypes = [];
          for (var i = 0; i < files.length; i++) {
            controlFileTypes.push(files[i].name.split('.').pop());
          }
          // Validate the files type by calling isInvalidFileType method
          var invalidFileTypes = isInvalidFileType(controlFileTypes, fileTypes);
          // Show the error if uploaded files type are invalid
          if (invalidFileTypes) {
            errorMessage = options.errorMessages.dataExpectedFileType + invalidFileTypes.toString() + '.';
            osmValidator.response.hasError = true;
            checkFieldsAndSetErrorMessages($currInput, errorMessage);
            return osmValidator.response;
          }
        }

        // Check if data-max-size attribute is added to the input type file, only then validates the files size
        if ($currInput[0].hasAttribute(osmAttributes.dataMaxSize)) {
          // Get the allowable uploaded file size attribute that is given
          var maxSize = $currInput.attr(osmAttributes.dataMaxSize);
          var cntrlSize = 0;
          // Sum up all the file sizes
          for (i = 0; i < files.length; i++) {
            cntrlSize += (files[i].size || files[i].fileSize);
          }
          // Validate the files size by calling isFileMaxSizeExceeded method
          var validDataMaxSize = isFileMaxSizeExceeded(cntrlSize, maxSize);
          // Show the error if uploaded files exceeds allowable file size
          if (validDataMaxSize) {
            var humanisedFielSize = humanizeFileSize(maxSize, false);
            errorMessage = options.errorMessages.dataMaxSize + humanisedFielSize + '.';
            osmValidator.response.hasError = true;
            checkFieldsAndSetErrorMessages($currInput, errorMessage);
            return osmValidator.response;
          }
        }
        osmValidator.removeError($currInput);
      },

      /**
       * @desc This function gets the elements based on "Select" tag from the form element and validates them based on the class "required"
       * @param {object} $currInput The current element on the form
       */
      validateSelect: function ($currSelectField) {
        if ($currSelectField.hasClass(validationClasses.required)) {
          var defaultValue = $currSelectField.attr(osmAttributes.dataDefaultValue);
          var validSelected = isSelected($currSelectField.val(), defaultValue);
          checkValidation(validSelected, 'required', $currSelectField);
        }
      }
    };
    return osmValidator;
  };

  $.fn.osmValidator.defaultOptions = {
    errorMessages: {
      required: 'This field is required.',
      email: 'Invalid email.',
      number: 'Invalid number.',
      digits: 'Invalid digits.',
      hasMaxLength: 'Invalid length.',
      phone: 'Invalid phone number.',
      isInvalid: 'In Valid.',
      valid: 'Valid.',
      confirmPassword: 'Passwords don\'t match.',
      greaterThanZero: 'Value must be greater than zero.',
      dataMaxSize: 'Uploaded file(s) size should not exceed more than ',
      dataExpectedFileType: 'You have uploaded file(s) with invalid extension ',
      url: 'Invalid URL.'
    },
    regularExpressions: {
      email: /^([à-ÿÀ-Ÿ\w]+\.?[à-ÿÀ-Ÿ\w\]*[à-ÿÀ-Ÿ\w]+@([à-ÿÀ-Ÿ\w]+\.)+[à-ÿÀ-Ÿ\w-]{2,4})?$/,
      digits: /^\d+$/,
      phone: /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/,
      url: /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,}|[a-zA-Z0-9]\.[^\s])$/
    },
    setHighlight: true,
    setBlurEvent: true
  };

  // Classes that are to be used in HTML page
  $.fn.osmValidator.classes = {
    required: 'req-cntrl',
    email: 'invalid-email',
    number: 'invalid-number',
    digits: 'invalid-digits',
    phone: 'phone',
    greaterThanZero: 'greater-than-zero',
    url: 'url'
  };
})(jQuery);