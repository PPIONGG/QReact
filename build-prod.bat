@echo off
echo ==========================================
echo   QReact Production Build Script
echo ==========================================
echo.
echo   API Server: http://192.168.0.131:1003
echo   UI Server:  http://192.168.0.131:1005
echo   IIS Path:   C:\inetpub\Web PO
echo.
echo ==========================================
echo.

set DEPLOY_DIR=deploy\output
set "IIS_DIR=C:\inetpub\Web PO"
set PORTAL_DIR=portal
set PO_DIR=Q-ERPc\purchase\purchase-order

if "%1"=="all" goto :build_all
if "%1"=="portal" goto :build_portal
if "%1"=="po" goto :build_po
if "%1"=="copy" goto :copy_to_iis
goto :menu

:menu
echo Select mode:
echo   1. Build All (Portal + PO)
echo   2. Build Portal only
echo   3. Build Purchase Order only
echo   4. Copy to IIS (C:\inetpub\Web PO)
echo   5. Build All + Copy to IIS
echo   6. Exit
echo.
set /p choice="Enter choice (1-6): "

if "%choice%"=="1" goto :build_all
if "%choice%"=="2" goto :build_portal
if "%choice%"=="3" goto :build_po
if "%choice%"=="4" goto :copy_to_iis
if "%choice%"=="5" goto :build_and_copy
if "%choice%"=="6" goto :end
goto :menu

:build_all
echo.
echo [1/4] Building Purchase Order...
cd %PO_DIR%
call npx vite build --config vite.config.prod.ts
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
call npx vite build --config vite.config.prod.ts
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
echo   Portal: http://192.168.0.131:1005/
echo   PO:     http://192.168.0.131:1005/po/
echo.
goto :end

:build_portal
echo.
echo Building Portal...
cd %PORTAL_DIR%
call npx vite build --config vite.config.prod.ts
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
call npx vite build --config vite.config.prod.ts
cd ..\..\..

echo.
echo Copying PO files...
if not exist "%DEPLOY_DIR%\po" mkdir "%DEPLOY_DIR%\po"
xcopy /s /e /y /q %PO_DIR%\dist\* "%DEPLOY_DIR%\po\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\po\web.config" >nul

echo.
echo Build Purchase Order Complete!
goto :end

:copy_to_iis
echo.
echo Copying to IIS...
echo From: %DEPLOY_DIR%
echo To:   %IIS_DIR%
echo.

if not exist %DEPLOY_DIR% (
    echo ERROR: Folder %DEPLOY_DIR% not found
    echo Please build first!
    pause
    goto :end
)

if not exist "%IIS_DIR%" mkdir "%IIS_DIR%"
if not exist "%IIS_DIR%\po" mkdir "%IIS_DIR%\po"

echo Copying files...
xcopy /s /e /y /q %DEPLOY_DIR%\* "%IIS_DIR%\"

echo.
echo ==========================================
echo   Copy to IIS Complete!
echo ==========================================
echo.
echo Files at: %IIS_DIR%
echo.
echo Test URLs:
echo   http://192.168.0.131:1005/
echo   http://192.168.0.131:1005/po/
echo.
goto :end

:build_and_copy
call :build_all
echo.
echo Copying to IIS...
if not exist "%IIS_DIR%" mkdir "%IIS_DIR%"
xcopy /s /e /y /q %DEPLOY_DIR%\* "%IIS_DIR%\"
echo.
echo ==========================================
echo   Build + Copy Complete!
echo ==========================================
echo.
goto :end

:end
echo.
pause
