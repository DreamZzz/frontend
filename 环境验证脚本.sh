#!/bin/bash

echo "🧪 前端Bug修复环境验证脚本"
echo "========================================"

# 检查后端服务
echo "1. 检查后端服务状态..."
if curl -s --head http://localhost:8080/api/posts | grep "200 OK" > /dev/null; then
    echo "   ✅ 后端服务运行正常 (端口 8080)"
else
    echo "   ⚠️  后端服务可能未运行"
    echo "   运行命令: cd /Users/qiang/social-app-ios/backend && mvn spring-boot:run -DskipTests"
fi

# 检查Node.js版本
echo "2. 检查Node.js版本..."
REQUIRED_NODE="22.11.0"
CURRENT_NODE=$(node --version | sed 's/v//')
if [ "$(printf '%s\n' "$REQUIRED_NODE" "$CURRENT_NODE" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
    echo "   ✅ Node.js 版本符合要求 ($CURRENT_NODE >= $REQUIRED_NODE)"
else
    echo "   ⚠️  Node.js 版本过低 ($CURRENT_NODE < $REQUIRED_NODE)"
fi

# 检查前端依赖
echo "3. 检查前端依赖安装..."
if [ -d "node_modules" ] && [ -f "package.json" ]; then
    echo "   ✅ 前端依赖目录存在"
    # 检查关键依赖
    if grep -q "@react-native-async-storage/async-storage" package.json; then
        echo "   ✅ 关键依赖已配置"
    fi
else
    echo "   ⚠️  前端依赖可能未安装"
    echo "   运行命令: npm install"
fi

# 检查iOS项目配置
echo "4. 检查iOS项目配置..."
if [ -d "ios/Pods" ]; then
    echo "   ✅ CocoaPods依赖已安装"
else
    echo "   ⚠️  CocoaPods依赖未安装"
    echo "   运行命令: cd ios && pod install"
fi

# 检查Xcode可用性
echo "5. 检查Xcode可用性..."
if command -v xcodebuild > /dev/null 2>&1; then
    XCODE_VERSION=$(xcodebuild -version | head -n1)
    echo "   ✅ Xcode可用: $XCODE_VERSION"
else
    echo "   ❌ Xcode未安装"
fi

# 检查模拟器
echo "6. 检查iOS模拟器..."
if command -v xcrun > /dev/null 2>&1; then
    SIM_COUNT=$(xcrun simctl list devices | grep -c "(Booted)")
    if [ "$SIM_COUNT" -gt 0 ]; then
        echo "   ✅ 有模拟器正在运行"
    else
        echo "   ℹ️  无运行中的模拟器，但可启动"
    fi
else
    echo "   ⚠️  无法检查模拟器状态"
fi

# 检查修复文件
echo "7. 检查修复文件状态..."
echo "   - AppNavigator.js (返回按钮):"
if grep -q "headerBackTitle: '返回'" src/navigation/AppNavigator.js; then
    echo "      ✅ 已配置中文返回按钮"
else
    echo "      ❌ 未找到中文返回按钮配置"
fi

echo "   - CreatePostScreen.js (TextInput):"
if grep -q "autoCorrect\|spellCheck\|autoCapitalize" src/screens/CreatePostScreen.js; then
    echo "      ⚠️  仍有可能干扰中文IME的属性"
else
    echo "      ✅ TextInput属性已简化"
fi

echo "   - DetailScreen.js (TextInput):"
if grep -q "autoCorrect\|spellCheck\|autoCapitalize" src/screens/DetailScreen.js; then
    echo "      ⚠️  仍有可能干扰中文IME的属性"
else
    echo "      ✅ TextInput属性已简化"
fi

echo "   - api.js (评论API):"
if grep -q "createComment.*params.*postId.*userId" src/services/api.js; then
    echo "      ✅ 评论API参数结构正确"
else
    echo "      ❌ 评论API参数结构可能有问题"
fi

echo ""
echo "📋 验证总结"
echo "========================================"
echo "环境检查完成，请按照以下步骤进行功能测试:"
echo ""
echo "1. 确保后端运行: cd ../backend && mvn spring-boot:run -DskipTests"
echo "2. 启动前端服务: npm start (保持运行)"
echo "3. 启动iOS应用: npm run ios"
echo "4. 执行功能测试（参考功能验证指南.md）"
echo ""
echo "💡 提示：完整测试指南请查看 功能验证指南.md 文件"