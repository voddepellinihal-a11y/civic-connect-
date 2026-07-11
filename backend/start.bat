@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=C:\Program Files\Java\jdk-17\bin;%PATH%"
cd /d C:\Nihal\JALALERT-main\JALALERT-main\backend
"%JAVA_HOME%\bin\java.exe" -jar target\jalalert-1.0.0.jar --server.port=9090 --spring.profiles.active=h2 --app.google.maps.key=
