<?php
// CONNECT TO THE DATABASE
$DB_NAME = 'db1_simtest';
$DB_HOST = 'davegasparini.fatcowmysql.com';
$DB_USER = 'player_01';
$DB_PASS = 'sim';
$con = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if (mysqli_connect_errno()) {
 printf("Connect failed: %s\n", mysqli_connect_error());
 exit();
}
?>

