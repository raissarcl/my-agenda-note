package com.rairc.mycalendarnote.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.FileOutputStream

class WidgetSyncModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MyCalendarWidgetSync"

  @ReactMethod
  fun updateWidgetData(json: String) {
    val ctx = reactApplicationContext.applicationContext
    try {
      val f = WidgetPayloadStore.payloadFile(ctx)
      FileOutputStream(f).use { out ->
        out.write(json.toByteArray(Charsets.UTF_8))
      }
    } catch (_: Exception) {
      return
    }
    refreshAllWidgets(ctx)
  }

  companion object {
    private fun refreshVariant(
      context: Context,
      mgr: AppWidgetManager,
      cls: Class<*>,
      compact: Boolean,
      dark: Boolean,
    ) {
      val cn = ComponentName(context, cls)
      val ids = mgr.getAppWidgetIds(cn)
      for (id in ids) {
        WidgetViewBuilder.update(context, mgr, id, compact, dark)
        mgr.notifyAppWidgetViewDataChanged(
          intArrayOf(id),
          com.rairc.mycalendarnote.R.id.widget_list
        )
      }
    }

    fun refreshAllWidgets(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      refreshVariant(context, mgr, MyCalendarWidgetCompactLight::class.java, true, false)
      refreshVariant(context, mgr, MyCalendarWidgetCompactDark::class.java, true, true)
      refreshVariant(context, mgr, MyCalendarWidgetMediumLight::class.java, false, false)
      refreshVariant(context, mgr, MyCalendarWidgetMediumDark::class.java, false, true)
    }
  }
}
