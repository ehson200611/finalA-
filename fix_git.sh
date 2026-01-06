#!/bin/bash
# Скрипт для исправления проблемы с встроенными git репозиториями

echo "Исправление проблемы с встроенными git репозиториями..."
echo ""

# Удаление встроенных .git директорий
if [ -d "content_api/.git" ]; then
    echo "Удаление .git из content_api..."
    rm -rf content_api/.git
    echo "✓ Удалено"
fi

if [ -d "frontenda/Learning-center-A-Client/.git" ]; then
    echo "Удаление .git из frontenda/Learning-center-A-Client..."
    rm -rf frontenda/Learning-center-A-Client/.git
    echo "✓ Удалено"
fi

# Удаление из git индекса, если уже добавлено
echo ""
echo "Очистка git индекса..."
git rm --cached -r content_api 2>/dev/null || true
git rm --cached -r frontenda/Learning-center-A-Client 2>/dev/null || true

echo ""
echo "✓ Готово! Теперь выполните:"
echo "  git add ."
echo "  git commit -m 'Add project files'"
echo "  git push"

