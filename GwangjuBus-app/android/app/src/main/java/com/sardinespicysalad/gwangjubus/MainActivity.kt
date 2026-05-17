package com.sardinespicysalad.gwangjubus

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    
    // 하단 시스템 네비게이션 바를 투명하게 설정 (콘텐츠가 뒤로 비침)
    window.navigationBarColor = Color.TRANSPARENT
    
    // 네비게이션 바 아이콘(홈, 뒤로가기 등)을 어둡게 설정 (Android 8.0 Oreo 이상 지원)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        window.decorView.systemUiVisibility = window.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
    }
    
    // 화면의 최상위 뷰(Root View)를 가져옵니다.
    val rootView = findViewById<View>(android.R.id.content)
    val density = resources.displayMetrics.density
    val topPaddingInPx = (20 * density).toInt() // 상단 20dp 여백
    
    // 상단에만 여백을 적용하고, 하단 패딩은 0으로 설정하여 홈 바 영역까지 확장되게 합니다.
    rootView.setPadding(0, topPaddingInPx, 0, 0)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "GwangjuBus"
  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
