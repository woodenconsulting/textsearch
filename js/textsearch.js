$(function() {
    /*
     * Define some static variables
     */
    var serverURL = 'http://'+window.location.hostname+'/samples/TextSearch/api/proxy.php',
        gridOptions = {
            ajax: serverURL+'?task=loadFilesList',
            paging:   false,
            ordering: false,
            info:     false,
            bFilter:  false
        },
        uploadTimeout,
        keyTimeout,
        selectedFile,
        selectedFileContent = $("#main-content").html();
        
    /*
     * Define file uploads grid
     */
    $('#files-grid').dataTable(gridOptions);
    
    /*
     * Handle file uploads
     */
    $('#fileupload').fileupload({
        url: serverURL+'?task=uploadFile',
        dataType: 'json',
        done: function (e, data) {
            //show the success message
            $('#upload-message').fadeIn(500);
            
            //clear timeout on previous upload
            if (uploadTimeout) { clearTimeout(uploadTimeout); }
            
            //handle post xhr after 1.5 seconds
            uploadTimeout = setTimeout(function(){
                //reload the data table
                $('#files-grid').dataTable().fnDestroy();
                $('#files-grid').dataTable(gridOptions);

                //reset the progress indicator
                $('#progress .progress-bar').css('width', 0);
                
                //hide the message
                $('#upload-message').fadeOut(500);
            }, 1500);
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    
    /*
     * Handle various bindings
     */
    $("#upload-documents-button").click(function() {
        $("#document-upload-modal").dialog({
            height: 510,
            width: 800,
            resizable: false,
            show: {
                effect: "fade",
                duration: 500
            },
            hide: {
                effect: "fade",
                duration: 500
            }
        });
    });
    
    $('#files-grid tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        } else {
            $('#files-grid tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        
        selectedFile = $('td', this).eq(0).text();
        
        //clear the search value
        $("#document-search").val('');
        
        //clear any existing content highlights
        $("#main-content").html(selectedFileContent);
        
        //show the loading indicator
        $('#loading-indicator').fadeIn(400);
        
        //load the contents of the selected file
        $.ajax({
            url: serverURL+'?task=loadFileContent',
            data: {
                filename: selectedFile
            }
        })
        .done(function(data) {
            var result = $.parseJSON(data);
            
            //hide the loading indicator
            $('#loading-indicator').fadeOut(400);
            
            //keep track of the original content
            selectedFileContent = result.data;
            
            //update the content
            $('#main-content').html(result.data);
        });
    });
    
    $("#document-search").keyup(function(e) {
        var term = this.value,
            src_str = selectedFileContent;
            
        term = term.replace(/(\s+)/,"(<[^>]+>)*$1(<[^>]+>)*");
        var pattern = new RegExp("("+term+")", "gi");
        
        src_str = src_str.replace(pattern, "<mark>$1</mark>");
        src_str = src_str.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/,"$1</mark>$2<mark>$4");
        
        //clear timeout on previous keyup
        if (keyTimeout) { clearTimeout(keyTimeout); }

        //init highlighting after .6 seconds
        keyTimeout = setTimeout(function(){
            $("#main-content").html(src_str);
        }, 600);
    });
});