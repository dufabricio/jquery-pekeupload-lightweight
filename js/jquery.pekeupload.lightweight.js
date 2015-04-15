/*
 *  PekeUpload 1.0.6 - jQuery plugin
 *  written by Pedro Molina
 *  Extended by Eduardo L. Fabricio
 *  http://www.pekebyte.com/
 *
 *  Copyright (c) 2013 Pedro Molina (http://pekebyte.com)
 *  Dual license
 *  Built for jQuery library
 *  http://jquery.comd under the MIT (MIT-LICENSE.txt)
 *  and GPL (GPL-LICENSE.txt) licenses.
 *
 */
(function($) {

  $.fn.pekeUpload = function(options){

    var defaultMessages = {
          btnUploadLabel:"Load files...",
          invalidExtError:"File extension not permited !",
          sizeError:"File max. size exceed !"
    };

    // default configuration properties
    var defaults = {
      messages:  {},
      onSubmit:     false,
      url:          "",
      field:        "file",
      data:         null,
      formSubmitMode:   false,
      multi:        true,
      showFilename:       true,
      showPercent:        true,
      allowedExtensions:  "",
      invalidExtError:    "",
      maxSize:      0,
      sizeError: "",
      onUploadSuccess: function (element, file, data) {
        $("." + element.attr("id") + "-container .attach-messages")
            .removeClass('error')
            .addClass('success')
            .html("Upload success!");
      },
      onUploadError: function (element, error) {
        $("." + element.attr("id") + "-container .attach-messages")
            .removeClass('success')
            .addClass('error')
            .html(error);
      }
    };

    var messages = $.extend(defaultMessages, defaults.messages);
    var options = $.extend(defaults, options);
    options.messages = messages;


    //Main function
    var obj;
    var uploadForm;
    var file = new Object();

    this.each(function() {
      obj = $(this);

      var html = '<a href="javascript:void(0)" class="btn-pekeupload">'+options.messages.btnUploadLabel+'</a><div class="pekecontainer"></div>';

      if(options.formSubmitMode) {
        uploadForm = obj.parents('form');
        uploadForm.attr('action',options.url);
        var redirectUriParam = $("<input name=\"redirectUri\" type=\"hidden\" value=\""+window.location.href+"\"/>");
        uploadForm.prepend(redirectUriParam);
      }



      obj.after(html);
      obj.hide();
      //Event when clicked the newly created link
      obj.next('a').click(function(){
        obj.click();
      });
      //Event when user select a file
      obj.change(function(){
        file.name = obj.val().split('\\').pop();
        file.size = (obj[0].files[0].size/1024)/1024;
        if (isValid()==true){
          if (options.onSubmit==false){
            UploadFile();
          }
          else{
            obj.next('a').next('div').prepend('<br /><span class="filename">'+file.name+'</span>');
            obj.parent('form').bind('submit',function(){
              obj.next('a').next('div').html('');
              UploadFile();
            });
          }
        }
      });
    });

    //Function that uploads a file
    function UploadFile(){
      var error = true;
      var htmlprogress = '<div class="file"><div class="filename"></div><div class="progress-pekeupload"><div class="bar-pekeupload pekeup-progress-bar" style="width: 0%;"><span></span></div></div></div>';

      obj.next('a').next('div').prepend(htmlprogress);

      var formData = new FormData();
      formData.append(options.field, obj[0].files[0]);
      formData.append('data', options.data);

      if(options.formSubmitMode) {

        uploadForm.submit();

      }else{

        $.ajax({
          url: options.url,
          type: 'POST',
          data: formData,
          success: function (data) {

            var percent = 100;
            obj.next('a').next('div').find('.pekeup-progress-bar:first').width(percent + '%');
            obj.next('a').next('div').find('.pekeup-progress-bar:first').text(percent + "%");

            if (data == 1) {

              if (options.multi == false) {
                obj.attr('disabled', 'disabled');
              }
              options.onUploadSuccess(obj, file, data);
              obj.next('a').next('div').empty();

            } else {

              obj.next('a').next('div').find('.file:first').remove();
              options.onUploadSuccess(obj, file, data);
              error = false;

            }
          },
          xhr: function () {  // custom xhr
            myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) { // check if upload property exists
              myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
            }
            return myXhr;
          },
          cache: false,
          contentType: false,
          processData: false
        });
      }
      return error;
    }
    //Function that updates bars progress
    function progressHandlingFunction(e){
      if(e.lengthComputable){
        var total = e.total;
        var loaded = e.loaded;
        if (options.showFilename==true){
          obj.next('a').next('div').find('.file').first().find('.filename:first').text(file.name);
        }
        if (options.showPercent==true){
          var percent = Number(((e.loaded * 100)/e.total).toFixed(2));
          obj.next('a').next('div').find('.file').first().find('.pekeup-progress-bar:first').width(percent+'%');
        }
        obj.next('a').next('div').find('.file').first().find('.pekeup-progress-bar:first').html('<center>'+percent+"%</center>");
      }
    }
    //Validate master
    function isValid(){
      var canUpload = true;
      if (options.allowedExtensions!=""){
        var validationresult = validateExtension();
        if (validationresult == false){
          canUpload = false;
          options.onUploadError(obj, options.messages.invalidExtError);
          return canUpload;
        } else{
          canUpload = true;
        }
      }
      if (options.maxSize>0){
        var validationresult = validateSize();
        if (validationresult == false){
          canUpload = false;
          options.onUploadError(obj, options.messages.sizeError);
          return canUpload;
        } else{
          canUpload = true;
        }
      }
      return canUpload
    }
    //Validate extension of file
    function validateExtension(){
      var ext = obj.val().split('.').pop().toLowerCase();
      var allowed = options.allowedExtensions.split("|");
      if($.inArray(ext, allowed) == -1) {
        return false;
      }
      else{
        return true;
      }
    }
    //Validate Size of the file
    function validateSize(){
      if (file.size > options.maxSize){
        return false;
      }
      else{
        return true;
      }
    }

  };

})(jQuery);