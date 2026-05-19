package com.rairc.mycalendarnote.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context

class MyCalendarWidgetCompactLight : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    for (id in appWidgetIds) {
      WidgetViewBuilder.update(context, appWidgetManager, id, compact = true, dark = false)
    }
  }
}
