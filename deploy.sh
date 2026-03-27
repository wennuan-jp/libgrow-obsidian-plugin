#!/bin/bash

# Define source and target paths
PROJECT_ROOT="/Users/wennuan/dev/projects/libgrow-obsidian-plugin"
TARGET_DIR="/Users/wennuan/Documents/Way2M/.obsidian/plugins/libgrow-obsidian-plugin"

# Go to project root
cd "$PROJECT_ROOT"

echo "🚀 Building libgrow-obsidian-plugin..."

# Run build
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting."
    exit 1
fi

echo "📂 Ensuring target directory exists..."
mkdir -p "$TARGET_DIR"

echo "📦 Copying files to Obsidian plugin folder..."

# List of files to copy
FILES=("main.js" "manifest.json" "styles.css")

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        cp "$FILE" "$TARGET_DIR/"
        echo "✅ Copied $FILE"
    else
        echo "⚠️  Warning: $FILE not found, skipping."
    fi
done

echo "🎉 Done! Please reload the plugin in Obsidian (Settings -> Community plugins -> libgrow -> Reload)."
