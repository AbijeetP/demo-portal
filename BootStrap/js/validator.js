var Validator = {
  response: {
    hasError: false,
    errors: {}
  },
  classes: {
    required: 'reqCntrl',
    email: 'invalidEmail',
    number: 'invalidNumber',
    digits: 'invalidDigits',
    confirmPassword: 'cnfmPassword',
    hasMaxLength: 'invalidLength',
    phone: 'phone',
    isInvalid: 'inValid',
    valid: 'valid',
    greaterThanZero: 'greaterThanZero',
    confirmEmail: 'confirmEmail'
  },
  errorMessages: {
    required: 'This field is required.',
    email: 'Invalid email.',
    number: 'Invalid number.',
    digits: 'Invalid digits.',
    hasMaxLength: 'Invalid Length.',
    phone: 'Invalid phone number.',
    isInvalid: 'In Valid.',
    valid: 'Valid.',
    confirmPassword: 'These passwords don\'t match.',
    greaterThanZero: 'Value is not greater than zero.',
    confirmEmail: 'Email and confirm email should be same.'
  },
  currHandler: {},
  /*
   * This function is used to get labels from passed labels array.
   * If there are is messages array then pass
   */
  getErrorMessages: function (label, errorMessage) {
    if (this.currHandler.hasOwnProperty('labels') &&
      jQuery.type(this.currHandler.labels['error_' + label]) !== 'undefined'
      && this.currHandler.labels['error_' + label]) {
      return this.currHandler.labels['error_' + label];
    }
    return errorMessage;
  },
  regularExpressions: {
    email: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
    digits: /^\d+$/,
    phone: /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/
  },
  resetResponse: function ($formCntrls) {
    this.response.hasError = false;
    this.response.errors = {};
    this.resetControlErrors($formCntrls);
  },
  resetControlErrors: function ($cntrls) {
    $cntrls.parent().find('.text-danger').addClass('hidden');
    $cntrls.parents('div.form-group').removeClass('has-error');
    $cntrls.children().children('div.form-group').removeClass('has-error');
  },
  setError: function ($currInput, msgToShow) {
    $currInput.parents('div.form-group').addClass('has-error');
    this.response.hasError = true;
    $currInput.parent().find('.text-danger').remove();
    if (msgToShow.length > 0 && $currInput.attr('type') !== 'radio') {
      $currInput.parent().append('<span class="text-danger">' + msgToShow + '</span>');
    } else if (msgToShow.length > 0 && $currInput.attr('type') === 'radio') {
      $currInput.parents().closest('.radiobtn-ctrl-div').find('span.text-danger').parent().remove();
      $currInput.parents().closest('.radiobtn-ctrl-div').append('<div><span class="text-danger">' + msgToShow + '</span></div>');
    }
  },
  removeErrForFld: function ($inputFld) {
    $inputFld.parents('div.form-group').removeClass('has-error');
    if ($inputFld.attr('type') === 'radio') {
      $inputFld.parents().closest('.radiobtn-ctrl-div').find('.text-danger').parent().remove();
    } else {
      $inputFld.parent().find('.text-danger').remove();
    }
  },
  validateFormCntrls: function ($formCntrls, currHandler) {
    this.currHandler = currHandler;
    this.resetResponse($formCntrls);
    var inputs = $formCntrls.find('input:text,  input:file, input:password, textarea, input[type="email"]').not('.hidden');
    var rdoFields = $formCntrls.find('input[type="radio"], input[type="checkbox"]').not('.hidden');
    var selectFields = $formCntrls.find('select').not('.hidden');
    var files = $formCntrls.find('input:file');
    for (var i = 0; i <= files.length; i++) {
      var $currInput = jQuery(files[i]);
      this.validateInputFldFile($currInput);
    }
    for (var i = 0; i <= inputs.length; i++) {
      var $currInput = jQuery(inputs[i]);
      this.validateInputFld($currInput);
    }
    for (var i = 0; i <= selectFields.length; i++) {
      var $currSelectField = jQuery(selectFields[i]);
      this.validateSelectFld($currSelectField);
    }
    for (var i = 0; i <= rdoFields.length; i++) {
      var $currRdoField = jQuery(rdoFields[i]);
      this.validateRdoFld($currRdoField);
    }
    return this.response;
  },
  validateRdoFld: function ($currRdoField) {
    if (jQuery('input[name = "' + $currRdoField.attr("name") + '"]').hasClass(this.classes.required)) {
      var isChecked = this.isChecked($currRdoField);
      if (!isChecked) {
        var errorMessage = this.getErrorMessages('required', this.errorMessages.required);
        this.setError($currRdoField, errorMessage);
      } else {
        this.removeErrForFld($currRdoField);
      }
    }
  },
  validateInputFldFile: function ($currInput) {
    var files = $currInput.prop('files');
    if ($currInput.hasClass(this.classes.required) && files.length < 1) {
      var errorMessage = this.getErrorMessages('required', this.errorMessages.required);
      this.setError($currInput, errorMessage);
      return;
    } else {
      this.removeErrForFld($currInput);
    }
  },
  validateInputFld: function ($currInput) {
    var cntrlVal = $currInput.val() ? $currInput.val().trim() : $currInput.val();
    var isEmpty = this.isEmpty(cntrlVal);
    if ($currInput.hasClass(this.classes.required) && isEmpty) {
      var errorMessage = this.getErrorMessages('required', this.errorMessages.required);
      this.setError($currInput, errorMessage);
      return;
    } else {
      this.removeErrForFld($currInput);
    }
    if (isEmpty) {
      return;
    }
    if ($currInput.hasClass(this.classes.email)) {
      var isEmail = this.isEmail(cntrlVal);
      if (!isEmail) {
        var errorMessage = this.getErrorMessages('email', this.errorMessages.email);
        this.setError($currInput, errorMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.phone)) {
      var isPhone = this.isPhone(cntrlVal);
      if (!isPhone) {
        var errorMessage = this.getErrorMessages('phone', this.errorMessages.phone);
        this.setError($currInput, errorMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.number)) {
      var isNumber = this.isNumber(cntrlVal);
      if (!isNumber) {
        var errorNumbMessage = this.getErrorMessages('number', this.errorMessages.number);
        this.setError($currInput, errorNumbMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.digits)) {
      var isdigit = this.isDigit(cntrlVal);
      if (!isdigit) {
        var errorDigitsMessage = this.getErrorMessages('digits', this.errorMessages.digits);
        this.setError($currInput, errorDigitsMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.hasMaxLength)) {
      var maxLngth = $currInput.attr('maxlength');
      var hasMaxLength = this.hasMaxLength(cntrlVal, maxLngth);
      if (!hasMaxLength) {
        var errorMaxLengMessage = this.getErrorMessages('hasMaxLength', this.errorMessages.hasMaxLength);
        this.setError($currInput, errorMaxLengMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.greaterThanZero)) {
      var isgreaterThanZero = this.isGreaterThanZero(cntrlVal);
      if (!isgreaterThanZero) {
        var errorGreaterThanError = this.getErrorMessages('greaterThanZero', this.errorMessages.greaterThanZero);
        this.setError($currInput, errorGreaterThanError);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.confirmPassword)) {
      var password = $currInput.parents('form').find('input[name="password"]').val();
      var confirmPassword = cntrlVal;
      if (password !== confirmPassword) {
        var errorMessage = this.getErrorMessages('confirmPassword', this.errorMessages.confirmPassword);
        this.setError($currInput, errorMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
    if ($currInput.hasClass(this.classes.confirmEmail)) {
      var email = $currInput.parents('form').find('input[name="EmailID"]').val();
      var confirmEmail = cntrlVal;
      if (email !== confirmEmail) {
        var errorMessage = this.getErrorMessages('confirmEmail', this.errorMessages.confirmEmail);
        this.setError($currInput, errorMessage);
        return;
      } else {
        this.removeErrForFld($currInput);
      }
    }
  },
  validateSelectFld: function ($currSelectField) {
    if ($currSelectField.hasClass(this.classes.required)) {
      var isSelected = this.isSelected($currSelectField.val());
      if (!isSelected) {
        var errorRequireMessages = this.getErrorMessages('required', this.errorMessages.required);
        this.setError($currSelectField, errorRequireMessages);
        return;
      }
      this.removeErrForFld($currSelectField);
    }
  },
  isEmpty: function (val) {
    if (jQuery.trim(val) === '') {
      return true;
    }
    return false;
  },
  isEmail: function (val) {
    if (Validator.regularExpressions.email.test(val)) {
      return true;
    }
    return false;
  },
  isPhone: function (val) {
    if (Validator.regularExpressions.phone.test(val)) {
      return true;
    }
    return false;
  },
  isNumber: function (val) {
    if (isNaN(val)) {
      return false;
    }
    return true;
  },
  isDigit: function (val) {
    var areOnlyDigits = Validator.regularExpressions.digits.test(val.trim());
    if (areOnlyDigits) {
      return true;
    }
    return false;
  },
  hasMaxLength: function (val, maxLen) {
    if (val.length <= maxLen) {
      return true;
    }
    return false;
  },
  isGreaterThanZero: function (val) {
    val = parseInt(val);
    if (val > 0) {
      return true;
    }
    return false;
  },
  isSelected: function (val) {
    if (jQuery.trim(val) === '' || jQuery.trim(val) === '-1') {
      return false;
    }
    return true;
  },
  isChecked: function ($radioField) {
    var name = $radioField.attr('name');
    var selectedRadioBtns = jQuery('input[name = "' + name + '"]:checked');
    if (selectedRadioBtns.length > 0) {
      return true;
    }
    return false;
  }
};
