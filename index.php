<?php 
define('ROOT_DIR', __DIR__); 
header("Access-Control-Allow-Origin: *");
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Three.js demo</title>
        <script src="node_modules/three/build/three.js"></script>
        <script src="js/MTLLoader.js"></script>
        <script src="js/OBJLoader.js"></script>
        <script src="js/main.js"></script>
    </head>
    <body style="text-align:center; margin: 0;">
        <span style="position:absolute;top:0px;left:0px; color: white;">
			WASD to move.<br/>Arrow keys to turn.
		</span>
	</body>
</html>
