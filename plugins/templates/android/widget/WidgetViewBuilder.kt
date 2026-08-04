package com.rairc.mycalendarnote.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import com.rairc.mycalendarnote.R

object WidgetViewBuilder {

  fun update(
    context: Context,
    mgr: AppWidgetManager,
    appWidgetId: Int,
    compact: Boolean,
    dark: Boolean,
  ) {
    val themeKey = if (dark) "dark" else "light"
    val layout = if (compact) R.layout.widget_compact else R.layout.widget_medium
    val rv = RemoteViews(context.packageName, layout)
    val payload = WidgetPayloadStore.readPayload(context)

    if (payload == null) {
      bindOnboarding(context, rv, null, appWidgetId)
    } else {
      rv.setViewVisibility(R.id.month_title, View.VISIBLE)
      rv.setViewVisibility(R.id.month_stats, View.VISIBLE)
      rv.setTextViewText(R.id.brand, payload.brandTitle)
      rv.setTextViewText(R.id.month_title, payload.monthTitle)
      rv.setTextViewText(R.id.month_stats, payload.monthStats)
      val next = payload.next
      if (
        next != null &&
        (next.whenMs <= 0L || next.whenMs >= System.currentTimeMillis())
      ) {
        rv.setViewVisibility(R.id.next_label, View.VISIBLE)
        rv.setViewVisibility(R.id.next_meta, View.VISIBLE)
        rv.setViewVisibility(R.id.next_title, View.VISIBLE)
        rv.setTextViewText(R.id.next_label, payload.nextLabel)
        rv.setTextViewText(R.id.next_meta, next.meta)
        rv.setTextViewText(R.id.next_title, next.title)
      } else {
        rv.setViewVisibility(R.id.next_label, View.GONE)
        rv.setViewVisibility(R.id.next_meta, View.GONE)
        rv.setViewVisibility(R.id.next_title, View.GONE)
      }
      val listHint =
        if (compact) payload.listHintCompact else payload.listHintMedium
      rv.setTextViewText(R.id.list_hint, listHint)

      when (payload.phase) {
        "content" -> {
          rv.setViewVisibility(R.id.widget_empty_block, View.GONE)
          rv.setViewVisibility(R.id.widget_list, View.VISIBLE)
          rv.setViewVisibility(R.id.list_hint, View.VISIBLE)
          val svc = Intent(context, AgendaRemoteViewsService::class.java).apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            putExtra(AgendaRemoteViewsService.EXTRA_COMPACT, compact)
            putExtra(AgendaRemoteViewsService.EXTRA_WIDGET_THEME, themeKey)
            data = Uri.parse(
              "widget://${context.packageName}/agenda?id=$appWidgetId&rev=${SystemClock.elapsedRealtimeNanos()}"
            )
          }
          rv.setRemoteAdapter(R.id.widget_list, svc)
          rv.setEmptyView(R.id.widget_list, R.id.widget_empty_block)
        }
        else -> {
          rv.setViewVisibility(R.id.widget_list, View.GONE)
          rv.setViewVisibility(R.id.list_hint, View.GONE)
          rv.setViewVisibility(R.id.widget_empty_block, View.VISIBLE)
          rv.setTextViewText(R.id.empty_message, payload.hintEmpty)
        }
      }
      bindOpenApp(context, rv, payload.openAppUrl, appWidgetId)
    }
    val palette = WidgetPalettes.fromTheme(themeKey)
    rv.applyWidgetPalette(palette)
    mgr.updateAppWidget(appWidgetId, rv)
  }

  private fun bindOnboarding(
    context: Context,
    rv: RemoteViews,
    openUrl: String?,
    appWidgetId: Int,
  ) {
    rv.setViewVisibility(R.id.month_title, View.GONE)
    rv.setViewVisibility(R.id.month_stats, View.GONE)
    rv.setViewVisibility(R.id.next_label, View.GONE)
    rv.setViewVisibility(R.id.next_meta, View.GONE)
    rv.setViewVisibility(R.id.next_title, View.GONE)
    rv.setViewVisibility(R.id.widget_list, View.GONE)
    rv.setViewVisibility(R.id.list_hint, View.GONE)
    rv.setViewVisibility(R.id.widget_empty_block, View.VISIBLE)
    rv.setTextViewText(R.id.brand, "MyAgenda")
    rv.setTextViewText(
      R.id.empty_message,
      "Abra o app para ver a sua agenda e lembretes."
    )
    val url = openUrl ?: "mycalendarnote://"
    bindOpenApp(context, rv, url, appWidgetId)
  }

  private fun bindOpenApp(context: Context, rv: RemoteViews, url: String, appWidgetId: Int) {
    val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_IMMUTABLE
      } else 0
    val pi = PendingIntent.getActivity(context, appWidgetId + 7000, openIntent, flags)
    rv.setOnClickPendingIntent(R.id.widget_root, pi)
  }
}
