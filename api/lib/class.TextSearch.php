<?php
include_once 'class.UploadHandler.php';

class TextSearch  {
    
    /*
     * @param task
     * The task to initiate
     */
    public $task;
    
    /*
     * Class constructor
     */
    public function __construct($task = null) {
        //set the task
        $this->task = $task;
    }
    
    /*
     * Runs the requested task
     */
    public function doTask() {
        switch($this->task){
            case "uploadFile":
                return $this->uploadFile();
            case "loadFilesList":
                return $this->loadFilesList();
            case "loadFileContent":
                return $this->loadFileContent();
            default:
                return array('failure'=>true);
        }
    }
    
    /*
     * Handles text file upload
     */
    private function uploadFile() {
        //initialize the upload
        $uploads = new UploadHandler();
        
        //get the files
        $files = $uploads->getUploadedFiles();
        
        //create the response
        $response = array('success' => true, 'uploads' => $files['files']);
        
        return $response;
    }
    
    /*
     * Loads all files for the client side grid
     */
    private function loadFilesList() {
        $upload_dir = dirname($_SERVER['SCRIPT_FILENAME']).'/files/';
        if (!is_dir($upload_dir)) {
            return array();
        }
        $files = array_values(array_filter(scandir($upload_dir), function($item) {
            return !is_dir(dirname($_SERVER['SCRIPT_FILENAME']).'/files/' . $item);
        }));
        
        //wrap each record in an array as required by dataTables
        $result = array();
        foreach ($files as $file) {
            $result[] = array($file);
        }
        
        return array('data' => $result);
    }
    
    /*
     * Loads the content of the given file name
     */
    private function loadFileContent() {
        $fileName = (isset($_POST['filename']) ? $_POST['filename'] : $_GET['filename']);
        $upload_dir = dirname($_SERVER['SCRIPT_FILENAME']).'/files/';
        
        $content = htmlentities(file_get_contents($upload_dir.$fileName));
        
        header('Content-Type: text/html; charset=UTF-8');
        
        return array('success' => true, 'data' => $content);
    }
}