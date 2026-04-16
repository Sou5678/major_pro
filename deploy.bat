@echo off
REM ResumeIQ Deployment Script for Windows
REM This script prepares and deploys the application

echo.
echo ========================================
echo   ResumeIQ Deployment Script
echo ========================================
echo.

REM Step 1: Clean build artifacts
echo [1/6] Cleaning build artifacts...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo [OK] Build artifacts cleaned
echo.

REM Step 2: Install dependencies
echo [2/6] Installing dependencies...
call npm ci
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Run type check
echo [3/6] Running type check...
call npm run typecheck
if errorlevel 1 (
    echo [WARNING] Type check failed, but continuing...
)
echo.

REM Step 4: Build application
echo [4/6] Building application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build successful
echo.

REM Step 5: Test build locally (optional)
echo [5/6] Would you like to test the build locally? (Y/N)
set /p test_local=
if /i "%test_local%"=="Y" (
    echo Starting local server...
    echo Visit http://localhost:3000 to test
    echo Press Ctrl+C when done testing
    call npm run start
)

REM Step 6: Git operations
echo.
echo [6/6] Git operations
echo Current git status:
git status --short

echo.
echo Would you like to commit and push changes? (Y/N)
set /p do_commit=

if /i "%do_commit%"=="Y" (
    echo Enter commit message:
    set /p commit_message=
    
    git add .
    git commit -m "%commit_message%"
    git push origin main
    
    if errorlevel 1 (
        echo [ERROR] Failed to push changes
        pause
        exit /b 1
    )
    echo [OK] Changes pushed to repository
)

echo.
echo ========================================
echo   Deployment preparation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to your deployment platform (Vercel/Netlify)
echo 2. Clear the build cache
echo 3. Trigger a new deployment
echo 4. Verify environment variables are set
echo 5. Test the deployed site
echo.
echo Verification URLs:
echo - Health: https://your-domain.com/api/health
echo - Version: https://your-domain.com/api/version
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
