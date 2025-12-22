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
set "BACKUP_DIR=C:\inetpub\Web PO_backup"
set PORTAL_DIR=portal
set PO_DIR=Q-ERPc\purchase\purchase-order
set DASHBOARD_DIR=general\dashboard

if "%1"=="all" goto :build_all
if "%1"=="portal" goto :build_portal
if "%1"=="po" goto :build_po
if "%1"=="dashboard" goto :build_dashboard
if "%1"=="copy" goto :copy_to_iis
goto :menu

:menu
echo Select mode:
echo   1. Build All (Portal + PO + Dashboard)
echo   2. Build Portal only
echo   3. Build Purchase Order only
echo   4. Build Dashboard only
echo   5. Copy to IIS (C:\inetpub\Web PO)
echo   6. Build All + Copy to IIS
echo   7. Exit
echo.
set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto :build_all
if "%choice%"=="2" goto :build_portal
if "%choice%"=="3" goto :build_po
if "%choice%"=="4" goto :build_dashboard
if "%choice%"=="5" goto :copy_to_iis
if "%choice%"=="6" goto :build_and_copy
if "%choice%"=="7" goto :end
goto :menu

:build_all
echo.
echo [1/5] Building Dashboard...
cd %DASHBOARD_DIR%
call npx vite build --config vite.config.prod.ts
if errorlevel 1 (
    echo ERROR: Build Dashboard failed!
    cd ..\..
    pause
    goto :end
)
cd ..\..

echo.
echo [2/5] Building Purchase Order...
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
echo [3/5] Building Portal...
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
echo [4/5] Creating Deploy folder...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%
mkdir "%DEPLOY_DIR%\po"
mkdir "%DEPLOY_DIR%\dashboard"

echo.
echo [5/5] Copying files...
xcopy /s /e /y /q %PORTAL_DIR%\dist\* %DEPLOY_DIR%\
copy /y deploy\web.config %DEPLOY_DIR%\web.config >nul

xcopy /s /e /y /q %PO_DIR%\dist\* "%DEPLOY_DIR%\po\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\po\web.config" >nul

xcopy /s /e /y /q %DASHBOARD_DIR%\dist\* "%DEPLOY_DIR%\dashboard\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\dashboard\web.config" >nul

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
echo   +-- dashboard\        (Dashboard)
echo.
echo URLs after deploy:
echo   Portal:    http://192.168.0.131:1005/
echo   PO:        http://192.168.0.131:1005/po/
echo   Dashboard: http://192.168.0.131:1005/dashboard/
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

:build_dashboard
echo.
echo Building Dashboard...
cd %DASHBOARD_DIR%
call npx vite build --config vite.config.prod.ts
cd ..\..

echo.
echo Copying Dashboard files...
if not exist "%DEPLOY_DIR%\dashboard" mkdir "%DEPLOY_DIR%\dashboard"
xcopy /s /e /y /q %DASHBOARD_DIR%\dist\* "%DEPLOY_DIR%\dashboard\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\dashboard\web.config" >nul

echo.
echo Build Dashboard Complete!
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

REM Create backup directory if not exists
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Backup existing IIS folder if exists
if exist "%IIS_DIR%" (
    echo.
    echo [Backup] Creating backup of existing IIS files...

    REM Generate timestamp for backup filename
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set BACKUP_NAME=WebPO_%datetime:~0,8%_%datetime:~8,6%.zip

    echo [Backup] Zipping to: %BACKUP_DIR%\%BACKUP_NAME%

    REM Use PowerShell to create zip
    powershell -Command "Compress-Archive -Path '%IIS_DIR%\*' -DestinationPath '%BACKUP_DIR%\%BACKUP_NAME%' -Force"

    if errorlevel 1 (
        echo ERROR: Backup failed!
        pause
        goto :end
    )

    echo [Backup] Backup created successfully!
    echo.
    echo [Cleanup] Removing old files from IIS...
    rmdir /s /q "%IIS_DIR%"
)

REM Create fresh IIS directory
mkdir "%IIS_DIR%"

echo.
echo [Deploy] Copying new files to IIS...
xcopy /s /e /y /q %DEPLOY_DIR%\* "%IIS_DIR%\"

echo.
echo ==========================================
echo   Copy to IIS Complete!
echo ==========================================
echo.
echo Backup:   %BACKUP_DIR%\%BACKUP_NAME%
echo Deployed: %IIS_DIR%
echo.
echo Test URLs:
echo   http://192.168.0.131:1005/
echo   http://192.168.0.131:1005/po/
echo   http://192.168.0.131:1005/dashboard/
echo.
goto :end

:build_and_copy
echo.
echo [1/5] Building Dashboard...
cd %DASHBOARD_DIR%
call npx vite build --config vite.config.prod.ts
if errorlevel 1 (
    echo ERROR: Build Dashboard failed!
    cd ..\..
    pause
    goto :end
)
cd ..\..

echo.
echo [2/5] Building Purchase Order...
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
echo [3/5] Building Portal...
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
echo [4/5] Creating Deploy folder...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%
mkdir "%DEPLOY_DIR%\po"
mkdir "%DEPLOY_DIR%\dashboard"

echo.
echo [5/5] Copying files...
xcopy /s /e /y /q %PORTAL_DIR%\dist\* %DEPLOY_DIR%\
copy /y deploy\web.config %DEPLOY_DIR%\web.config >nul

xcopy /s /e /y /q %PO_DIR%\dist\* "%DEPLOY_DIR%\po\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\po\web.config" >nul

xcopy /s /e /y /q %DASHBOARD_DIR%\dist\* "%DEPLOY_DIR%\dashboard\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\dashboard\web.config" >nul

echo.
echo Build Complete! Now copying to IIS...
goto :copy_to_iis

:end
echo.
pause
