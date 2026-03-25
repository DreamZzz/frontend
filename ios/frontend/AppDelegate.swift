import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
#if canImport(WechatOpenSDK)
import WechatOpenSDK
#endif

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "frontend",
      in: window,
      launchOptions: launchOptions
    )

    registerWechatSDKIfNeeded()

    return true
  }

  func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
#if canImport(WechatOpenSDK)
    return WXApi.handleOpen(url, delegate: nil)
#else
    return false
#endif
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
#if canImport(WechatOpenSDK)
    return WXApi.handleOpenUniversalLink(userActivity, delegate: nil)
#else
    return false
#endif
  }

  private func registerWechatSDKIfNeeded() {
#if canImport(WechatOpenSDK)
    let appId = resolvedInfoString(forKey: "WechatAppID")
    guard !appId.isEmpty else {
      return
    }

    let universalLink = resolvedInfoString(forKey: "WechatUniversalLink")

    if universalLink.isEmpty {
      _ = WXApi.registerApp(appId)
    } else {
      _ = WXApi.registerApp(appId, universalLink: universalLink)
    }
#endif
  }

  private func resolvedInfoString(forKey key: String) -> String {
    let value = (Bundle.main.object(forInfoDictionaryKey: key) as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

    guard !value.isEmpty, !value.hasPrefix("$(") else {
      return ""
    }

    return value
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  private func embeddedBundleURL() -> URL? {
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    #if targetEnvironment(simulator)
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      // Physical-device validation should not depend on Metro being reachable.
      return embeddedBundleURL()
        ?? RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #endif
#else
    return embeddedBundleURL()
#endif
  }
}

#if canImport(WechatOpenSDK)
extension AppDelegate: WXApiDelegate {}
#endif
