#!/bin/bash

# Pages 폴더의 모든 tsx 파일에 useTranslation import 추가
PAGES_DIR="/Users/moska/code/paperclip/ui/src/pages"
COMPONENTS_DIR="/Users/moska/code/paperclip/ui/src/components"

# useTranslation import가 없는 파일에 추가
add_import() {
    local file=$1
    
    # 이미 useTranslation이 있으면 스킵
    if grep -q "useTranslation" "$file"; then
        echo "SKIP: $file (already has useTranslation)"
        return
    fi
    
    # react-i18next import 추가
    if grep -q "from \"react\"" "$file"; then
        sed -i '' 's/from "react";/from "react";\nimport { useTranslation } from "react-i18next";/' "$file"
        echo "ADDED: $file"
    elif grep -q "from '@/lib/router'" "$file"; then
        sed -i '' 's/from "@\/lib\/router";/from "@\/lib\/router";\nimport { useTranslation } from "react-i18next";/' "$file"
        echo "ADDED: $file"
    else
        echo "MANUAL: $file (need manual import)"
    fi
}

echo "=== Adding i18n imports ==="

# Pages
for file in "$PAGES_DIR"/*.tsx; do
    [ -f "$file" ] && add_import "$file"
done

echo "Done!"
