<?php
// setup connection to database ( $con )
include 'sqlConnect.php';

// retrieve
$query = "SELECT PauseTime FROM `simulation` WHERE ID=1";
$result = $con->query($query) or die($con->error.__LINE__);
$row = mysqli_fetch_array($result);

// show
$pauseTime = $row['PauseTime'];
echo strtotime($pauseTime);
?>