@echo off
echo ==========================================
echo   QReact Cloud Build Script
echo ==========================================
echo.
echo   API Server: http://203.150.53.240:2006
echo   UI Server:  http://203.150.53.240:2004
echo.
echo ==========================================
echo.

set DEPLOY_DIR=deploy\output-cloud
set PORTAL_DIR=portal
set PO_DIR=Q-ERPc\purchase\purchase-order

if "%1"=="all" goto :build_all
if "%1"=="portal" goto :build_portal
if "%1"=="po" goto :build_po
goto :menu

:menu
echo Select mode:
echo   1. Build All (Portal + PO)
echo   2. Build Portal only
echo   3. Build Purchase Order only
echo   4. Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto :build_all
if "%choice%"=="2" goto :build_portal
if "%choice%"=="3" goto :build_po
if "%choice%"=="4" goto :end
goto :menu

:build_all
echo.
echo [1/4] Building Purchase Order...
cd %PO_DIR%
call npx vite build --mode cloud
if errorlevel 1 (
    echo ERROR: Build PO failed!
    cd ..\..\..
    pause
    goto :end
)
cd ..\..\..

echo.
echo [2/4] Building Portal...
cd %PORTAL_DIR%
call npx vite build --mode cloud
if errorlevel 1 (
    echo ERROR: Build Portal failed!
    cd ..
    pause
    goto :end
)
cd ..

echo.
echo [3/4] Creating Deploy folder...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%
mkdir "%DEPLOY_DIR%\po"

echo.
echo [4/4] Copying files...
xcopy /s /e /y /q %PORTAL_DIR%\dist\* %DEPLOY_DIR%\
copy /y deploy\web.config %DEPLOY_DIR%\web.config >nul

xcopy /s /e /y /q %PO_DIR%\dist\* "%DEPLOY_DIR%\po\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\po\web.config" >nul

echo.
echo ==========================================
echo   Build Complete!
echo ==========================================
echo.
echo Output: %DEPLOY_DIR%
echo.
echo Structure:
echo   %DEPLOY_DIR%\
echo   +-- index.html        (Portal)
echo   +-- assets\           (Portal assets)
echo   +-- web.config        (Portal config)
echo   +-- po\               (Purchase Order)
echo       +-- index.html
echo       +-- assets\
echo       +-- web.config
echo.
echo URLs after deploy:
echo   Portal: http://203.150.53.240:2004/
echo   PO:     http://203.150.53.240:2004/po/
echo.
goto :end

:build_portal
echo.
echo Building Portal...
cd %PORTAL_DIR%
call npx vite build --mode cloud
cd ..

echo.
echo Copying Portal files...
if not exist %DEPLOY_DIR% mkdir %DEPLOY_DIR%
xcopy /s /e /y /q %PORTAL_DIR%\dist\* %DEPLOY_DIR%\
copy /y deploy\web.config %DEPLOY_DIR%\web.config >nul

echo.
echo Build Portal Complete!
goto :end

:build_po
echo.
echo Building Purchase Order...
cd %PO_DIR%
call npx vite build --mode cloud
cd ..\..\..

echo.
echo Copying PO files...
if not exist "%DEPLOY_DIR%\po" mkdir "%DEPLOY_DIR%\po"
xcopy /s /e /y /q %PO_DIR%\dist\* "%DEPLOY_DIR%\po\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\po\web.config" >nul

echo.
echo Build Purchase Order Complete!
goto :end

:end
echo.
pause
