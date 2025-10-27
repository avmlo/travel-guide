#!/bin/bash

# Urban Manual iOS App - Automated Setup Script
# This script helps set up the Xcode project structure

echo "🚀 Urban Manual iOS App Setup"
echo "================================"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed or not in PATH"
    echo "Please install Xcode from the App Store first"
    exit 1
fi

echo "✅ Xcode found: $(xcodebuild -version | head -n 1)"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$SCRIPT_DIR"

echo "📁 Source directory: $SOURCE_DIR"
echo ""

# Ask for project location
echo "Where do you want to create the Xcode project?"
echo "Press Enter to use Desktop, or type a custom path:"
read -r PROJECT_PARENT_DIR

if [ -z "$PROJECT_PARENT_DIR" ]; then
    PROJECT_PARENT_DIR="$HOME/Desktop"
fi

# Expand tilde
PROJECT_PARENT_DIR="${PROJECT_PARENT_DIR/#\~/$HOME}"

if [ ! -d "$PROJECT_PARENT_DIR" ]; then
    echo "❌ Directory does not exist: $PROJECT_PARENT_DIR"
    exit 1
fi

PROJECT_DIR="$PROJECT_PARENT_DIR/UrbanManualApp"

echo ""
echo "🎯 Will create project at: $PROJECT_DIR"
echo ""

# Check if project already exists
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Project directory already exists!"
    echo "Do you want to delete it and start fresh? (y/N)"
    read -r CONFIRM
    if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        rm -rf "$PROJECT_DIR"
        echo "✅ Deleted existing project"
    else
        echo "❌ Aborted"
        exit 1
    fi
fi

echo "📦 Creating Xcode project structure..."
mkdir -p "$PROJECT_DIR"

# Copy all source files
echo "📋 Copying source files..."

cp -r "$SOURCE_DIR/Models" "$PROJECT_DIR/" 2>/dev/null || echo "⚠️  Models directory not found"
cp -r "$SOURCE_DIR/Services" "$PROJECT_DIR/" 2>/dev/null || echo "⚠️  Services directory not found"
cp -r "$SOURCE_DIR/ViewModels" "$PROJECT_DIR/" 2>/dev/null || echo "⚠️  ViewModels directory not found"
cp -r "$SOURCE_DIR/Views" "$PROJECT_DIR/" 2>/dev/null || echo "⚠️  Views directory not found"
cp "$SOURCE_DIR/UrbanManualApp.swift" "$PROJECT_DIR/" 2>/dev/null || echo "⚠️  UrbanManualApp.swift not found"

echo ""
echo "✅ Files copied to: $PROJECT_DIR"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Open Xcode"
echo "2. File → New → Project"
echo "3. Choose: App (under iOS)"
echo "4. Fill in:"
echo "   - Product Name: UrbanManualApp"
echo "   - Interface: SwiftUI"
echo "   - Language: Swift"
echo "   - Use Core Data: NO"
echo "   - Include Tests: NO"
echo ""
echo "5. Save to: $PROJECT_PARENT_DIR"
echo "   (It will create UrbanManualApp folder)"
echo ""
echo "6. After Xcode creates the project:"
echo "   - Delete ContentView.swift"
echo "   - Drag these folders from Finder into Xcode:"
echo "     • Models/"
echo "     • Services/"
echo "     • ViewModels/"
echo "     • Views/"
echo "   - Replace UrbanManualApp.swift"
echo ""
echo "7. Add Supabase package:"
echo "   File → Add Package Dependencies"
echo "   URL: https://github.com/supabase/supabase-swift"
echo "   Version: 2.0.0"
echo ""
echo "8. Update Services/SupabaseService.swift with your credentials"
echo ""
echo "9. Add Info.plist permission:"
echo "   Privacy - Location When In Use Usage Description"
echo ""
echo "10. Build and Run! (Cmd+R)"
echo ""
echo "📂 Open project location?"
echo "(y/N)"
read -r OPEN_FINDER

if [ "$OPEN_FINDER" = "y" ] || [ "$OPEN_FINDER" = "Y" ]; then
    open "$PROJECT_PARENT_DIR"
fi

echo ""
echo "🎉 Setup files ready! Follow the steps above to create your Xcode project."
echo ""
