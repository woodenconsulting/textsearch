<?php
include ('lib/class.TextSearch.php');

/*
 * Get the request objects
 */
$task = (isset($_POST['task']) ? $_POST['task'] : $_GET['task']);

/*
 * Instantiate the class
 */
$TXT = new textSearch($task);

/*
 * Run the task
 */
$response = $TXT->doTask();

/*
 * Send back the response
 */
echo json_encode($response);